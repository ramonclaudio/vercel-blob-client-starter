'use client';

import { useCallback, useState, useRef, useMemo } from 'react';
import { Upload, FileImage, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useClientUpload, type UploadOptions } from '@/hooks/useClientUpload';
import { type PutBlobResult } from '@vercel/blob';
import { toast } from 'sonner';

interface UploadZoneProps {
  onUploadComplete?: (result: PutBlobResult, originalFile: File) => void;
  onUploadError?: (error: string) => void;
  onUploadStart?: (files: File[]) => void;
  options?: UploadOptions;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export function UploadZone({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  options = {},
  accept,
  multiple = false,
  disabled = false,
  className = '',
}: UploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const {
    isUploading,
    progress,
    error,
    result,
    uploadFile,
    uploadMultipleFiles,
    abortUpload,
    resetState,
  } = useClientUpload();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isUploading) {
      setIsDragOver(true);
    }
  }, [disabled, isUploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // React 19 optimistic update - show files immediately
    onUploadStart?.(files);

    let toastId: string | number | undefined;
    
    try {
      if (multiple && files.length > 1) {
        toastId = toast.loading(`Uploading ${files.length} files...`);
        const results = await uploadMultipleFiles(files, options);
        results.forEach((result, index) => onUploadComplete?.(result, files[index]));
        toast.success(`Successfully uploaded ${results.length} files!`, { id: toastId });
      } else {
        toastId = toast.loading(`Uploading ${files[0].name}...`);
        const result = await uploadFile(files[0], options);
        onUploadComplete?.(result, files[0]);
        toast.success(`Successfully uploaded ${files[0].name}!`, { id: toastId });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
      onUploadError?.(errorMessage);
    }
  }, [disabled, isUploading, multiple, options, uploadFile, uploadMultipleFiles, onUploadComplete, onUploadError, onUploadStart]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // React 19 optimistic update - show files immediately
    onUploadStart?.(files);

    let toastId: string | number | undefined;

    try {
      if (multiple && files.length > 1) {
        toastId = toast.loading(`Uploading ${files.length} files...`);
        const results = await uploadMultipleFiles(files, options);
        results.forEach((result, index) => onUploadComplete?.(result, files[index]));
        toast.success(`Successfully uploaded ${results.length} files!`, { id: toastId });
      } else {
        toastId = toast.loading(`Uploading ${files[0].name}...`);
        const result = await uploadFile(files[0], options);
        onUploadComplete?.(result, files[0]);
        toast.success(`Successfully uploaded ${files[0].name}!`, { id: toastId });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
      onUploadError?.(errorMessage);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [multiple, options, uploadFile, uploadMultipleFiles, onUploadComplete, onUploadError, onUploadStart]);

  const openFileDialog = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const formatFileSize = useMemo(() => (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getAcceptedTypes = useMemo(() => {
    if (accept) return accept;
    if (options.allowedTypes) {
      return options.allowedTypes.join(',');
    }
    return '*/*';
  }, [accept, options.allowedTypes]);

  return (
    <div className={`w-full ${className}`}>
      <Card 
        className={`
          relative border-2 border-dashed transition-all duration-200 cursor-pointer
          ${isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4">
            {isUploading ? (
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <FileImage className="w-16 h-16 text-muted-foreground" />
            )}
          </div>

          {isUploading ? (
            <div className="w-full max-w-xs space-y-2">
              <div className="text-sm font-medium">Uploading...</div>
              {progress && (
                <>
                  <Progress value={progress.percentage} className="w-full" />
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(progress.loaded)} / {formatFileSize(progress.total)} ({progress.percentage.toFixed(1)}%)
                  </div>
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  abortUpload();
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-lg font-medium">
                {isDragOver ? 'Drop files here' : 'Upload files'}
              </div>
              <div className="text-sm text-muted-foreground">
                Drag and drop files here, or click to select
              </div>
              {multiple && (
                <Badge variant="secondary">Multiple files supported</Badge>
              )}
              {options.maxSize && (
                <div className="text-xs text-muted-foreground">
                  Max size: {formatFileSize(options.maxSize)}
                </div>
              )}
              {options.allowedTypes && (
                <div className="text-xs text-muted-foreground">
                  Allowed types: {options.allowedTypes.join(', ')}
                </div>
              )}
            </div>
          )}
        </CardContent>

        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptedTypes}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p>
                {error.includes('Failed to retrieve the client token') 
                  ? 'Upload failed: BLOB_READ_WRITE_TOKEN environment variable is not configured. Please set your Vercel Blob token to enable uploads.'
                  : error
                }
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={resetState}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {result && !isUploading && (
        <Alert className="mt-4">
          <Upload className="h-4 w-4" />
          <AlertDescription>
            Upload successful! File available at:{' '}
            <a 
              href={result.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              {result.pathname}
            </a>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}