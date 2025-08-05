import { copy, BlobAccessError } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  // Create AbortController for this request
  const abortController = new AbortController();
  
  // Handle request timeout (30 seconds)
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 30000);

  try {
    const form = await request.formData();

    const fromUrl = form.get('fromUrl') as string;
    const toPathname = form.get('toPathname') as string;
    
    // Extract optional parameters from form data
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

    // Copy the blob following SDK pattern exactly
    const blob = await copy(fromUrl, toPathname, {
      access: 'public',
      contentType: contentType || undefined,
      addRandomSuffix,
      cacheControlMaxAge,
      abortSignal: abortController.signal,
    });

    clearTimeout(timeoutId);
    return Response.json(blob);

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Copy error:', error);
    
    let errorMessage = 'Failed to copy blob';
    let statusCode = 500;

    if (error instanceof BlobAccessError) {
      // Handle known Vercel Blob errors
      errorMessage = `Blob access error: ${error.message}`;
      statusCode = 403; // Access forbidden
    } else if (error instanceof Error) {
      errorMessage = error.message;
      // Check if it's an abort error
      if (error.name === 'AbortError') {
        errorMessage = 'Copy operation was cancelled';
        statusCode = 499; // Client closed request
      }
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: statusCode }
    );
  }
}