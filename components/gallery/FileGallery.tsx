'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Eye, Trash2, Copy, ExternalLink, Files, Info } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type PutBlobResult } from '@vercel/blob';
import { useCopyBlob } from '@/hooks/useCopyBlob';
import { useBlobMetadata } from '@/hooks/useBlobMetadata';
import { toast } from 'sonner';

interface FileItem extends PutBlobResult {
  uploadedAt: string;
  size?: number;
}

interface FileGalleryProps {
  files: FileItem[];
  onDelete?: (file: FileItem) => void;
  onCopy?: (file: FileItem, newFile: FileItem) => void;
  showAdvancedFeatures?: boolean;
  className?: string;
}

export function FileGallery({ files, onDelete, onCopy, showAdvancedFeatures = false, className = '' }: FileGalleryProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [metadataFile, setMetadataFile] = useState<FileItem | null>(null);
  const { copyBlob, isCopying } = useCopyBlob();
  const { getMetadata, isLoading: isLoadingMetadata, metadata, error: metadataError } = useBlobMetadata();

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateFilename = (filename: string, maxLength = 50) => {
    if (filename.length <= maxLength) return filename;
    
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    
    if (nameWithoutExt.length <= 20) return filename;
    
    const start = nameWithoutExt.substring(0, 20);
    const end = nameWithoutExt.substring(nameWithoutExt.length - 10);
    
    return `${start}...${end}.${extension}`;
  };

  const getFileType = (contentType: string) => {
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType === 'application/pdf') return 'pdf';
    if (contentType.startsWith('text/')) return 'text';
    return 'file';
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('URL copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy URL to clipboard');
    }
  };

  const handleCopyFile = async (file: FileItem) => {
    const originalName = file.pathname.split('/').pop() || 'file';
    const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    const nameWithoutExtension = originalName.replace(`.${extension}`, '');
    const newPathname = `${file.pathname.replace(originalName, '')}${nameWithoutExtension}-copy${extension ? `.${extension}` : ''}`;
    
    const toastId = toast.loading(`Duplicating ${originalName}...`);
    
    try {
      const result = await copyBlob(file.url, newPathname, {
        addRandomSuffix: true, // Ensure unique filename
        contentType: file.contentType,
      });
      
      // Convert result to FileItem format
      const newFile: FileItem = {
        ...result,
        uploadedAt: new Date().toISOString(),
        size: file.size, // Copy won't return size, so we use original
      };
      
      onCopy?.(file, newFile);
      toast.success(`Successfully duplicated ${originalName}!`, { id: toastId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Copy failed';
      toast.error(`Failed to duplicate file: ${errorMessage}`, { id: toastId });
    }
  };

  const handleGetMetadata = async (file: FileItem) => {
    setMetadataFile(file);
    const toastId = toast.loading(`Getting metadata for ${file.pathname.split('/').pop()}...`);
    
    try {
      await getMetadata(file.url);
      toast.success(`Metadata loaded successfully!`, { id: toastId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get metadata';
      toast.error(`Failed to get metadata: ${errorMessage}`, { id: toastId });
      setMetadataFile(null); // Close dialog on error
    }
  };

  const renderFilePreview = (file: FileItem) => {
    const fileType = getFileType(file.contentType);

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
      case 'video':
        return (
          <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden">
            <video
              src={file.url}
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            />
          </div>
        );
      case 'audio':
        return (
          <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
            <audio src={file.url} controls className="w-full max-w-xs" />
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

  const renderFileModal = (file: FileItem) => {
    const fileType = getFileType(file.contentType);

    switch (fileType) {
      case 'image':
        return (
          <div className="w-full bg-black/5 rounded-lg overflow-hidden">
            <Image
              src={file.url}
              alt={file.pathname}
              width={1600}
              height={1200}
              className="w-full h-auto object-contain"
              sizes="(max-width: 768px) 95vw, (max-width: 1400px) 85vw, 80vw"
              priority
            />
          </div>
        );
      case 'video':
        return (
          <div className="w-full">
            <video
              src={file.url}
              className="w-full h-auto max-h-[80vh]"
              controls
              autoPlay
            />
          </div>
        );
      case 'audio':
        return (
          <div className="w-full flex items-center justify-center p-8">
            <audio src={file.url} controls className="w-full max-w-md" />
          </div>
        );
      case 'pdf':
        return (
          <div className="w-full h-[80vh]">
            <iframe
              src={file.url}
              className="w-full h-full border-0"
              title={file.pathname}
            />
          </div>
        );
      case 'text':
        return (
          <div className="w-full h-[60vh] overflow-auto">
            <iframe
              src={file.url}
              className="w-full h-full border-0"
              title={file.pathname}
            />
          </div>
        );
      default:
        return (
          <div className="w-full p-8 text-center">
            <div className="text-muted-foreground">
              <div className="text-4xl mb-4">📄</div>
              <p>Preview not available for this file type.</p>
              <p className="text-sm mt-2">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Open in new tab
                </a>
              </p>
            </div>
          </div>
        );
    }
  };

  if (files.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-muted-foreground">
          <div className="text-4xl mb-4">📁</div>
          <p>No files uploaded yet.</p>
          <p className="text-sm mt-2">Upload some files to see them here!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {files.map((file, index) => (
          <Card key={`${file.url}-${index}`} className="overflow-hidden">
            <CardContent className="p-4">
              {renderFilePreview(file)}
              
              <div className="mt-3 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm truncate flex-1 mr-2">
                    {file.pathname.split('/').pop() || file.pathname}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {getFileType(file.contentType)}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>{file.contentType}</div>
                  <div>{formatFileSize(file.size)}</div>
                  {file.uploadedAt && <div>{formatDate(file.uploadedAt)}</div>}
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setSelectedFile(file)}>
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle className="text-base font-medium">
                      {truncateFilename(file.pathname)}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-auto">
                    {selectedFile && renderFileModal(selectedFile)}
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(file.downloadUrl, '_blank')}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(file.url)}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy URL
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(file.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open
              </Button>

              {showAdvancedFeatures && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGetMetadata(file)}
                  disabled={isLoadingMetadata}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Info className="w-4 h-4 mr-1" />
                  Metadata
                </Button>
              )}

              {onCopy && showAdvancedFeatures && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyFile(file)}
                  disabled={isCopying}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Files className="w-4 h-4 mr-1" />
                  Duplicate File
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(file)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Metadata Dialog */}
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

                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Content Disposition</h4>
                  <div className="font-mono text-xs break-all bg-background p-2 rounded border">
                    {metadata.contentDisposition}
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