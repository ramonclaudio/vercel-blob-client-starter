'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import type { BlobMetadata } from '@/hooks/useBlobMetadata';

interface MetadataFile {
  pathname?: string;
  url?: string;
}

interface MetadataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  metadataFile: MetadataFile | null;
  isLoadingMetadata: boolean;
  metadata: BlobMetadata | null;
  metadataError: string | null;
  formatFileSize: (bytes: number) => string;
  formatDate: (dateString: string) => string;
}

export function MetadataDialog({
  isOpen,
  onClose,
  metadataFile,
  isLoadingMetadata,
  metadata,
  metadataError,
  formatFileSize,
  formatDate,
}: MetadataDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0" aria-describedby="metadata-description">
        <div className="flex flex-col max-h-[85vh]">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Blob Metadata
            </DialogTitle>
            <DialogDescription id="metadata-description">
              Detailed information about the selected blob file including size, content type, upload time, and URLs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto px-6 pb-6">
          {metadataFile && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">File Information</h4>
              <div className="text-sm space-y-1">
                <div><span className="font-medium">Filename:</span> {metadataFile.pathname?.split('/').pop() || 'Unknown'}</div>
                <div><span className="font-medium">Full Path:</span> {metadataFile.pathname || 'Unknown'}</div>
              </div>
            </div>
          )}

          {isLoadingMetadata && (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="ml-3">Loading metadata...</span>
            </div>
          )}

          {metadataError && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Error</h4>
              <p className="text-sm text-destructive">{metadataError}</p>
            </div>
          )}

          {metadata && !isLoadingMetadata && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Blob Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Size:</span>
                    <div className="font-mono">{formatFileSize(metadata.size)}</div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Content Type:</span>
                    <div className="font-mono break-all">{metadata.contentType}</div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Uploaded At:</span>
                    <div className="font-mono">{formatDate(metadata.uploadedAt.toISOString())}</div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Cache Control:</span>
                    <div className="font-mono break-all">{metadata.cacheControl}</div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">URLs</h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">View URL:</span>
                    <div className="font-mono text-xs break-all bg-background p-2 rounded border mt-1">
                      {metadata.url}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Download URL:</span>
                    <div className="font-mono text-xs break-all bg-background p-2 rounded border mt-1">
                      {metadata.downloadUrl}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Content Disposition</h4>
                <div className="font-mono text-xs break-all bg-background p-2 rounded border">
                  {metadata.contentDisposition}
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}