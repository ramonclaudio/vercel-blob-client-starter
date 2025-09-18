import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { BlobAccessError } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        // Generate a client token for the browser to upload the file
        // ⚠️ Authenticate and authorize users before generating the token.
        // Otherwise, you're allowing anonymous uploads.

        // ⚠️ When using the clientPayload feature, make sure to validate it
        // otherwise this could introduce security issues for your app
        // like allowing users to modify other users' posts

        const payload = clientPayload ? JSON.parse(clientPayload) : {};

        console.log(`Upload request for ${pathname}, multipart: ${multipart}`);

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'video/mp4',
            'video/webm',
            'application/pdf',
            'text/plain',
            'text/csv',
            'application/json',
            ...payload.additionalTypes || []
          ],
          addRandomSuffix: payload.addRandomSuffix ?? true,
          maximumSizeInBytes: payload.maxSize || 100 * 1024 * 1024,
          validUntil: Date.now() + (payload.validityMinutes || 60) * 60 * 1000,
          allowOverwrite: payload.allowOverwrite ?? false,
          cacheControlMaxAge: payload.cacheControlMaxAge || 60 * 60 * 24 * 90,
          callbackUrl: process.env.VERCEL_BLOB_CALLBACK_URL ||
                      process.env.VERCEL_BRANCH_URL ||
                      process.env.VERCEL_URL ||
                      process.env.VERCEL_PROJECT_PRODUCTION_URL,
          tokenPayload: JSON.stringify({
            uploadedBy: 'anonymous', // In prod use authenticated user ID
            uploadedAt: new Date().toISOString(),
            originalPayload: payload,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        console.log('blob upload completed', blob, tokenPayload);

        try {
          // Example: update a database record with the uploaded blob URL
        } catch (uploadError) {
          console.error('Upload completion error:', uploadError);
          throw new Error('Could not update post');
        }
      },
    });

    return NextResponse.json(jsonResponse, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error) {
    if (error instanceof BlobAccessError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    } else {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 400 },
      );
    }
  }
}