// frontend/src/components/builder/AICommandBar.tsx
import React, { useState, useRef, useCallback } from 'react';
import { Send, Loader2, Code, Settings, X } from 'lucide-react';
import { useAIGeneration } from '../../hooks/useAIGeneration';
import { useSubscription } from '../../hooks/useSubscription';
import { Button } from '../common/Button';
import { PlanType } from '../../../shared/types/payment';

interface CommandBarProps {
  onCodeGenerated: (code: string) => void;
  onError?: (error: string) => void;
}

export const AICommandBar: React.FC<CommandBarProps> = ({
  onCodeGenerated,
  onError
}) => {
  const [prompt, setPrompt] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [config, setConfig] = useState({
    framework: 'react',
    styling: 'tailwind',
    type: 'component'
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { generateCode, loading } = useAIGeneration();
  const { checkPlanAccess } = useSubscription();

  // Auto-resize textarea as content grows
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setPrompt(textarea.value);
  };

  // Handle command submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || loading) return;

    // Check if user has access to AI generation
    if (!checkPlanAccess([PlanType.BASIC, PlanType.PREMIUM, PlanType.ENTERPRISE])) {
      onError?.('Please upgrade your plan to use AI code generation');
      return;
    }

    try {
      const result = await generateCode(prompt, config);
      onCodeGenerated(result.code);
      setPrompt('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to generate code');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 shadow-lg">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <div className="relative flex items-start gap-2">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Describe the code you want to generate... (e.g., 'Create a responsive navbar with user profile')"
              className="w-full resize-none rounded-lg border p-3 pr-24 focus:outline-none focus:ring-2 focus:ring-primary min-h-[52px] max-h-[200px]"
              rows={1}
            />
            <div className="absolute right-20 bottom-3 text-xs text-gray-400">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <kbd className="rounded border px-2 py-1">⌘ + ↵</kbd>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsConfigOpen(!isConfigOpen)}
              className="flex-shrink-0"
            >
              <Settings className="h-5 w-5" />
            </Button>

            <Button
              type="submit"
              disabled={!prompt.trim() || loading}
              className="flex-shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isConfigOpen && (
          <div className="mt-4 rounded-lg border p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Generation Settings</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsConfigOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Framework</label>
                <select
                  value={config.framework}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    framework: e.target.value
                  }))}
                  className="w-full rounded-md border p-2"
                >
                  <option value="react">React</option>
                  <option value="vue">Vue</option>
                  <option value="angular">Angular</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Styling</label>
                <select
                  value={config.styling}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    styling: e.target.value
                  }))}
                  className="w-full rounded-md border p-2"
                >
                  <option value="tailwind">Tailwind CSS</option>
                  <option value="css">Plain CSS</option>
                  <option value="scss">SCSS</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  value={config.type}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    type: e.target.value
                  }))}
                  className="w-full rounded-md border p-2"
                >
                  <option value="component">Component</option>
                  <option value="function">Function</option>
                  <option value="api">API Endpoint</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};