'use client';

import { useCallback, useRef, useReducer, startTransition } from 'react';
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

// React 19 useReducer action types for better state management
type UploadAction =
  | { type: 'UPLOAD_START' }
  | { type: 'UPLOAD_PROGRESS'; payload: UploadProgress }
  | { type: 'UPLOAD_SUCCESS'; payload: PutBlobResult }
  | { type: 'UPLOAD_ERROR'; payload: string }
  | { type: 'UPLOAD_CANCELLED' }
  | { type: 'RESET_STATE' };

// React 19 useReducer reducer function for predictable state transitions
function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case 'UPLOAD_START':
      return {
        isUploading: true,
        progress: null,
        error: null,
        result: null,
      };
    case 'UPLOAD_PROGRESS':
      return {
        ...state,
        progress: action.payload,
      };
    case 'UPLOAD_SUCCESS':
      return {
        isUploading: false,
        progress: state.progress,
        error: null,
        result: action.payload,
      };
    case 'UPLOAD_ERROR':
      return {
        isUploading: false,
        progress: null,
        error: action.payload,
        result: null,
      };
    case 'UPLOAD_CANCELLED':
      return {
        ...state,
        isUploading: false,
        error: 'Upload cancelled',
      };
    case 'RESET_STATE':
      return {
        isUploading: false,
        progress: null,
        error: null,
        result: null,
      };
    default:
      return state;
  }
}

export function useClientUpload() {
  // React 19 useReducer for complex state management
  const [uploadState, dispatch] = useReducer(uploadReducer, {
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
    dispatch({ type: 'UPLOAD_START' });

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
          startTransition(() => {
            dispatch({ type: 'UPLOAD_PROGRESS', payload: progress });
          });
        },
      });

      startTransition(() => {
        dispatch({ type: 'UPLOAD_SUCCESS', payload: result });
      });

      return result;

    } catch (error) {
      let errorMessage = 'Upload failed';

      if (error instanceof BlobAccessError) {
        errorMessage = `Blob access error: ${error.message}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      startTransition(() => {
        dispatch({ type: 'UPLOAD_ERROR', payload: errorMessage });
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

    dispatch({ type: 'UPLOAD_START' });

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

      startTransition(() => {
        dispatch({
          type: 'UPLOAD_SUCCESS',
          payload: results[0] || { url: '', pathname: '', downloadUrl: '' } as PutBlobResult
        });
      });

      return results;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bulk upload failed';

      startTransition(() => {
        dispatch({ type: 'UPLOAD_ERROR', payload: errorMessage });
      });

      throw error;
    }
  }, [uploadFile]);

  const abortUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch({ type: 'UPLOAD_CANCELLED' });
    }
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  return {
    ...uploadState,
    uploadFile,
    uploadMultipleFiles,
    abortUpload,
    resetState,
  };
}