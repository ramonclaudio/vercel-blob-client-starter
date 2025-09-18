'use client';

import { useState, useCallback, useRef } from 'react';
import { type PutBlobResult } from '@vercel/blob';

export interface CopyOptions {
  contentType?: string;
  addRandomSuffix?: boolean;
  cacheControlMaxAge?: number;
}

export interface CopyState {
  isCopying: boolean;
  error: string | null;
  result: PutBlobResult | null;
}

export function useCopyBlob() {
  const [copyState, setCopyState] = useState<CopyState>({
    isCopying: false,
    error: null,
    result: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const copyBlob = useCallback(async (
    fromUrl: string,
    toPathname: string,
    options: CopyOptions = {}
  ): Promise<PutBlobResult> => {
    abortControllerRef.current = new AbortController();

    setCopyState({
      isCopying: true,
      error: null,
      result: null,
    });

    try {
      const formData = new FormData();
      formData.append('fromUrl', fromUrl);
      formData.append('toPathname', toPathname);
      
      if (options.contentType) {
        formData.append('contentType', options.contentType);
      }
      if (options.addRandomSuffix !== undefined) {
        formData.append('addRandomSuffix', String(options.addRandomSuffix));
      }
      if (options.cacheControlMaxAge !== undefined) {
        formData.append('cacheControlMaxAge', String(options.cacheControlMaxAge));
      }

      const response = await fetch('/api/copy', {
        method: 'PUT',
        body: formData,
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Copy failed' }));
        throw new Error(errorData.error || 'Copy failed');
      }

      const result = await response.json();

      setCopyState({
        isCopying: false,
        error: null,
        result,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Copy failed';
      
      setCopyState({
        isCopying: false,
        error: errorMessage,
        result: null,
      });

      throw error;
    }
  }, []);

  const abortCopy = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setCopyState(prev => ({
        ...prev,
        isCopying: false,
        error: 'Copy operation cancelled',
      }));
    }
  }, []);

  const resetState = useCallback(() => {
    setCopyState({
      isCopying: false,
      error: null,
      result: null,
    });
  }, []);

  return {
    ...copyState,
    copyBlob,
    abortCopy,
    resetState,
  };
}