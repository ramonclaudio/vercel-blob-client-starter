'use cache';

import { unstable_cacheLife as cacheLife } from 'next/cache';

export async function getStaticContent(): Promise<{ version: string; lastUpdated: string }> {
  'use cache';
  cacheLife('hours');

  return {
    version: '1.0.2',
    lastUpdated: new Date().toISOString(),
  };
}

export async function getBlobStorageStats(): Promise<{ quota: string; usage: string }> {
  'use cache';
  cacheLife('minutes');

  return {
    quota: '100GB',
    usage: '2.5GB',
  };
}

export async function getFeatureFlags(): Promise<{
  advancedMode: boolean;
  multipartUpload: boolean;
  metadata: boolean
}> {
  'use cache';
  cacheLife('hours');

  return {
    advancedMode: true,
    multipartUpload: true,
    metadata: true,
  };
}

export async function getTechnologiesInfo(): Promise<Array<{
  name: string;
  version: string;
  description: string;
}>> {
  'use cache';
  cacheLife('days');

  return [
    {
      name: 'React',
      version: '19',
      description: 'Latest features including use cache directive'
    },
    {
      name: 'Next.js',
      version: '16',
      description: 'App Router with enhanced caching'
    },
    {
      name: 'Tailwind CSS',
      version: '4',
      description: 'Modern utility-first styling'
    },
    {
      name: 'shadcn/ui',
      version: 'latest',
      description: 'Beautiful accessible components'
    }
  ];
}