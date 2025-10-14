import { list, BlobAccessError } from '@vercel/blob';
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

    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : undefined;
    const prefix = searchParams.get('prefix') || undefined;
    const cursor = searchParams.get('cursor') || undefined;
    const mode = searchParams.get('mode') as 'expanded' | 'folded' | undefined;

    const result = await list({
      limit,
      prefix,
      cursor,
      mode,
      abortSignal: abortController.signal,
    });

    clearTimeout(timeoutId);
    return NextResponse.json({
      blobs: result.blobs,
      cursor: result.cursor,
      hasMore: result.hasMore,
      folders: 'folders' in result ? result.folders : undefined,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300',
        'CDN-Cache-Control': 'public, max-age=30, stale-while-revalidate=300',
        'Vercel-CDN-Cache-Control': 'public, max-age=60',
      }
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('List blobs error:', error);

    let errorMessage = 'Failed to list blobs';
    let statusCode = 500;
    let isTokenMissing = false;

    if (error instanceof BlobAccessError) {
      errorMessage = `Blob access error: ${error.message}`;
      statusCode = 403;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = 'List operation was cancelled';
        statusCode = 499;
      } else if (error.message.includes('No token found') || error.message.includes('BLOB_READ_WRITE_TOKEN')) {
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