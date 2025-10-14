'use client';

import { useEffect, useCallback, useOptimistic, startTransition, useReducer, useRef, useMemo, useState } from 'react';
import Form from 'next/form';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchButton } from '@/components/ui/search-button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type BlobItem, type ListBlobsResult } from '@/hooks/useListBlobs';
import { useDeleteBlob } from '@/hooks/useDeleteBlob';
import { useCopyBlob } from '@/hooks/useCopyBlob';
import { useBlobMetadata } from '@/hooks/useBlobMetadata';
import { MetadataDialog } from '@/components/gallery/MetadataDialog';
import {
  RefreshCw,
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

// React 19 useReducer UI state management
interface UIState {
  currentFolder: string;
  viewMode: 'grid' | 'list';
  displayMode: 'expanded' | 'folded';
  sortBy: 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc';
  selectedFile: BlobItem | null;
  metadataFile: BlobItem | null;
}

type UIAction =
  | { type: 'SET_CURRENT_FOLDER'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'grid' | 'list' }
  | { type: 'SET_DISPLAY_MODE'; payload: 'expanded' | 'folded' }
  | { type: 'SET_SORT_BY'; payload: 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc' }
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
    case 'SET_SORT_BY':
      return { ...state, sortBy: action.payload };
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
  const initialLoadRef = useRef(false);
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [localBlobs, setLocalBlobs] = useState<BlobItem[]>([]);
  const [displayedBlobsCount, setDisplayedBlobsCount] = useState(50);

  // React 19 useReducer for unified UI state management
  const [uiState, dispatch] = useReducer(uiReducer, {
    currentFolder: '',
    viewMode: 'grid',
    displayMode: 'folded',
    sortBy: 'newest',
    selectedFile: null,
    metadataFile: null,
  });

  const { currentFolder, viewMode, displayMode, sortBy, selectedFile, metadataFile } = uiState;

  // We're managing blobs manually with localBlobs, so we don't need the hook's state
  // const { error, data, refresh } = useListBlobs();

  // Filter and sort blobs based on search term and sort option
  const sortedAllBlobs = useMemo(() => {
    let blobs = [...localBlobs];

    // Client-side filtering by search term (matches anywhere in pathname)
    const searchTerm = searchPrefix.trim().toLowerCase();
    if (searchTerm) {
      blobs = blobs.filter(blob =>
        blob.pathname.toLowerCase().includes(searchTerm)
      );
    }

    // Sort the filtered results
    switch (sortBy) {
      case 'newest':
        // Newest first: larger timestamps come first (descending)
        return blobs.sort((a, b) => {
          const timeA = a.uploadedAt.getTime();
          const timeB = b.uploadedAt.getTime();
          return timeB - timeA; // b - a = descending (newest first)
        });
      case 'oldest':
        // Oldest first: smaller timestamps come first (ascending)
        return blobs.sort((a, b) => {
          const timeA = a.uploadedAt.getTime();
          const timeB = b.uploadedAt.getTime();
          return timeA - timeB; // a - b = ascending (oldest first)
        });
      case 'name-asc':
        return blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
      case 'name-desc':
        return blobs.sort((a, b) => b.pathname.localeCompare(a.pathname));
      case 'size-asc':
        return blobs.sort((a, b) => a.size - b.size);
      case 'size-desc':
        return blobs.sort((a, b) => b.size - a.size);
      default:
        return blobs;
    }
  }, [localBlobs, sortBy, searchPrefix]);

  // Slice sorted blobs to show only the displayed count
  const displayedSortedBlobs = useMemo(() => {
    return sortedAllBlobs.slice(0, displayedBlobsCount);
  }, [sortedAllBlobs, displayedBlobsCount]);

  // React 19 useOptimistic for instant delete and copy feedback
  const [sortedBlobs, updateOptimisticBlobs] = useOptimistic(
    displayedSortedBlobs,
    (state, action: { type: 'delete'; url: string } | { type: 'add'; blob: BlobItem }) => {
      if (action.type === 'delete') {
        return state.filter(blob => blob.url !== action.url);
      } else if (action.type === 'add') {
        return [action.blob, ...state];
      }
      return state;
    }
  );

  // Check if there are more blobs to load
  const hasMore = displayedBlobsCount < sortedAllBlobs.length;

  const { deleteFile } = useDeleteBlob();
  const { copyBlob } = useCopyBlob();
  const { getMetadata, isLoading: isLoadingMetadata, metadata, error: metadataError } = useBlobMetadata();

  const handleRefresh = useCallback(async () => {
    setIsBulkLoading(true);
    setDisplayedBlobsCount(50); // Reset to show only first 50

    // Only use currentFolder as a prefix filter, not the search term
    const effectivePrefix = currentFolder || undefined;

    // Accumulate all blobs locally first to avoid re-renders
    const accumulatedBlobs: BlobItem[] = [];
    let cursor: string | undefined = undefined;
    let hasMore = true;

    // Fetch all pages
    while (hasMore) {
      const params = new URLSearchParams();
      params.append('limit', '50');
      if (effectivePrefix) params.append('prefix', effectivePrefix);
      if (cursor) params.append('cursor', cursor);
      if (displayMode) params.append('mode', displayMode);

      const response = await fetch(`/api/list?${params.toString()}`).catch((err) => {
        console.error('Fetch failed:', err);
        toast.error('Network error: Failed to connect to the server');
        setIsBulkLoading(false);
        return null;
      });

      if (!response) return;

      // Always parse the response, whether ok or not
      const data = await response.json().catch(() => ({ error: 'Failed to parse response' }));

      if (!response.ok) {
        // Handle missing token error gracefully - show toast and stop loading
        if (data.isTokenMissing) {
          toast.error(data.error, {
            duration: 10000,
            description: 'This is required for production builds. Check your .env.local file or Vercel environment variables.',
          });
          setIsBulkLoading(false);
          return;
        }

        // For other errors, show toast and stop
        toast.error(data.error || 'Failed to list blobs');
        setIsBulkLoading(false);
        return;
      }

      const result: ListBlobsResult = data;

      // Convert uploadedAt strings to Date objects
      const processedBlobs: BlobItem[] = result.blobs.map((blob) => ({
        ...blob,
        uploadedAt: new Date(blob.uploadedAt),
      }));

      accumulatedBlobs.push(...processedBlobs);
      cursor = result.cursor;
      hasMore = result.hasMore;

      console.log(`Loaded page with ${processedBlobs.length} blobs, total: ${accumulatedBlobs.length}, hasMore: ${hasMore}`);
    }

    console.log(`Finished loading all ${accumulatedBlobs.length} blobs`);

    // Update local state once with all blobs
    setLocalBlobs(accumulatedBlobs);
    setIsBulkLoading(false);
  }, [currentFolder, displayMode]);

  useEffect(() => {
    // Prevent double loading in React Strict Mode
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    // Always load all blobs on initial mount (search filtering happens client-side)
    // Use startTransition to avoid cascading renders warning in React 19
    startTransition(() => {
      handleRefresh();
    });
  }, [handleRefresh]);

  // Watch for search prefix changes - no need to reload, just filter client-side
  // The filtering happens in the sortedAllBlobs useMemo which depends on searchPrefix

  const handleFolderNavigation = async (folderPath: string) => {
    dispatch({ type: 'SET_CURRENT_FOLDER', payload: folderPath });
    await handleRefresh();
  };

  const handleLoadMore = () => {
    // Increase displayed count by 50
    setDisplayedBlobsCount(prev => prev + 50);
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

      // Update localBlobs to remove the deleted file
      setLocalBlobs((prev: BlobItem[]) => prev.filter((blob: BlobItem) => blob.url !== file.url));

      toast.success(`Successfully deleted ${fileName}!`, { id: toastId });
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

    try {
      await getMetadata(file.url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get metadata';
      toast.error(`Failed to get metadata: ${errorMessage}`);
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
                  placeholder="Search files by name..."
                  defaultValue={searchPrefix}
                />
                <SearchButton />
              </Form>
            </div>

            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'size-asc' | 'size-desc') => dispatch({ type: 'SET_SORT_BY', payload: value })}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="size-asc">Smallest First</SelectItem>
                  <SelectItem value="size-desc">Largest First</SelectItem>
                </SelectContent>
              </Select>

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

              <Button onClick={handleRefresh} disabled={isBulkLoading}>
                <RefreshCw className={`w-4 h-4 ${isBulkLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Folders feature removed - we load all blobs flat now for search to work */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                Blobs ({sortedBlobs.length}{sortedAllBlobs.length > sortedBlobs.length ? ` of ${sortedAllBlobs.length}` : ''})
              </CardTitle>
              <CardDescription>
                {currentFolder ? `Files in folder: ${currentFolder}` : 'All files in your blob store'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isBulkLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                <div className="mb-4">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto" />
                </div>
                <p>Loading all blobs...</p>
                <p className="text-sm mt-2">This may take a moment for large collections</p>
              </div>
            </div>
          ) : sortedBlobs.length === 0 ? (
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
              {sortedBlobs.map((file, index) => (
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

          {hasMore && !isBulkLoading && sortedBlobs.length > 0 && (
            <div className="mt-6 text-center">
              <Button onClick={handleLoadMore} variant="outline" size="lg">
                Load More ({sortedAllBlobs.length - displayedBlobsCount} remaining)
              </Button>
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