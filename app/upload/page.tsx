'use client';

import { useState, useEffect, Suspense, useOptimistic, startTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/components/upload/UploadZone';
import { type PutBlobResult } from '@vercel/blob';
import { type UploadOptions } from '@/hooks/useClientUpload';
import { useDeleteBlob } from '@/hooks/useDeleteBlob';
import { useNavigationBlocker } from '@/contexts/navigation-blocker';
import { Trash2, Upload, Settings } from 'lucide-react';
import { toast } from 'sonner';
import type { HowTo, WithContext } from 'schema-dts';
import { AdvancedConfig } from '@/components/upload/AdvancedConfig';
import { FileGallery } from '@/components/gallery/FileGallery';

interface FileItem extends PutBlobResult {
  uploadedAt: string;
  size?: number;
}

export interface OptimisticFileItem extends Partial<FileItem> {
  id: string;
  name: string;
  size: number;
  type: string;
  isOptimistic?: boolean;
  uploadedAt: string;
  url?: string;
  pathname?: string;
}

function UploadPageContent() {
  const searchParams = useSearchParams();
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>([]);

  // React 19 useOptimistic for instant file upload feedback
  const [optimisticFiles, addOptimisticFile] = useOptimistic(
    uploadedFiles as OptimisticFileItem[],
    (state, newFile: OptimisticFileItem) => {
      // If it's an optimistic file, add it to the beginning
      if (newFile.isOptimistic) {
        return [newFile, ...state];
      }
      // If it's a real file completing, replace the optimistic one
      const filtered = state.filter(file => !file.isOptimistic || file.id !== newFile.id);
      return [newFile, ...filtered];
    }
  );
  const [activeTab, setActiveTab] = useState<string>('standard');
  const { deleteFile } = useDeleteBlob();
  const { setIsBlocked } = useNavigationBlocker();
  const [advancedConfig, setAdvancedConfig] = useState<UploadOptions>({
    maxSize: 100 * 1024 * 1024,
    allowedTypes: [],
    addRandomSuffix: true,
    allowOverwrite: false,
    cacheControlMaxAge: 60 * 60 * 24 * 30,
    validityMinutes: 60,
    multipart: false,
    clientPayload: {},
  });

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'advanced') {
      setActiveTab('advanced');
    } else {
      setActiveTab('standard');
    }
  }, [searchParams]);

  useEffect(() => {
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      try {
        setUploadedFiles(JSON.parse(savedFiles));
      } catch (error) {
        console.error('Error loading saved files:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

  // React 19 optimistic file handling functions
  const handleOptimisticUploadStart = (files: File[]) => {
    files.forEach(file => {
      const optimisticFile: OptimisticFileItem = {
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        isOptimistic: true,
        uploadedAt: new Date().toISOString(),
        url: `pending://${file.name}`,
        pathname: file.name,
      };

      startTransition(() => {
        addOptimisticFile(optimisticFile);
      });
    });
  };

  const handleUploadComplete = (result: PutBlobResult, originalFile: File) => {
    const completedFile: OptimisticFileItem = {
      ...result,
      id: `${originalFile.name}-completed`,
      name: originalFile.name,
      size: originalFile.size,
      type: originalFile.type,
      uploadedAt: new Date().toISOString(),
      isOptimistic: false,
    };

    // Update the real state for persistence
    const fileItem: FileItem = {
      ...result,
      uploadedAt: completedFile.uploadedAt,
      size: originalFile.size,
    };

    startTransition(() => {
      setUploadedFiles(prev => [fileItem, ...prev]);
      addOptimisticFile(completedFile);
    });

    console.log('Upload completed:', fileItem);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const handleDeleteFile = async (fileToDelete: FileItem | OptimisticFileItem) => {
    if (!fileToDelete.url || !fileToDelete.pathname) {
      toast.error('Cannot delete file: missing required properties');
      return;
    }

    const toastId = toast.loading(`Deleting ${fileToDelete.pathname}...`);
    setIsBlocked(true);

    try {
      await deleteFile(fileToDelete.url);

      setUploadedFiles(prev => prev.filter(file => file.url !== fileToDelete.url));

      toast.success(`Successfully deleted ${fileToDelete.pathname}!`, { id: toastId });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      toast.error(`Failed to delete file: ${errorMessage}`, { id: toastId });
    } finally {
      setIsBlocked(false);
    }
  };

  const handleCopyFile = (originalFile: FileItem | OptimisticFileItem, newFile: FileItem) => {
    setUploadedFiles(prev => [...prev, newFile]);
  };

  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  const howToSchema: WithContext<HowTo> = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Upload Files with Vercel Blob',
    description: 'Step-by-step guide to upload files using the Vercel Blob client-side upload interface with drag & drop functionality',
    image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image',
    totalTime: 'PT2M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    supply: [
      {
        '@type': 'HowToSupply',
        name: 'Files to upload (images, documents, videos, etc.)'
      }
    ],
    tool: [
      {
        '@type': 'HowToTool',
        name: 'Web Browser',
        description: 'Modern web browser with JavaScript support'
      }
    ],
    step: [
      {
        '@type': 'HowToStep',
        name: 'Choose Upload Mode',
        text: 'Select between Standard Upload for simple drag & drop or Advanced Configuration for custom options',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      },
      {
        '@type': 'HowToStep',
        name: 'Select Files',
        text: 'Drag and drop files into the upload zone or click to browse and select files from your device',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      },
      {
        '@type': 'HowToStep',
        name: 'Configure Options (Advanced Mode)',
        text: 'Set file type restrictions, size limits, cache control, and other advanced upload options',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      },
      {
        '@type': 'HowToStep',
        name: 'Monitor Progress',
        text: 'Watch real-time upload progress with the ability to cancel uploads if needed',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      },
      {
        '@type': 'HowToStep',
        name: 'Manage Uploaded Files',
        text: 'View uploaded files in the gallery, copy URLs, or delete files as needed',
        image: 'https://vercel-blob-client-starter.vercel.app/opengraph-image'
      }
    ]
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema).replace(/</g, '\\u003c'),
        }}
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Vercel Blob Upload Demo</h1>
        <p className="text-muted-foreground">
          Complete showcase of Vercel Blob client-side upload capabilities
        </p>
      </div>

      <Tabs value={activeTab} className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard" className="flex items-center">
            <Upload className="w-4 h-4 mr-2" />
            Standard Upload
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center">
            <Settings className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Advanced Config</span>
            <span className="sm:hidden">Advanced</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Standard File Upload</CardTitle>
              <CardDescription>
                Simple drag & drop upload with sensible defaults. Supports all file types up to 100MB with automatic multipart handling for large files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadZone
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                onUploadStart={handleOptimisticUploadStart}
                multiple={true}
                options={{
                  maxSize: 100 * 1024 * 1024,
                  addRandomSuffix: true,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <AdvancedConfig
                onConfigChange={setAdvancedConfig}
              />
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Upload</CardTitle>
                  <CardDescription>
                    Upload with your custom configuration settings applied
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <UploadZone
                    onUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                    onUploadStart={handleOptimisticUploadStart}
                    multiple={true}
                    options={advancedConfig}
                    accept={advancedConfig.allowedTypes?.length ? advancedConfig.allowedTypes.join(',') : undefined}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Active Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max File Size:</span>
                      <span className="font-mono">
                        {Math.floor((advancedConfig.maxSize || 0) / (1024 * 1024))}MB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">File Types:</span>
                      <span className="font-mono">
                        {advancedConfig.allowedTypes?.length ? 
                          `${advancedConfig.allowedTypes.length} types` : 
                          'All types'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Random Suffix:</span>
                      <span className="font-mono">
                        {advancedConfig.addRandomSuffix ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Allow Overwrite:</span>
                      <span className="font-mono">
                        {advancedConfig.allowOverwrite ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Multipart:</span>
                      <span className="font-mono">
                        {advancedConfig.multipart ? 'Yes' : 'Auto'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Token Validity:</span>
                      <span className="font-mono">
                        {advancedConfig.validityMinutes} minutes
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Uploaded Files ({optimisticFiles.length})</CardTitle>
              <CardDescription>
                Files uploaded during this session. Click preview to view or download files.
                {activeTab === 'advanced' && <span className="text-orange-600"> Advanced features like file duplication and metadata inspection are available in this mode.</span>}
              </CardDescription>
            </div>
            {optimisticFiles.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFiles}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <FileGallery
            files={optimisticFiles}
            onDelete={handleDeleteFile}
            onCopy={handleCopyFile}
            showAdvancedFeatures={activeTab === 'advanced'}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<UploadPageSkeleton />}>
      <UploadPageContent />
    </Suspense>
  );
}

function UploadPageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Vercel Blob Upload Demo</h1>
        <p className="text-muted-foreground">
          Complete showcase of Vercel Blob client-side upload capabilities
        </p>
      </div>
      
      <div className="space-y-6">
        <div className="h-12 bg-muted rounded-lg animate-pulse" />
        <div className="rounded-lg border bg-card">
          <div className="p-6 space-y-2">
            <div className="h-6 bg-muted rounded w-48 animate-pulse" />
            <div className="h-4 bg-muted rounded w-96 mt-2 animate-pulse" />
          </div>
          <div className="p-6">
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}