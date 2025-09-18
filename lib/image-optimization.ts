export const blobImageLoader = ({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) => {
  const params = new URLSearchParams();
  params.set('w', width.toString());
  params.set('q', (quality || 85).toString());

  return src.includes('blob.vercel-storage.com')
    ? `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 85}`
    : src;
};

export const getImageSizes = (type: 'thumbnail' | 'gallery' | 'full' = 'gallery') => {
  switch (type) {
    case 'thumbnail':
      return "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw";
    case 'gallery':
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
    case 'full':
      return "100vw";
    default:
      return "100vw";
  }
};

export const getImageQuality = (priority: 'low' | 'medium' | 'high' = 'medium') => {
  return 75;
};

export const BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

export const shouldOptimizeImage = (url: string, size?: number) => {
  if (size && size < 10240) return false;

  const skipExtensions = ['.svg', '.gif'];
  if (skipExtensions.some(ext => url.toLowerCase().includes(ext))) return false;

  if (url.includes('blob.vercel-storage.com')) return true;

  return true;
};

export const getImageFormat = (contentType?: string): 'image' | 'video' | 'other' => {
  if (!contentType) return 'other';
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  return 'other';
};