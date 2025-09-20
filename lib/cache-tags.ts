'use cache';

// import { cacheTag } from 'next/cache'; // Next.js canary only

export async function getUserPreferences(userId: string): Promise<{
  theme: 'light' | 'dark';
  uploadDefaults: {
    maxSize: number;
    autoSuffix: boolean;
  };
}> {
  'use cache';

  // Tag this cache entry for user-specific invalidation
  // cacheTag(`user-preferences-${userId}`); // Next.js canary only

  return {
    theme: 'light',
    uploadDefaults: {
      maxSize: 100 * 1024 * 1024,
      autoSuffix: true,
    },
  };
}

export async function getBlobConfig(): Promise<{
  allowedTypes: string[];
  maxFileSize: number;
  cacheDuration: number;
}> {
  'use cache';

  // Tag this cache entry for blob configuration invalidation
  // cacheTag('blob-config'); // Next.js canary only

  return {
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'application/pdf',
      'text/plain',
    ],
    maxFileSize: 100 * 1024 * 1024,
    cacheDuration: 3600,
  };
}

export async function getUploadStatistics(): Promise<{
  totalUploads: number;
  totalSize: number;
  popularTypes: string[];
}> {
  'use cache';

  // Tag this cache entry for statistics invalidation
  // cacheTag('upload-statistics'); // Next.js canary only

  return {
    totalUploads: 1250,
    totalSize: 2.5 * 1024 * 1024 * 1024, // 2.5GB
    popularTypes: ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'],
  };
}

export async function getSystemHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  version: string;
}> {
  'use cache';

  // Tag this cache entry for system health invalidation
  // cacheTag('system-health'); // Next.js canary only

  return {
    status: 'healthy',
    uptime: 99.9,
    version: '1.0.2',
  };
}