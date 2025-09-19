'use client';

import { useState, useCallback, useRef, startTransition } from 'react';

export interface BlobItem {
  size: number;
  uploadedAt: Date;
  pathname: string;
  url: string;
  downloadUrl: string;
}

export interface ListBlobsOptions {
  limit?: number;
  prefix?: string;
  cursor?: string;
  mode?: 'expanded' | 'folded';
}

export interface ListBlobsResult {
  blobs: BlobItem[];
  cursor?: string;
  hasMore: boolean;
  folders?: string[];
}

export interface ListBlobsState {
  isLoading: boolean;
  error: string | null;
  data: ListBlobsResult | null;
  allBlobs: BlobItem[];
}

export function useListBlobs() {
  const [state, setState] = useState<ListBlobsState>({
    isLoading: false,
    error: null,
    data: null,
    allBlobs: [],
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const listBlobs = useCallback(async (options: ListBlobsOptions = {}): Promise<ListBlobsResult> => {
    abortControllerRef.current = new AbortController();

    startTransition(() => {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
      }));
    });

    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.prefix) params.append('prefix', options.prefix);
      if (options.cursor) params.append('cursor', options.cursor);
      if (options.mode) params.append('mode', options.mode);

      const response = await fetch(`/api/list?${params.toString()}`, {
        method: 'GET',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to list blobs' }));
        throw new Error(errorData.error || 'Failed to list blobs');
      }

      const result: ListBlobsResult = await response.json();

      const processedBlobs = result.blobs.map(blob => ({
        ...blob,
        uploadedAt: new Date(blob.uploadedAt),
      }));

      const processedResult = {
        ...result,
        blobs: processedBlobs,
      };

      startTransition(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
          data: processedResult,
          allBlobs: options.cursor ? [...prev.allBlobs, ...processedBlobs] : processedBlobs,
        }));
      });

      return processedResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to list blobs';
      
      startTransition(() => {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));
      });

      throw error;
    }
  }, []);

  const loadMore = useCallback(async (options: Omit<ListBlobsOptions, 'cursor'> = {}): Promise<ListBlobsResult | null> => {
    if (!state.data?.hasMore || !state.data?.cursor) {
      return null;
    }

    return listBlobs({
      ...options,
      cursor: state.data.cursor,
    });
  }, [state.data?.hasMore, state.data?.cursor, listBlobs]);

  const refresh = useCallback(async (options: ListBlobsOptions = {}): Promise<ListBlobsResult> => {
    setState(prev => ({
      ...prev,
      allBlobs: [],
    }));
    
    return listBlobs({ ...options, cursor: undefined });
  }, [listBlobs]);

  const listAllBlobs = useCallback(async (options: Omit<ListBlobsOptions, 'cursor'> = {}): Promise<BlobItem[]> => {
    let hasMore = true;
    let cursor: string | undefined = undefined;
    const allBlobs: BlobItem[] = [];

    setState(prev => ({
      ...prev,
      allBlobs: [],
    }));

    while (hasMore) {
      const result = await listBlobs({
        ...options,
        cursor,
      });
      
      allBlobs.push(...result.blobs);
      hasMore = result.hasMore;
      cursor = result.cursor;
    }

    return state.allBlobs;
  }, [listBlobs, state.allBlobs]);

  const abortRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'List request cancelled',
      }));
    }
  }, []);

  const resetState = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null,
      allBlobs: [],
    });
  }, []);

  return {
    ...state,
    listBlobs,
    loadMore,
    refresh,
    listAllBlobs,
    abortRequest,
    resetState,
  };
}