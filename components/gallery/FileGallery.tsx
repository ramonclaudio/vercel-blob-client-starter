'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Eye, Trash2, Copy, ExternalLink, Files, Info } from 'lucide-react';
import { BLUR_DATA_URL, getImageSizes, shouldOptimizeImage } from '@/lib/image-optimization';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { type PutBlobResult } from '@vercel/blob';
import { useCopyBlob } from '@/hooks/useCopyBlob';
import { useBlobMetadata } from '@/hooks/useBlobMetadata';
import { MetadataDialog } from './MetadataDialog';
import { toast } from 'sonner';
import { type OptimisticFileItem } from '@/app/upload/page';

interface FileItem extends PutBlobResult {
  uploadedAt: string;
  size?: number;
}

interface FileGalleryProps {
  files: (FileItem | OptimisticFileItem)[];
  onDelete?: (file: FileItem | OptimisticFileItem) => void;
  onCopy?: (file: FileItem | OptimisticFileItem, newFile: FileItem) => void;
  showAdvancedFeatures?: boolean;
  className?: string;
}

export function FileGallery({ files, onDelete, onCopy, showAdvancedFeatures = false, className = '' }: FileGalleryProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem | OptimisticFileItem | null>(null);
  const [metadataFile, setMetadataFile] = useState<FileItem | OptimisticFileItem | null>(null);
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

  const handleCopyFile = async (file: FileItem | OptimisticFileItem) => {
    if (!file.pathname || !file.url) {
      toast.error('Cannot copy file: missing required properties');
      return;
    }

    const originalName = file.pathname.split('/').pop() || 'file';
    const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    const nameWithoutExtension = originalName.replace(`.${extension}`, '');
    const newPathname = `${file.pathname.replace(originalName, '')}${nameWithoutExtension}-copy${extension ? `.${extension}` : ''}`;

    const toastId = toast.loading(`Duplicating ${originalName}...`);

    try {
      const result = await copyBlob(file.url, newPathname, {
        addRandomSuffix: true,
        contentType: file.contentType,
      });
      
      const newFile: FileItem = {
        ...result,
        uploadedAt: new Date().toISOString(),
        size: file.size,
      };
      
      onCopy?.(file, newFile);
      toast.success(`Successfully duplicated ${originalName}!`, { id: toastId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Copy failed';
      toast.error(`Failed to duplicate file: ${errorMessage}`, { id: toastId });
    }
  };

  const handleGetMetadata = async (file: FileItem | OptimisticFileItem) => {
    if (!file.url) {
      toast.error('Cannot get metadata: missing file URL');
      return;
    }

    setMetadataFile(file);
    const toastId = toast.loading(`Getting metadata for ${file.pathname?.split('/').pop() || 'file'}...`);

    try {
      await getMetadata(file.url);
      toast.success(`Metadata loaded successfully!`, { id: toastId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get metadata';
      toast.error(`Failed to get metadata: ${errorMessage}`, { id: toastId });
      setMetadataFile(null);
    }
  };

  const renderFilePreview = (file: FileItem | OptimisticFileItem, index: number) => {
    if (!file.url) {
      return (
        <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-2xl mb-2">⏳</div>
            <div className="text-sm">Processing...</div>
          </div>
        </div>
      );
    }

    const fileType = getFileType(file.contentType || 'application/octet-stream');

    switch (fileType) {
      case 'image':
        const shouldOptimize = shouldOptimizeImage(file.url, file.size);
        const isPriority = index < 4;

        return (
          <div className="aspect-video w-full bg-muted rounded-lg overflow-hidden relative">
            <Image
              src={file.url}
              alt={file.pathname || 'File preview'}
              fill
              className="object-cover"
              sizes={getImageSizes('gallery')}
              quality={75}
              priority={isPriority}
              placeholder={shouldOptimize ? "blur" : "empty"}
              blurDataURL={shouldOptimize ? BLUR_DATA_URL : undefined}
              unoptimized={!shouldOptimize}
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

  const renderFileModal = (file: FileItem | OptimisticFileItem) => {
    if (!file.url) {
      return (
        <div className="w-full bg-black/5 rounded-lg flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-lg">Processing...</div>
          </div>
        </div>
      );
    }

    const fileType = getFileType(file.contentType || 'application/octet-stream');

    switch (fileType) {
      case 'image':
        return (
          <div className="w-full bg-black/5 rounded-lg overflow-hidden">
            <Image
              src={file.url}
              alt={file.pathname || 'File preview'}
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
              title={file.pathname || 'File preview'}
            />
          </div>
        );
      case 'text':
        return (
          <div className="w-full h-[60vh] overflow-auto">
            <iframe
              src={file.url}
              className="w-full h-full border-0"
              title={file.pathname || 'File preview'}
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
              {renderFilePreview(file, index)}
              
              <div className="mt-3 space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-medium text-sm truncate flex-1 mr-2">
                    {file.pathname?.split('/').pop() || file.pathname || 'Unnamed file'}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {getFileType(file.contentType || 'application/octet-stream')}
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(file)}
                    aria-label={`Preview ${file.pathname?.split('/').pop() || 'file'}`}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-auto" aria-describedby="preview-description">
                  <DialogHeader>
                    <DialogTitle className="text-base font-medium">
                      {truncateFilename(file.pathname || 'Unnamed file')}
                    </DialogTitle>
                    <DialogDescription id="preview-description">
                      Full-size preview of the selected file
                    </DialogDescription>
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
                aria-label={`Download ${file.pathname?.split('/').pop() || 'file'}`}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => file.url && copyToClipboard(file.url)}
                aria-label={`Copy URL for ${file.pathname?.split('/').pop() || 'file'}`}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy URL
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(file.url, '_blank')}
                aria-label={`Open ${file.pathname?.split('/').pop() || 'file'} in new tab`}
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
                  aria-label={`View metadata for ${file.pathname?.split('/').pop() || 'file'}`}
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
                  aria-label={`Duplicate ${file.pathname?.split('/').pop() || 'file'}`}
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
                  aria-label={`Delete ${file.pathname?.split('/').pop() || 'file'}`}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      <MetadataDialog
        isOpen={!!metadataFile}
        onClose={() => setMetadataFile(null)}
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