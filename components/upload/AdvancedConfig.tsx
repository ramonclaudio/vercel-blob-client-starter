'use client';

import { useId, useMemo, useCallback, useReducer, useEffect } from 'react';
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

// React 19 useReducer unified state management
interface ConfigState {
  config: UploadOptions;
  customTypes: string;
  folderPath: string;
  customPayload: string;
  contentType: string;
}

type ConfigAction =
  | { type: 'UPDATE_CONFIG'; payload: Partial<UploadOptions> }
  | { type: 'SET_CUSTOM_TYPES'; payload: string }
  | { type: 'SET_FOLDER_PATH'; payload: string }
  | { type: 'SET_CUSTOM_PAYLOAD'; payload: string }
  | { type: 'SET_CONTENT_TYPE'; payload: string }
  | { type: 'RESET_TO_DEFAULTS' };

function configReducer(state: ConfigState, action: ConfigAction): ConfigState {
  switch (action.type) {
    case 'UPDATE_CONFIG':
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload,
          folderPath: state.folderPath || undefined,
          contentType: state.contentType || undefined,
          clientPayload: state.customPayload ? (() => {
            try {
              return JSON.parse(state.customPayload);
            } catch {
              return { customData: state.customPayload };
            }
          })() : undefined,
        },
      };
    case 'SET_CUSTOM_TYPES':
      const types = action.payload
        .split(',')
        .map(type => type.trim())
        .filter(type => type.length > 0);
      return {
        ...state,
        customTypes: action.payload,
        config: {
          ...state.config,
          allowedTypes: types.length > 0 ? types : [],
        },
      };
    case 'SET_FOLDER_PATH':
      return {
        ...state,
        folderPath: action.payload,
        config: {
          ...state.config,
          folderPath: action.payload || undefined,
        },
      };
    case 'SET_CUSTOM_PAYLOAD':
      return {
        ...state,
        customPayload: action.payload,
        config: {
          ...state.config,
          clientPayload: action.payload ? (() => {
            try {
              return JSON.parse(action.payload);
            } catch {
              return { customData: action.payload };
            }
          })() : undefined,
        },
      };
    case 'SET_CONTENT_TYPE':
      return {
        ...state,
        contentType: action.payload,
        config: {
          ...state.config,
          contentType: action.payload || undefined,
        },
      };
    case 'RESET_TO_DEFAULTS':
      return {
        config: {
          maxSize: 100 * 1024 * 1024,
          allowedTypes: [],
          addRandomSuffix: true,
          allowOverwrite: false,
          cacheControlMaxAge: 60 * 60 * 24 * 30,
          validityMinutes: 60,
          multipart: false,
          clientPayload: {},
        },
        customTypes: '',
        folderPath: '',
        customPayload: '',
        contentType: '',
      };
    default:
      return state;
  }
}

export function AdvancedConfig({ onConfigChange, className = '' }: AdvancedConfigProps) {
  // React 19 useReducer for unified state management
  const [state, dispatch] = useReducer(configReducer, {
    config: {
      maxSize: 100 * 1024 * 1024,
      allowedTypes: [],
      addRandomSuffix: true,
      allowOverwrite: false,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
      validityMinutes: 60,
      multipart: false,
      clientPayload: {},
    },
    customTypes: '',
    folderPath: '',
    customPayload: '',
    contentType: '',
  });

  // Notify parent component of config changes
  useEffect(() => {
    onConfigChange(state.config);
  }, [state.config, onConfigChange]);

  // Generate unique IDs for accessibility (React 19 useId compliance)
  const maxSizeId = useId();
  const allowedTypesId = useId();
  const cacheControlId = useId();
  const tokenValidityId = useId();
  const folderPathId = useId();
  const contentTypeId = useId();
  const customPayloadId = useId();

  const updateConfig = useCallback((updates: Partial<UploadOptions>) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: updates });
  }, []);

  const resetToDefaults = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULTS' });
  }, []);

  const handleTypesChange = useCallback((value: string) => {
    dispatch({ type: 'SET_CUSTOM_TYPES', payload: value });
  }, []);

  const formatBytes = useMemo(() => (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  }, []);

  const formatDuration = useMemo(() => (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  }, []);

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
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">File Restrictions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={maxSizeId}>Maximum File Size</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={maxSizeId}
                      type="number"
                      value={Math.floor((state.config.maxSize || 0) / (1024 * 1024))}
                      onChange={(e) => updateConfig({ maxSize: parseInt(e.target.value) * 1024 * 1024 })}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground min-w-[3rem]">MB</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current: {formatBytes(state.config.maxSize || 0)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={allowedTypesId}>Allowed File Types</Label>
                  <Input
                    id={allowedTypesId}
                    placeholder="image/*, video/mp4, application/pdf"
                    value={state.customTypes}
                    onChange={(e) => handleTypesChange(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Comma-separated MIME types. Leave empty for all types.
                  </p>
                  {state.config.allowedTypes && state.config.allowedTypes.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {state.config.allowedTypes.map((type, index) => (
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
                  checked={state.config.addRandomSuffix}
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
                  checked={state.config.allowOverwrite}
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
                  checked={state.config.multipart}
                  onCheckedChange={(checked) => updateConfig({ multipart: checked })}
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Caching & Timing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={cacheControlId}>Cache Control Max Age</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={cacheControlId}
                    type="number"
                    value={Math.floor((state.config.cacheControlMaxAge || 0) / 3600)}
                    onChange={(e) => updateConfig({ cacheControlMaxAge: parseInt(e.target.value) * 3600 })}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground min-w-[3rem]">hours</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Current: {formatDuration(state.config.cacheControlMaxAge || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={tokenValidityId}>Token Validity</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={tokenValidityId}
                    type="number"
                    value={state.config.validityMinutes || 60}
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

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Organization</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={folderPathId}>Folder Path</Label>
                <Input
                  id={folderPathId}
                  placeholder="uploads/images"
                  value={state.folderPath}
                  onChange={(e) => {
                    dispatch({ type: 'SET_FOLDER_PATH', payload: e.target.value });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Optional folder path to organize uploads (e.g., &ldquo;uploads/2024&rdquo;)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={contentTypeId}>Content Type Override</Label>
                <Input
                  id={contentTypeId}
                  placeholder="image/jpeg, text/plain, application/pdf"
                  value={state.contentType}
                  onChange={(e) => {
                    dispatch({ type: 'SET_CONTENT_TYPE', payload: e.target.value });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Override the auto-detected content type (optional)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor={customPayloadId}>Custom Payload (JSON)</Label>
                <Input
                  id={customPayloadId}
                  placeholder={'{"category": "profile", "userId": "123"}'}
                  value={state.customPayload}
                  onChange={(e) => {
                    dispatch({ type: 'SET_CUSTOM_PAYLOAD', payload: e.target.value });
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Additional metadata to include with uploads
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Current Configuration</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Max Size:</span>
                <br />
                <span className="font-mono">{formatBytes(state.config.maxSize || 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cache:</span>
                <br />
                <span className="font-mono">{formatDuration(state.config.cacheControlMaxAge || 0)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Token:</span>
                <br />
                <span className="font-mono">{state.config.validityMinutes}m</span>
              </div>
              <div>
                <span className="text-muted-foreground">Multipart:</span>
                <br />
                <span className="font-mono">{state.config.multipart ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}