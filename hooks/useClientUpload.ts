'use client';

import { useState, useCallback, useRef } from 'react';
import { upload } from '@vercel/blob/client';
import { type PutBlobResult, BlobAccessError } from '@vercel/blob';

export interface UploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  addRandomSuffix?: boolean;
  allowOverwrite?: boolean;
  cacheControlMaxAge?: number;
  validityMinutes?: number;
  multipart?: boolean;
  folderPath?: string;
  clientPayload?: Record<string, unknown>;
  contentType?: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface UploadState {
  isUploading: boolean;
  progress: UploadProgress | null;
  error: string | null;
  result: PutBlobResult | null;
}

export function useClientUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: null,
    error: null,
    result: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const uploadFile = useCallback(async (
    file: File,
    options: UploadOptions = {}
  ): Promise<PutBlobResult> => {
    setUploadState({
      isUploading: true,
      progress: null,
      error: null,
      result: null,
    });

    abortControllerRef.current = new AbortController();

    try {
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum allowed size of ${(options.maxSize / 1024 / 1024).toFixed(2)}MB`);
      }

      if (options.allowedTypes && options.allowedTypes.length > 0) {
        const isAllowed = options.allowedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.slice(0, -1));
          }
          return file.type === type;
        });

        if (!isAllowed) {
          throw new Error(`File type "${file.type}" is not allowed. Allowed types: ${options.allowedTypes.join(', ')}`);
        }
      }

      const clientPayload = JSON.stringify({
        originalName: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        ...options.clientPayload,
        maxSize: options.maxSize,
        additionalTypes: options.allowedTypes,
        addRandomSuffix: options.addRandomSuffix,
        allowOverwrite: options.allowOverwrite,
        cacheControlMaxAge: options.cacheControlMaxAge,
        validityMinutes: options.validityMinutes,
      });

      const fileName = options.folderPath ? `${options.folderPath}/${file.name}` : file.name;

      const shouldUseMultipart = options.multipart ?? (file.size > 100 * 1024 * 1024);
      
      const result = await upload(fileName, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        clientPayload,
        multipart: shouldUseMultipart,
        contentType: options.contentType,
        abortSignal: abortControllerRef.current.signal,
        onUploadProgress: (progress) => {
          setUploadState(prev => ({
            ...prev,
            progress,
          }));
        },
      });

      setUploadState({
        isUploading: false,
        progress: { loaded: file.size, total: file.size, percentage: 100 },
        error: null,
        result,
      });

      return result;

    } catch (error) {
      let errorMessage = 'Upload failed';

      if (error instanceof BlobAccessError) {
        errorMessage = `Blob access error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setUploadState({
        isUploading: false,
        progress: null,
        error: errorMessage,
        result: null,
      });

      throw error;
    }
  }, []);

  const uploadMultipleFiles = useCallback(async (
    files: File[],
    options: UploadOptions = {}
  ): Promise<PutBlobResult[]> => {
    const results: PutBlobResult[] = [];
    const errors: string[] = [];

    setUploadState({
      isUploading: true,
      progress: null,
      error: null,
      result: null,
    });

    try {
      for (let i = 0; i < files.length; i++) {
        try {
          const result = await uploadFile(files[i], {
            ...options,
          });
          results.push(result);
        } catch (error) {
          errors.push(`${files[i].name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
        }
      }

      if (errors.length > 0) {
        throw new Error(`Some uploads failed:\n${errors.join('\n')}`);
      }

      setUploadState({
        isUploading: false,
        progress: { loaded: files.length, total: files.length, percentage: 100 },
        error: null,
        result: null,
      });

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bulk upload failed';
      
      setUploadState({
        isUploading: false,
        progress: null,
        error: errorMessage,
        result: null,
      });

      throw error;
    }
  }, [uploadFile]);

  const abortUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: 'Upload cancelled',
      }));
    }
  }, []);

  const resetState = useCallback(() => {
    setUploadState({
      isUploading: false,
      progress: null,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...uploadState,
    uploadFile,
    uploadMultipleFiles,
    abortUpload,
    resetState,
  };
}