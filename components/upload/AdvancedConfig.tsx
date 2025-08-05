'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { type UploadOptions } from '@/hooks/useClientUpload';
import { RotateCcw, Settings } from 'lucide-react';

interface AdvancedConfigProps {
  onConfigChange: (config: UploadOptions) => void;
  className?: string;
}

export function AdvancedConfig({ onConfigChange, className = '' }: AdvancedConfigProps) {
  const [config, setConfig] = useState<UploadOptions>({
    maxSize: 100 * 1024 * 1024, // 100MB default
    allowedTypes: [],
    addRandomSuffix: true,
    allowOverwrite: false,
    cacheControlMaxAge: 60 * 60 * 24 * 30, // 30 days
    validityMinutes: 60, // 1 hour
    multipart: false,
    clientPayload: {},
  });

  const [customTypes, setCustomTypes] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [customPayload, setCustomPayload] = useState('');
  const [contentType, setContentType] = useState('');

  const updateConfig = (updates: Partial<UploadOptions>) => {
    const newConfig = { 
      ...config, 
      ...updates,
      folderPath: folderPath || undefined,
      contentType: contentType || undefined,
      clientPayload: customPayload ? (() => {
        try {
          return JSON.parse(customPayload);
        } catch {
          return { customData: customPayload };
        }
      })() : undefined,
    };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const resetToDefaults = () => {
    const defaultConfig: UploadOptions = {
      maxSize: 100 * 1024 * 1024,
      allowedTypes: [],
      addRandomSuffix: true,
      allowOverwrite: false,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
      validityMinutes: 60,
      multipart: false,
      clientPayload: {},
    };
    setConfig(defaultConfig);
    setCustomTypes('');
    setFolderPath('');
    setCustomPayload('');
    setContentType('');
    onConfigChange(defaultConfig);
  };

  const handleTypesChange = (value: string) => {
    setCustomTypes(value);
    const types = value
      .split(',')
      .map(type => type.trim())
      .filter(type => type.length > 0);
    updateConfig({ allowedTypes: types.length > 0 ? types : [] });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Advanced Configuration
              </CardTitle>
              <CardDescription>
                Fine-tune all available upload options for complete control
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={resetToDefaults}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Restrictions */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">File Restrictions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxSize">Maximum File Size</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="maxSize"
                      type="number"
                      value={Math.floor((config.maxSize || 0) / (1024 * 1024))}
                      onChange={(e) => updateConfig({ maxSize: parseInt(e.target.value) * 1024 * 1024 })}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground min-w-[3rem]">MB</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current: {formatBytes(config.maxSize || 0)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="allowedTypes">Allowed File Types</Label>
                  <Input
                    id="allowedTypes"
                    placeholder="image/*, video/mp4, application/pdf"
                    value={customTypes}
                    onChange={(e) => handleTypesChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated MIME types. Leave empty for all types.
                  </p>
                  {config.allowedTypes && config.allowedTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {config.allowedTypes.map((type, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Upload Behavior */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Upload Behavior</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Add Random Suffix</Label>
                  <p className="text-xs text-muted-foreground">
                    Append unique suffix to prevent filename conflicts
                  </p>
                </div>
                <Switch
                  checked={config.addRandomSuffix}
                  onCheckedChange={(checked) => updateConfig({ addRandomSuffix: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Overwrite</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow overwriting existing files with same name
                  </p>
                </div>
                <Switch
                  checked={config.allowOverwrite}
                  onCheckedChange={(checked) => updateConfig({ allowOverwrite: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Multipart Upload</Label>
                  <p className="text-xs text-muted-foreground">
                    Use multipart upload for better reliability
                  </p>
                </div>
                <Switch
                  checked={config.multipart}
                  onCheckedChange={(checked) => updateConfig({ multipart: checked })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Caching & Timing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Caching & Timing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cacheControl">Cache Control Max Age</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="cacheControl"
                    type="number"
                    value={Math.floor((config.cacheControlMaxAge || 0) / 3600)}
                    onChange={(e) => updateConfig({ cacheControlMaxAge: parseInt(e.target.value) * 3600 })}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground min-w-[3rem]">hours</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: {formatDuration(config.cacheControlMaxAge || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenValidity">Token Validity</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="tokenValidity"
                    type="number"
                    value={config.validityMinutes || 60}
                    onChange={(e) => updateConfig({ validityMinutes: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground min-w-[3rem]">min</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  How long the upload token remains valid
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Organization */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Organization</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="folderPath">Folder Path</Label>
                <Input
                  id="folderPath"
                  placeholder="uploads/images"
                  value={folderPath}
                  onChange={(e) => {
                    setFolderPath(e.target.value);
                    updateConfig({});
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Optional folder path to organize uploads (e.g., &ldquo;uploads/2024&rdquo;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contentType">Content Type Override</Label>
                <Input
                  id="contentType"
                  placeholder="image/jpeg, text/plain, application/pdf"
                  value={contentType}
                  onChange={(e) => {
                    setContentType(e.target.value);
                    updateConfig({});
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Override the auto-detected content type (optional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customPayload">Custom Payload (JSON)</Label>
                <Input
                  id="customPayload"
                  placeholder={'{"category": "profile", "userId": "123"}'}
                  value={customPayload}
                  onChange={(e) => {
                    setCustomPayload(e.target.value);
                    updateConfig({});
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Additional metadata to include with uploads
                </p>
              </div>
            </div>
          </div>

          {/* Current Configuration Summary */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Current Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Max Size:</span>
                <br />
                <span className="font-mono">{formatBytes(config.maxSize || 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cache:</span>
                <br />
                <span className="font-mono">{formatDuration(config.cacheControlMaxAge || 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Token:</span>
                <br />
                <span className="font-mono">{config.validityMinutes}m</span>
              </div>
              <div>
                <span className="text-muted-foreground">Multipart:</span>
                <br />
                <span className="font-mono">{config.multipart ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}