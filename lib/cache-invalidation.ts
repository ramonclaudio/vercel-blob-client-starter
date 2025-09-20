import { revalidateTag } from 'next/cache';

export async function invalidateUserPreferences(userId: string): Promise<void> {
  'use server';

  // Invalidate cached user preferences
  revalidateTag(`user-preferences-${userId}`);
}

export async function invalidateBlobConfig(): Promise<void> {
  'use server';

  // Invalidate cached blob configuration
  revalidateTag('blob-config');
}

export async function invalidateUploadStatistics(): Promise<void> {
  'use server';

  // Invalidate cached upload statistics
  revalidateTag('upload-statistics');
}

export async function invalidateSystemHealth(): Promise<void> {
  'use server';

  // Invalidate cached system health data
  revalidateTag('system-health');
}

export async function invalidateStaticContent(): Promise<void> {
  'use server';

  // Invalidate all static content caches
  revalidateTag('static-content');
  revalidateTag('technology-info');
  revalidateTag('feature-flags');
}

export async function invalidateAllCaches(): Promise<void> {
  'use server';

  // Invalidate all cache tags
  revalidateTag('blob-config');
  revalidateTag('upload-statistics');
  revalidateTag('system-health');
  revalidateTag('static-content');
  revalidateTag('technology-info');
  revalidateTag('feature-flags');
  revalidateTag('storage-stats');
}