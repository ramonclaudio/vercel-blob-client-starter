import { del, BlobAccessError } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const abortController = new AbortController();
  
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 30000);

  try {
    const { searchParams } = new URL(request.url);
    const urlToDelete = searchParams.get('url') as string;
    const urlsParam = searchParams.get('urls');
    
    if (!urlToDelete && !urlsParam) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Missing required parameter: url or urls' },
        { status: 400 }
      );
    }

    if (urlsParam) {
      try {
        const urls = JSON.parse(urlsParam) as string[];
        await del(urls, {
          abortSignal: abortController.signal,
        });
        clearTimeout(timeoutId);
        return NextResponse.json({
          message: `Successfully deleted ${urls.length} files`,
          deletedCount: urls.length
        }, {
          headers: {
            'Cache-Control': 'private, no-cache, no-store, must-revalidate',
          }
        });
      } catch {
        clearTimeout(timeoutId);
        return NextResponse.json(
          { error: 'Invalid URLs format. Expected JSON array of strings.' },
          { status: 400 }
        );
      }
    }

    await del(urlToDelete, {
      abortSignal: abortController.signal,
    });
    clearTimeout(timeoutId);
    return NextResponse.json({
      message: 'File deleted successfully',
      deletedUrl: urlToDelete
    }, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      }
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Delete error:', error);
    
    let errorMessage = 'Failed to delete file';
    let statusCode = 500;

    if (error instanceof BlobAccessError) {
      errorMessage = `Blob access error: ${error.message}`;
      statusCode = 403;
    } else if (error instanceof Error) {
      errorMessage = error.message;
      if (error.name === 'AbortError') {
        errorMessage = 'Delete operation was cancelled';
        statusCode = 499;
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