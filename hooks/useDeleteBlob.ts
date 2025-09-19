'use client';

import { useState, useCallback, useRef, startTransition } from 'react';

export interface DeleteState {
  isDeleting: boolean;
  error: string | null;
}

export function useDeleteBlob() {
  const [deleteState, setDeleteState] = useState<DeleteState>({
    isDeleting: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const deleteFile = useCallback(async (url: string): Promise<void> => {
    abortControllerRef.current = new AbortController();

    startTransition(() => {
      setDeleteState({
        isDeleting: true,
        error: null,
      });
    });

    try {
      const response = await fetch(`/api/delete?url=${encodeURIComponent(url)}`, {
        method: 'DELETE',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(errorData.error || 'Delete failed');
      }

      startTransition(() => {
        setDeleteState({
          isDeleting: false,
          error: null,
        });
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';

      startTransition(() => {
        setDeleteState({
          isDeleting: false,
          error: errorMessage,
        });
      });

      throw error;
    }
  }, []);

  const deleteMultipleFiles = useCallback(async (urls: string[]): Promise<void> => {
    abortControllerRef.current = new AbortController();

    setDeleteState({
      isDeleting: true,
      error: null,
    });

    try {
      const response = await fetch(`/api/delete?urls=${encodeURIComponent(JSON.stringify(urls))}`, {
        method: 'DELETE',
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Bulk delete failed' }));
        throw new Error(errorData.error || 'Bulk delete failed');
      }

      setDeleteState({
        isDeleting: false,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bulk delete failed';
      
      setDeleteState({
        isDeleting: false,
        error: errorMessage,
      });

      throw error;
    }
  }, []);

  const abortDelete = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setDeleteState(prev => ({
        ...prev,
        isDeleting: false,
        error: 'Delete operation cancelled',
      }));
    }
  }, []);

  const resetState = useCallback(() => {
    setDeleteState({
      isDeleting: false,
      error: null,
    });
  }, []);

  return {
    ...deleteState,
    deleteFile,
    deleteMultipleFiles,
    abortDelete,
    resetState,
  };
}