import { revalidateTag } from 'next/cache';

export async function invalidateUserPreferences(userId: string): Promise<void> {
  'use server';

  // Invalidate cached user preferences with 'max' profile for stale-while-revalidate
  revalidateTag(`user-preferences-${userId}`, 'max');
}

export async function invalidateBlobConfig(): Promise<void> {
  'use server';

  // Invalidate cached blob configuration with 'max' profile
  revalidateTag('blob-config', 'max');
}

export async function invalidateUploadStatistics(): Promise<void> {
  'use server';

  // Invalidate cached upload statistics with 'hours' profile (updates more frequently)
  revalidateTag('upload-statistics', 'hours');
}

export async function invalidateSystemHealth(): Promise<void> {
  'use server';

  // Invalidate cached system health data with 'hours' profile
  revalidateTag('system-health', 'hours');
}

export async function invalidateStaticContent(): Promise<void> {
  'use server';

  // Invalidate all static content caches with appropriate profiles
  revalidateTag('static-content', 'max');
  revalidateTag('technology-info', 'days');
  revalidateTag('feature-flags', 'hours');
}

export async function invalidateAllCaches(): Promise<void> {
  'use server';

  // Invalidate all cache tags with appropriate profiles
  revalidateTag('blob-config', 'max');
  revalidateTag('upload-statistics', 'hours');
  revalidateTag('system-health', 'hours');
  revalidateTag('static-content', 'max');
  revalidateTag('technology-info', 'days');
  revalidateTag('feature-flags', 'hours');
  revalidateTag('storage-stats', 'hours');
}