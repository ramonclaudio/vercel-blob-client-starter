import { head, BlobAccessError } from '@vercel/blob';
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
    const blobUrl = searchParams.get('url');
    
    if (!blobUrl) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Missing required parameter: url' },
        { status: 400 }
      );
    }

    // Get blob metadata following SDK pattern exactly
    const blobDetails = await head(blobUrl, {
      abortSignal: abortController.signal,
    });

    clearTimeout(timeoutId);
    return Response.json(blobDetails, {
      headers: {
        // Cache metadata for 10 minutes, stale-while-revalidate for 1 hour
        'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
        'Vercel-CDN-Cache-Control': 'public, max-age=1800', // 30 minutes for Vercel CDN
      }
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Metadata error:', error);
    
    let errorMessage = 'Failed to get blob metadata';
    let statusCode = 500;

    if (error instanceof BlobAccessError) {
      // Handle known Vercel Blob errors
      errorMessage = `Blob access error: ${error.message}`;
      statusCode = 403; // Access forbidden
    } else if (error instanceof Error) {
      errorMessage = error.message;
      // Check if it's an abort error
      if (error.name === 'AbortError') {
        errorMessage = 'Metadata operation was cancelled';
        statusCode = 499; // Client closed request
      }
      // Check if it's a blob not found error
      if (error.name === 'BlobNotFoundError') {
        errorMessage = 'Blob not found';
        statusCode = 404;
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