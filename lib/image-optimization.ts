/**
 * Image optimization utilities for Vercel Blob Storage
 * Provides helpers for responsive images, quality settings, and format selection
 */

// Generate optimized image loader for Vercel Blob images
export const blobImageLoader = ({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) => {
  // Vercel automatically optimizes blob images
  // Add query params for width and quality
  const params = new URLSearchParams();
  params.set('w', width.toString());
  params.set('q', (quality || 85).toString());

  // For blob URLs, Vercel's Image Optimization API handles this automatically
  return src.includes('blob.vercel-storage.com')
    ? `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 85}`
    : src;
};

// Responsive image sizes based on common breakpoints
export const getImageSizes = (type: 'thumbnail' | 'gallery' | 'full' = 'gallery') => {
  switch (type) {
    case 'thumbnail':
      // Small previews
      return "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw";
    case 'gallery':
      // Gallery grid items
      return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
    case 'full':
      // Full width images
      return "100vw";
    default:
      return "100vw";
  }
};

// Quality settings based on image importance
export const getImageQuality = (priority: 'low' | 'medium' | 'high' = 'medium') => {
  switch (priority) {
    case 'low':
      return 60; // Background images, decorative
    case 'medium':
      return 75; // Standard gallery images
    case 'high':
      return 90; // Hero images, product photos
    default:
      return 75;
  }
};

// Generate blur placeholder for smooth loading
export const BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

// Check if image should be optimized
export const shouldOptimizeImage = (url: string, size?: number) => {
  // Skip optimization for tiny images (< 10KB)
  if (size && size < 10240) return false;

  // Skip optimization for SVGs and GIFs
  const skipExtensions = ['.svg', '.gif'];
  if (skipExtensions.some(ext => url.toLowerCase().includes(ext))) return false;

  // Optimize all blob storage images
  if (url.includes('blob.vercel-storage.com')) return true;

  return true;
};

// Image format detection
export const getImageFormat = (contentType?: string): 'image' | 'video' | 'other' => {
  if (!contentType) return 'other';
  if (contentType.startsWith('image/')) return 'image';
  if (contentType.startsWith('video/')) return 'video';
  return 'other';
};