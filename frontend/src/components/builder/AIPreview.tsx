// frontend/src/components/builder/AIPreview.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Refresh, Maximize2, Minimize2, Code, Download } from 'lucide-react';
import { useWebContainer } from '../../hooks/useWebContainer';
import { Button } from '../common/Button';
import { useSubscription } from '../../hooks/useSubscription';
import { PlanType } from '../../../shared/types/payment';

interface AIPreviewProps {
  code: string;
  framework: string;
  styling: string;
  onRefresh?: () => void;
}

export const AIPreview: React.FC<AIPreviewProps> = ({
  code,
  framework,
  styling,
  onRefresh
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const { checkPlanAccess } = useSubscription();

  const {
    mountFiles,
    writeFile,
    startDevServer,
    isReady
  } = useWebContainer();

  useEffect(() => {
    const setupPreview = async () => {
      if (!isReady || !code) return;

      setIsLoading(true);
      setError(null);

      try {
        // Create necessary project files
        const files = await generateProjectFiles(code, framework, styling);
        await mountFiles(files);

        // Install dependencies
        await installDependencies(framework, styling);

        // Start development server
        await startDevServer();

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to setup preview');
        setIsLoading(false);
      }
    };

    setupPreview();
  }, [code, framework, styling, isReady]);

  const generateProjectFiles = async (
    componentCode: string,
    framework: string,
    styling: string
  ) => {
    const files: Record<string, any> = {
      'package.json': {
        content: generatePackageJson(framework, styling)
      },
      'index.html': {
        content: generateIndexHtml()
      },
      'src/index.js': {
        content: generateEntryPoint(framework)
      },
      'src/App.js': {
        content: generateAppWrapper(framework)
      },
      'src/Component.js': {
        content: componentCode
      }
    };

    if (styling === 'tailwind') {
      files['tailwind.config.js'] = {
        content: generateTailwindConfig()
      };
    }

    return files;
  };

  const generatePackageJson = (framework: string, styling: string) => {
    const dependencies: Record<string, string> = {
      [framework]: 'latest',
    };

    if (styling === 'tailwind') {
      dependencies['tailwindcss'] = 'latest';
      dependencies['postcss'] = 'latest';
      dependencies['autoprefixer'] = 'latest';
    }

    return JSON.stringify({
      name: 'preview',
      version: '1.0.0',
      private: true,
      dependencies
    }, null, 2);
  };

  const generateIndexHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Preview</title>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `;

  const handleDownload = async () => {
    if (!checkPlanAccess([PlanType.BASIC, PlanType.PREMIUM, PlanType.ENTERPRISE])) {
      setError('Please upgrade your plan to download components');
      return;
    }

    try {
      const files = await generateProjectFiles(code, framework, styling);
      const zip = await createZipFile(files);
      downloadZip(zip, 'component.zip');
    } catch (err) {
      setError('Failed to download component');
    }
  };

  const toggleFullscreen = () => {
    if (previewRef.current) {
      if (isFullscreen) {
        document.exitFullscreen();
      } else {
        previewRef.current.requestFullscreen();
      }
      setIsFullscreen(!isFullscreen);
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="font-medium">Preview</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <Refresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="relative flex-1">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-gray-500">Setting up preview...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="flex flex-col items-center gap-2 p-4 text-center">
              <Code className="h-8 w-8 text-red-500" />
              <p className="text-sm text-red-500">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        <iframe
          ref={previewRef}
          className="h-full w-full"
          sandbox="allow-scripts allow-same-origin"
          title="Component Preview"
        />
      </div>
    </div>
  );
};