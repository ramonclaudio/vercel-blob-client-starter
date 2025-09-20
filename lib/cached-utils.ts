'use cache';

export async function formatFileSize(bytes: number): Promise<string> {
  'use cache';

  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export async function formatDate(dateString: string): Promise<string> {
  'use cache';

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function getFileType(pathname: string): Promise<string> {
  'use cache';

  const extension = pathname.split('.').pop()?.toLowerCase() || '';

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension)) {
    return 'image';
  }

  if (['mp4', 'webm', 'ogg', 'avi', 'mov', 'wmv', 'flv', 'm4v'].includes(extension)) {
    return 'video';
  }

  if (['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma'].includes(extension)) {
    return 'audio';
  }

  if (extension === 'pdf') {
    return 'pdf';
  }

  if (['txt', 'md', 'json', 'xml', 'csv', 'log', 'yml', 'yaml'].includes(extension)) {
    return 'text';
  }

  return 'file';
}

export async function truncateFilename(filename: string, maxLength = 50): Promise<string> {
  'use cache';

  if (filename.length <= maxLength) return filename;

  const extension = filename.split('.').pop();
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));

  if (nameWithoutExt.length <= 20) return filename;

  const start = nameWithoutExt.substring(0, 20);
  const end = nameWithoutExt.substring(nameWithoutExt.length - 10);

  return `${start}...${end}.${extension}`;
}

export async function processImageSizes(type: 'gallery' | 'preview'): Promise<string> {
  'use cache';

  switch (type) {
    case 'gallery':
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';
    case 'preview':
      return '(max-width: 768px) 95vw, (max-width: 1400px) 85vw, 80vw';
    default:
      return '100vw';
  }
}

export async function generateBlobCopyName(originalPath: string): Promise<string> {
  'use cache';

  const originalName = originalPath.split('/').pop() || 'file';
  const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
  const nameWithoutExtension = originalName.replace(`.${extension}`, '');
  const newPathname = `${originalPath.replace(originalName, '')}${nameWithoutExtension}-copy${extension ? `.${extension}` : ''}`;

  return newPathname;
}

export async function validateFileType(fileType: string, allowedTypes?: string[]): Promise<{ isValid: boolean; error?: string }> {
  'use cache';

  if (!allowedTypes || allowedTypes.length === 0) {
    return { isValid: true };
  }

  const isAllowed = allowedTypes.some(type => {
    if (type.endsWith('/*')) {
      return fileType.startsWith(type.slice(0, -1));
    }
    return fileType === type;
  });

  if (!isAllowed) {
    return {
      isValid: false,
      error: `File type "${fileType}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }

  return { isValid: true };
}