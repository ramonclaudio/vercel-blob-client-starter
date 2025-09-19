'use client';

import { useState, useCallback, useRef, startTransition } from 'react';

export interface BlobMetadata {
  size: number;
  uploadedAt: Date;
  pathname: string;
  contentType: string;
  contentDisposition: string;
  url: string;
  downloadUrl: string;
  cacheControl: string;
}

export interface MetadataState {
  isLoading: boolean;
  error: string | null;
  metadata: BlobMetadata | null;
}

export function useBlobMetadata() {
  const [metadataState, setMetadataState] = useState<MetadataState>({
    isLoading: false,
    error: null,
    metadata: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const getMetadata = useCallback(async (url: string): Promise<BlobMetadata> => {
    abortControllerRef.current = new AbortController();

    startTransition(() => {
      setMetadataState({
        isLoading: true,
        error: null,
        metadata: null,
      });
    });

    try {
      const response = await fetch(`/api/metadata?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to get metadata' }));
        throw new Error(errorData.error || 'Failed to get metadata');
      }

      const metadata = await response.json();

      if (typeof metadata.uploadedAt === 'string') {
        metadata.uploadedAt = new Date(metadata.uploadedAt);
      }

      startTransition(() => {
        setMetadataState({
          isLoading: false,
          error: null,
          metadata,
        });
      });

      return metadata;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get metadata';
      
      startTransition(() => {
        setMetadataState({
          isLoading: false,
          error: errorMessage,
          metadata: null,
        });
      });

      throw error;
    }
  }, []);

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      startTransition(() => {
        setMetadataState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Metadata request cancelled',
        }));
      });
    }
  }, []);

  const resetState = useCallback(() => {
    startTransition(() => {
      setMetadataState({
        isLoading: false,
        error: null,
        metadata: null,
      });
    });
  }, []);

  return {
    ...metadataState,
    getMetadata,
    abortRequest,
    resetState,
  };
}