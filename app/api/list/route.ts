import { list, BlobAccessError } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Create AbortController for this request
  const abortController = new AbortController();
  
  // Handle request timeout (30 seconds)
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 30000);

  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters following SDK specification
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const prefix = searchParams.get('prefix') || undefined;
    const cursor = searchParams.get('cursor') || undefined;
    const mode = searchParams.get('mode') as 'expanded' | 'folded' | undefined;

    // List blobs following SDK pattern exactly
    const result = await list({
      limit,
      prefix,
      cursor,
      mode,
      abortSignal: abortController.signal,
    });

    clearTimeout(timeoutId);
    return Response.json({
      blobs: result.blobs,
      cursor: result.cursor,
      hasMore: result.hasMore,
      folders: 'folders' in result ? result.folders : undefined,
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('List blobs error:', error);
    
    let errorMessage = 'Failed to list blobs';
    let statusCode = 500;

    if (error instanceof BlobAccessError) {
      // Handle known Vercel Blob errors
      errorMessage = `Blob access error: ${error.message}`;
      statusCode = 403; // Access forbidden
    } else if (error instanceof Error) {
      errorMessage = error.message;
      // Check if it's an abort error
      if (error.name === 'AbortError') {
        errorMessage = 'List operation was cancelled';
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