// frontend/src/pages/Builder.tsx
import React, { useState } from 'react';
import { Loader2, Code, Save } from 'lucide-react';
import { AICommandBar } from '../components/builder/AICommandBar';
import { AIPreview } from '../components/builder/AIPreview';
import { ComponentLibrary } from '../components/builder/ComponentLibrary';
import { Button } from '../components/common/Button';
import { useSubscription } from '../hooks/useSubscription';
import { PlanType } from '../../../shared/types/payment';

interface GeneratedComponent {
  code: string;
  framework: string;
  styling: string;
}

export const Builder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'library'>('generate');
  const [generatedComponent, setGeneratedComponent] = useState<GeneratedComponent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { checkPlanAccess } = useSubscription();

  const handleCodeGeneration = (result: GeneratedComponent) => {
    setGeneratedComponent(result);
  };

  const handleSaveComponent = async () => {
    if (!generatedComponent) return;

    if (!checkPlanAccess([PlanType.BASIC, PlanType.PREMIUM, PlanType.ENTERPRISE])) {
      // Show upgrade modal or notification
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/components', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: generatedComponent.code,
          framework: generatedComponent.framework,
          styling: generatedComponent.styling,
        }),
      });

      if (!response.ok) throw new Error('Failed to save component');

      // Show success notification
    } catch (error) {
      // Show error notification
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16 justify-between">
            <div className="flex space-x-8">
              <button
                className={`h-full px-4 border-b-2 ${
                  activeTab === 'generate'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('generate')}
              >
                Generate
              </button>
              <button
                className={`h-full px-4 border-b-2 ${
                  activeTab === 'library'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('library')}
              >
                Library
              </button>
            </div>
            
            {generatedComponent && (
              <Button
                onClick={handleSaveComponent}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Component
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'generate' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Code Generation */}
            <div className="space-y-4">
              <div className="bg-white p-6 rounded-lg border">
                <h2 className="text-lg font-semibold mb-4">Generated Code</h2>
                {generatedComponent ? (
                  <pre className="p-4 bg-gray-50 rounded-md overflow-auto">
                    <code>{generatedComponent.code}</code>
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Code className="h-12 w-12 mb-4" />
                    <p>Use the command bar below to generate code</p>
                  </div>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-white rounded-lg border">
              {generatedComponent ? (
                <AIPreview
                  code={generatedComponent.code}
                  framework={generatedComponent.framework}
                  styling={generatedComponent.styling}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <p>Preview will appear here</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <ComponentLibrary />
        )}
      </main>

      {/* Command Bar */}
      {activeTab === 'generate' && (
        <AICommandBar
          onCodeGenerated={handleCodeGeneration}
          onError={(error) => {
            // Show error notification
            console.error(error);
          }}
        />
      )}
    </div>
  );
};

export default Builder;