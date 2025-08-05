import { del, BlobAccessError } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  // Create AbortController for this request
  const abortController = new AbortController();
  
  // Handle request timeout (optional - good practice)
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, 30000); // 30 second timeout

  try {
    const { searchParams } = new URL(request.url);
    const urlToDelete = searchParams.get('url') as string;
    const urlsParam = searchParams.get('urls'); // For bulk delete
    
    if (!urlToDelete && !urlsParam) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Missing required parameter: url or urls' },
        { status: 400 }
      );
    }

    // Handle bulk delete
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
        });
      } catch {
        clearTimeout(timeoutId);
        return NextResponse.json(
          { error: 'Invalid URLs format. Expected JSON array of strings.' },
          { status: 400 }
        );
      }
    }

    // Handle single delete
    await del(urlToDelete, {
      abortSignal: abortController.signal,
    });
    clearTimeout(timeoutId);
    return NextResponse.json({ 
      message: 'File deleted successfully',
      deletedUrl: urlToDelete 
    });

  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Delete error:', error);
    
    let errorMessage = 'Failed to delete file';
    let statusCode = 500;

    if (error instanceof BlobAccessError) {
      // Handle known Vercel Blob errors
      errorMessage = `Blob access error: ${error.message}`;
      statusCode = 403; // Access forbidden
    } else if (error instanceof Error) {
      errorMessage = error.message;
      // Check if it's an abort error
      if (error.name === 'AbortError') {
        errorMessage = 'Delete operation was cancelled';
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