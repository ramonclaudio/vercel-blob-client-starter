import { head, BlobAccessError } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { connection } from 'next/server';

export async function GET(request: Request) {
  await connection();

  const abortController = new AbortController();

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

    const blobDetails = await head(blobUrl, {
      abortSignal: abortController.signal,
    });

    clearTimeout(timeoutId);
    return NextResponse.json(blobDetails, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600',
        'CDN-Cache-Control': 'public, max-age=600, stale-while-revalidate=3600',
        'Vercel-CDN-Cache-Control': 'public, max-age=1800',
      }
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Metadata error:', error);

    let errorMessage = 'Failed to get blob metadata';
    let statusCode = 500;
    let isTokenMissing = false;

    if (error instanceof BlobAccessError) {
      errorMessage = `Blob access error: ${error.message}`;
      statusCode = 403;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = 'Metadata operation was cancelled';
        statusCode = 499;
      } else if (error.name === 'BlobNotFoundError') {
        errorMessage = 'Blob not found';
        statusCode = 404;
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