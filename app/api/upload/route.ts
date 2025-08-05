import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { BlobAccessError } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Use-case: uploading images for blog posts
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

        // Parse clientPayload if provided
        const payload = clientPayload ? JSON.parse(clientPayload) : {};

        // Log multipart status for debugging
        console.log(`Upload request for ${pathname}, multipart: ${multipart}`);

        return {
          // Allow common image, video, and document types
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
          // Add random suffix to prevent conflicts
          addRandomSuffix: payload.addRandomSuffix ?? true,
          // Set max file size (default 100MB, configurable via payload)
          maximumSizeInBytes: payload.maxSize || 100 * 1024 * 1024,
          // Token valid for 1 hour (configurable via payload)
          validUntil: Date.now() + (payload.validityMinutes || 60) * 60 * 1000,
          // Allow overwriting if specified
          allowOverwrite: payload.allowOverwrite ?? false,
          // Custom cache control (default 1 month)
          cacheControlMaxAge: payload.cacheControlMaxAge || 60 * 60 * 24 * 30,
          // Include metadata in token payload
          tokenPayload: JSON.stringify({
            uploadedBy: 'anonymous', // In real app, use authenticated user ID
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
          // Run any logic after the file upload completed,
          // If you've already validated the user and authorization prior, you can
          // safely update your database
        } catch (uploadError) {
          console.error('Upload completion error:', uploadError);
          throw new Error('Could not update post');
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    if (error instanceof BlobAccessError) {
      // handle a recognized error
      return NextResponse.json(
        { error: error.message },
        { status: 400 }, // The webhook will retry 5 times waiting for a 200
      );
    } else {
      // throw the error again if it's unknown
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 400 }, // The webhook will retry 5 times waiting for a 200
      );
    }
  }
}