'use client';

import { useEffect, useCallback, useOptimistic, startTransition, useReducer } from 'react';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchButton } from '@/components/ui/search-button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListBlobs } from '@/hooks/useListBlobs';
import { useDeleteBlob } from '@/hooks/useDeleteBlob';
import { useCopyBlob } from '@/hooks/useCopyBlob';
import { useBlobMetadata } from '@/hooks/useBlobMetadata';
import { MetadataDialog } from '@/components/gallery/MetadataDialog';
import {
  RefreshCw,
  Folder,
  FolderOpen,
  Grid3X3,
  List,
  ChevronRight,
  Home,
  Download,
  Eye,
  Copy,
  Trash2,
  Info,
  Files,
  MoreHorizontal
} from 'lucide-react';
import type { HowTo, WithContext } from 'schema-dts';
import { toast } from 'sonner';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { BlobItem } from '@/hooks/useListBlobs';

// React 19 useReducer UI state management
interface UIState {
  currentFolder: string;
  viewMode: 'grid' | 'list';
  displayMode: 'expanded' | 'folded';
  selectedFile: BlobItem | null;
  metadataFile: BlobItem | null;
}

type UIAction =
  | { type: 'SET_CURRENT_FOLDER'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_DISPLAY_MODE'; payload: 'expanded' | 'folded' }
  | { type: 'SET_SELECTED_FILE'; payload: BlobItem | null }
  | { type: 'SET_METADATA_FILE'; payload: BlobItem | null };

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'SET_CURRENT_FOLDER':
      return { ...state, currentFolder: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_DISPLAY_MODE':
      return { ...state, displayMode: action.payload };
    case 'SET_SELECTED_FILE':
      return { ...state, selectedFile: action.payload };
    case 'SET_METADATA_FILE':
      return { ...state, metadataFile: action.payload };
    default:
      return state;
  }
}

