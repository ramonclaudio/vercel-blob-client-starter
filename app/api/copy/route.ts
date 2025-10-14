import { copy, BlobAccessError } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const abortController = new AbortController();

  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 30000);

  try {
    const form = await request.formData();

    const fromUrl = form.get('fromUrl') as string;
    const toPathname = form.get('toPathname') as string;
    
    const contentType = form.get('contentType') as string | null;
    const addRandomSuffix = form.get('addRandomSuffix') === 'true';
    const cacheControlMaxAge = form.get('cacheControlMaxAge') ? 
      parseInt(form.get('cacheControlMaxAge') as string) : undefined;

    if (!fromUrl || !toPathname) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Missing required parameters: fromUrl and toPathname are required' },
        { status: 400 }
      );
    }

    const blob = await copy(fromUrl, toPathname, {
      access: 'public',
      contentType: contentType || undefined,
      addRandomSuffix,
      cacheControlMaxAge,
      abortSignal: abortController.signal,
    });

    clearTimeout(timeoutId);
    return NextResponse.json(blob);

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Copy error:', error);

    let errorMessage = 'Failed to copy blob';
    let statusCode = 500;
    let isTokenMissing = false;

    if (error instanceof BlobAccessError) {
      errorMessage = `Blob access error: ${error.message}`;
      statusCode = 403;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = 'Copy operation was cancelled';
        statusCode = 499;
      } else if (errorMessage.includes('No token found') || errorMessage.includes('BLOB_READ_WRITE_TOKEN')) {
        errorMessage = 'Vercel Blob token is not configured. Please set BLOB_READ_WRITE_TOKEN in your environment variables.';
        isTokenMissing = true;
        statusCode = 503;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        isTokenMissing,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: statusCode }
    );
  }
}