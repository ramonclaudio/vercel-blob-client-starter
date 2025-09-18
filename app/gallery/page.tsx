'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListBlobs } from '@/hooks/useListBlobs';
import { useDeleteBlob } from '@/hooks/useDeleteBlob';
import { useCopyBlob } from '@/hooks/useCopyBlob';
import { useBlobMetadata } from '@/hooks/useBlobMetadata';
import {
  Search,
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

export default function GalleryPage() {
  const [currentFolder, setCurrentFolder] = useState<string>('');
  const [searchPrefix, setSearchPrefix] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [displayMode, setDisplayMode] = useState<'expanded' | 'folded'>('folded');
  const [selectedFile, setSelectedFile] = useState<BlobItem | null>(null);
  const [metadataFile, setMetadataFile] = useState<BlobItem | null>(null);

  const { 
    isLoading, 
    error, 
    data, 
    allBlobs, 
    loadMore, 
    refresh 
  } = useListBlobs();

  const { deleteFile } = useDeleteBlob();
  const { copyBlob } = useCopyBlob();
  const { getMetadata, isLoading: isLoadingMetadata, metadata, error: metadataError } = useBlobMetadata();

  const handleRefresh = useCallback(async () => {
    try {
      await refresh({
        prefix: currentFolder || undefined,
        mode: displayMode,
        limit: 50,
      });
    } catch {
      toast.error('Failed to load blobs');
    }
  }, [refresh, currentFolder, displayMode]);

  useEffect(() => {
    handleRefresh();
  }, [handleRefresh]);

  const handleSearch = async () => {
    try {
      const effectivePrefix = searchPrefix.trim() || currentFolder || undefined;
      await refresh({
        prefix: effectivePrefix,
        mode: displayMode,
        limit: 50,
      });
    } catch {
      toast.error('Failed to search blobs');
    }
  };

  const handleFolderNavigation = async (folderPath: string) => {
    setCurrentFolder(folderPath);
    setSearchPrefix('');
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
      await loadMore({
        prefix: currentFolder || undefined,
        mode: displayMode,
        limit: 50,
      });
    } catch {
      toast.error('Failed to load more blobs');
    }
  };

  const handleDeleteFile = async (file: BlobItem) => {
    const toastId = toast.loading(`Deleting ${file.pathname.split('/').pop()}...`);
    
    try {
      await deleteFile(file.url);
      toast.success(`Successfully deleted ${file.pathname.split('/').pop()}!`, { id: toastId });
      await handleRefresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      toast.error(`Failed to delete file: ${errorMessage}`, { id: toastId });
    }
  };

  const handleCopyFile = async (file: BlobItem) => {
    const originalName = file.pathname.split('/').pop() || 'file';
    const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    const nameWithoutExtension = originalName.replace(`.${extension}`, '');
    const newPathname = `${file.pathname.replace(originalName, '')}${nameWithoutExtension}-copy${extension ? `.${extension}` : ''}`;
    
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
    }
  };

  const handleGetMetadata = async (file: BlobItem) => {
    setMetadataFile(file);
    const toastId = toast.loading(`Getting metadata for ${file.pathname.split('/').pop()}...`);
    
    try {
      await getMetadata(file.url);
      toast.success(`Metadata loaded successfully!`, { id: toastId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get metadata';
      toast.error(`Failed to get metadata: ${errorMessage}`, { id: toastId });
      setMetadataFile(null);
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

  // HowTo JSON-LD Schema for Gallery Management
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
      {/* Gallery HowTo JSON-LD Schema */}
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
              <div className="flex gap-2">
                <Input
                  placeholder="Search by prefix..."
                  value={searchPrefix}
                  onChange={(e) => setSearchPrefix(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isLoading}>
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={displayMode} onValueChange={(value: 'expanded' | 'folded') => setDisplayMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="folded">Folded</SelectItem>
                  <SelectItem value="expanded">Expanded</SelectItem>
                </SelectContent>
              </Select>

              <Select value={viewMode} onValueChange={(value: 'grid' | 'list') => setViewMode(value)}>
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
                Blobs ({allBlobs.length})
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
          {allBlobs.length === 0 && !isLoading ? (
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
              {allBlobs.map((file, index) => (
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
                        <Button variant="outline" size="sm" onClick={() => setSelectedFile(file)}>
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

      <Dialog open={!!metadataFile} onOpenChange={(open) => !open && setMetadataFile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Blob Metadata
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {metadataFile && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">File Information</h4>
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Filename:</span> {metadataFile.pathname.split('/').pop()}</div>
                  <div><span className="font-medium">Full Path:</span> {metadataFile.pathname}</div>
                </div>
              </div>
            )}

            {isLoadingMetadata && (
              <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="ml-3">Loading metadata...</span>
              </div>
            )}

            {metadataError && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Error</h4>
                <p className="text-sm text-destructive">{metadataError}</p>
              </div>
            )}

            {metadata && !isLoadingMetadata && (
              <div className="space-y-4">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Blob Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Size:</span>
                      <div className="font-mono">{formatFileSize(metadata.size)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Content Type:</span>
                      <div className="font-mono break-all">{metadata.contentType}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Uploaded At:</span>
                      <div className="font-mono">{formatDate(metadata.uploadedAt.toISOString())}</div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Cache Control:</span>
                      <div className="font-mono break-all">{metadata.cacheControl}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">URLs</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">View URL:</span>
                      <div className="font-mono text-xs break-all bg-background p-2 rounded border mt-1">
                        {metadata.url}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Download URL:</span>
                      <div className="font-mono text-xs break-all bg-background p-2 rounded border mt-1">
                        {metadata.downloadUrl}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}