export default function GalleryPage() {
  const searchParams = useSearchParams();
  const searchPrefix = searchParams.get('prefix') || '';

  // React 19 useReducer for unified UI state management
  const [uiState, dispatch] = useReducer(uiReducer, {
    currentFolder: '',
    viewMode: 'grid',
    displayMode: 'folded',
    selectedFile: null,
    metadataFile: null,
  });

  const { currentFolder, viewMode, displayMode, selectedFile, metadataFile } = uiState;

  const {
    isLoading,
    error,
    data,
    allBlobs,
    loadMore,
    refresh
  } = useListBlobs();

  // React 19 useOptimistic for instant delete and copy feedback
  const [optimisticBlobs, updateOptimisticBlobs] = useOptimistic(
    allBlobs,
    (state, action: { type: 'delete'; url: string } | { type: 'add'; blob: BlobItem }) => {
      if (action.type === 'delete') {
        return state.filter(blob => blob.url !== action.url);
      } else if (action.type === 'add') {
        return [action.blob, ...state];
      }
      return state;
    }
  );

  const { deleteFile } = useDeleteBlob();
  const { copyBlob } = useCopyBlob();
  const { getMetadata, isLoading: isLoadingMetadata, metadata, error: metadataError } = useBlobMetadata();

  const handleRefresh = useCallback(async () => {
    try {
      const effectivePrefix = searchPrefix.trim() || currentFolder || undefined;
      await refresh({
        prefix: effectivePrefix,
        mode: displayMode,
        limit: 50,
      });
    } catch {
      toast.error('Failed to load blobs');
    }
  }, [refresh, searchPrefix, currentFolder, displayMode]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleFolderNavigation = async (folderPath: string) => {
    dispatch({ type: 'SET_CURRENT_FOLDER', payload: folderPath });
    try {
      await refresh({
        prefix: folderPath || undefined,
        mode: displayMode,
        limit: 50,
      });
    } catch {
      toast.error('Failed to navigate to folder');
    }
  };

  const handleLoadMore = async () => {
    try {
      const effectivePrefix = searchPrefix.trim() || currentFolder || undefined;
      await loadMore({
        prefix: effectivePrefix,
        mode: displayMode,
        limit: 50,
      });
    } catch {
      toast.error('Failed to load more blobs');
    }
  };

  const handleDeleteFile = async (file: BlobItem) => {
    const fileName = file.pathname.split('/').pop() || 'file';

    // React 19 optimistic delete - remove file immediately from UI
    startTransition(() => {
      updateOptimisticBlobs({ type: 'delete', url: file.url });
    });

    const toastId = toast.loading(`Deleting ${fileName}...`);

    try {
      await deleteFile(file.url);
      toast.success(`Successfully deleted ${fileName}!`, { id: toastId });
      // Refresh to sync with server state
      await handleRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      toast.error(`Failed to delete file: ${errorMessage}`, { id: toastId });
      // The optimistic update will be reverted automatically when refresh happens
      await handleRefresh();
    }
  };

  const handleCopyFile = async (file: BlobItem) => {
    const originalName = file.pathname.split('/').pop() || 'file';
    const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    const nameWithoutExtension = originalName.replace(`.${extension}`, '');
    const newPathname = `${file.pathname.replace(originalName, '')}${nameWithoutExtension}-copy${extension ? `.${extension}` : ''}`;

    // React 19 optimistic copy - show duplicate immediately in UI
    const optimisticCopy: BlobItem = {
      ...file,
      pathname: newPathname,
      url: `pending-copy://${newPathname}`,
      downloadUrl: `pending-copy://${newPathname}`,
      uploadedAt: new Date(),
    };

    startTransition(() => {
      updateOptimisticBlobs({ type: 'add', blob: optimisticCopy });
    });

    const toastId = toast.loading(`Duplicating ${originalName}...`);

    try {
      await copyBlob(file.url, newPathname, {
        addRandomSuffix: true,
      });
      toast.success(`Successfully duplicated ${originalName}!`, { id: toastId });
      await handleRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Copy failed';
      toast.error(`Failed to duplicate file: ${errorMessage}`, { id: toastId });
      // The optimistic update will be reverted automatically when refresh happens
      await handleRefresh();
    }
  };

  const handleGetMetadata = async (file: BlobItem) => {
    dispatch({ type: 'SET_METADATA_FILE', payload: file });
    const toastId = toast.loading(`Getting metadata for ${file.pathname.split('/').pop()}...`);
    
    try {
      await getMetadata(file.url);
      toast.success(`Metadata loaded successfully!`, { id: toastId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get metadata';
      toast.error(`Failed to get metadata: ${errorMessage}`, { id: toastId });
      dispatch({ type: 'SET_METADATA_FILE', payload: null });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('URL copied to clipboard!');
    } catch {
      toast.error('Failed to copy URL to clipboard');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileType = (pathname: string) => {
    const extension = pathname.split('.').pop()?.toLowerCase() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension)) {
      return 'image';
    }
    
    if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v'].includes(extension)) {
      return 'video';
    }
    
    if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(extension)) {
      return 'audio';
    }
    
    if (extension === 'pdf') {
      return 'pdf';
    }
    
    if (['txt', 'md', 'json', 'xml', 'csv', 'log', 'yml', 'yaml'].includes(extension)) {
      return 'text';
    }
    
    return 'file';
  };

  const renderFilePreview = (file: BlobItem) => {
    const fileType = getFileType(file.pathname);

    switch (fileType) {
      case 'image':
        return (
          <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden relative">
            <Image
              src={file.url}
              alt={file.pathname}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        );
      default:
        return (
          <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-2xl mb-2">📄</div>
              <div className="text-sm">{fileType.toUpperCase()}</div>
            </div>
          </div>
        );
    }
  };

  const breadcrumbs = currentFolder ? currentFolder.split('/').filter(Boolean) : [];

  const galleryHowToSchema: WithContext<HowTo> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Manage Files in Vercel Blob Gallery',
    description: 'Learn to browse, search, copy, delete, and organize files in the Vercel Blob file gallery interface',
    image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image',
    totalTime: 'PT3M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Web Browser',
        description: 'Modern web browser with JavaScript support'
      }
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Browse Files',
        text: 'View all uploaded files in grid or list format with folder navigation support',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      },
      {
        '@type': 'HowToStep',
        name: 'Search and Filter',
        text: 'Use the search bar to find specific files by name or filter by folder path',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      },
      {
        '@type': 'HowToStep',
        name: 'Preview Files',
        text: 'Click on files to preview images and view file details in an expanded view',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      },
      {
        '@type': 'HowToStep',
        name: 'Copy File URLs',
        text: 'Copy public URLs of files to share or embed them in other applications',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      },
      {
        '@type': 'HowToStep',
        name: 'Delete Files',
        text: 'Remove unwanted files from your blob storage with confirmation dialogs',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      },
      {
        '@type': 'HowToStep',
        name: 'View Metadata',
        text: 'Access detailed file information including size, upload date, and technical metadata',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      }
    ]
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(galleryHowToSchema).replace(/</g, '\\u003c'),
        }}
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Blob Gallery</h1>
        <p className="text-muted-foreground">
          Browse and manage all blobs in your Vercel Blob store
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Browse Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFolderNavigation('')}
              className="p-0 h-auto font-normal"
            >
              <Home className="w-4 h-4 mr-1" />
              Root
            </Button>
            {breadcrumbs.map((folder, index) => {
              const fullPath = breadcrumbs.slice(0, index + 1).join('/');
              return (
                <div key={index} className="flex items-center">
                  <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFolderNavigation(fullPath)}
                    className="p-0 h-auto font-normal"
                  >
                    {folder}
                  </Button>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <Form action="/gallery" className="flex gap-2">
                <Input
                  name="prefix"
                  placeholder="Search by prefix..."
                  defaultValue={searchPrefix}
                />
                <SearchButton />
              </Form>
            </div>

            <div className="flex gap-2">
              <Select value={displayMode} onValueChange={(value: 'expanded' | 'folded') => dispatch({ type: 'SET_DISPLAY_MODE', payload: value })}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="folded">Folded</SelectItem>
                  <SelectItem value="expanded">Expanded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => dispatch({ type: 'SET_VIEW_MODE', payload: value })}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">
                    <Grid3X3 className="w-4 h-4" />
                  </SelectItem>
                  <SelectItem value="list">
                    <List className="w-4 h-4" />
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="mb-6 border-destructive">
          <CardContent className="p-4">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {data?.folders && data.folders.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Folder className="w-5 h-5 mr-2" />
              Folders ({data.folders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data.folders.map((folder, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start h-auto p-4"
                  onClick={() => handleFolderNavigation(folder)}
                >
                  <FolderOpen className="w-5 h-5 mr-2" />
                  <span className="truncate">{folder.split('/').pop()}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Blobs ({optimisticBlobs.length})
                {data?.hasMore && <span className="text-muted-foreground ml-2">(+more available)</span>}
              </CardTitle>
              <CardDescription>
                {currentFolder ? `Files in folder: ${currentFolder}` : 'All files in your blob store'}
              </CardDescription>
            </div>
            {data?.hasMore && (
              <Button onClick={handleLoadMore} disabled={isLoading}>
                Load More
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {optimisticBlobs.length === 0 && !isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="text-4xl mb-4">📁</div>
                <p>No blobs found.</p>
                <p className="text-sm mt-2">Upload some files to see them here!</p>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              : "space-y-2"
            }>
              {optimisticBlobs.map((file, index) => (
                <Card key={`${file.url}-${index}`} className={viewMode === 'grid' ? "overflow-hidden" : ""}>
                  <CardContent className={viewMode === 'grid' ? "p-4" : "p-3"}>
                    {viewMode === 'grid' ? (
                      <>
                        {renderFilePreview(file)}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium text-sm truncate flex-1 mr-2">
                              {file.pathname.split('/').pop() || file.pathname}
                            </h3>
                            <Badge variant="secondary" className="text-xs">
                              {getFileType(file.pathname)}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>{formatFileSize(file.size)}</div>
                            <div>{formatDate(file.uploadedAt.toISOString())}</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {file.pathname.split('/').pop() || file.pathname}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {formatDate(file.uploadedAt.toISOString())}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs ml-2">
                          {getFileType(file.pathname)}
                        </Badge>
                      </div>
                    )}
                  </CardContent>

                  <div className="px-4 pb-4 flex flex-wrap gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => dispatch({ type: 'SET_SELECTED_FILE', payload: file })}>
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle className="text-base font-medium">
                            {selectedFile?.pathname}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-auto">
                          {selectedFile && renderFilePreview(selectedFile)}
                        </div>
                      </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => window.open(file.downloadUrl, '_blank')}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGetMetadata(file)}>
                          <Info className="w-4 h-4 mr-2" />
                          Metadata
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyFile(file)}>
                          <Files className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFile(file)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MetadataDialog
        isOpen={!!metadataFile}
        onClose={() => dispatch({ type: 'SET_METADATA_FILE', payload: null })}
        metadataFile={metadataFile}
        isLoadingMetadata={isLoadingMetadata}
        metadata={metadata}
        metadataError={metadataError}
        formatFileSize={formatFileSize}
        formatDate={formatDate}
      />
    </div>
  );
}