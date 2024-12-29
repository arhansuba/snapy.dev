// frontend/src/components/builder/ComponentLibrary.tsx
import React, { useState, useEffect } from 'react';
import { Search, Grid, List, Code, Copy, Edit, Trash } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';

interface Component {
  id: string;
  name: string;
  description: string;
  code: string;
  framework: string;
  styling: string;
  createdAt: Date;
  tags: string[];
  preview?: string;
}

export const ComponentLibrary: React.FC = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    framework: 'all',
    styling: 'all',
  });
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useSubscription();

  useEffect(() => {
    // Fetch components from API
    const fetchComponents = async () => {
      try {
        const response = await fetch('/api/components');
        const data = await response.json();
        setComponents(data);
      } catch (error) {
        console.error('Failed to fetch components:', error);
      }
    };

    fetchComponents();
  }, []);

  const filteredComponents = components.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(search.toLowerCase()) ||
      component.description.toLowerCase().includes(search.toLowerCase());
    
    const matchesFramework = filters.framework === 'all' || component.framework === filters.framework;
    const matchesStyling = filters.styling === 'all' || component.styling === filters.styling;

    return matchesSearch && matchesFramework && matchesStyling;
  });

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };

  const handleDeleteComponent = async (id: string) => {
    try {
      await fetch(`/api/components/${id}`, { method: 'DELETE' });
      setComponents(prev => prev.filter(c => c.id !== id));
      // Show success toast
    } catch (error) {
      // Show error toast
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Component Library</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView(prev => prev === 'grid' ? 'list' : 'grid')}
          >
            {view === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filters.framework}
            onChange={(e) => setFilters(prev => ({ ...prev, framework: e.target.value }))}
            className="rounded-md border p-2"
          >
            <option value="all">All Frameworks</option>
            <option value="react">React</option>
            <option value="vue">Vue</option>
            <option value="angular">Angular</option>
          </select>
          <select
            value={filters.styling}
            onChange={(e) => setFilters(prev => ({ ...prev, styling: e.target.value }))}
            className="rounded-md border p-2"
          >
            <option value="all">All Styles</option>
            <option value="tailwind">Tailwind</option>
            <option value="css">CSS</option>
            <option value="scss">SCSS</option>
          </select>
        </div>
      </div>

      {/* Component Grid/List */}
      {filteredComponents.length === 0 ? (
        <div className="text-center py-12">
          <Code className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold">No components found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {filteredComponents.map((component) => (
            <div
              key={component.id}
              className="group relative rounded-lg border p-4 hover:shadow-md transition-shadow"
            >
              {/* Preview */}
              <div
                className="aspect-video w-full rounded-md bg-gray-100 mb-4"
                dangerouslySetInnerHTML={{ __html: component.preview || '' }}
              />

              {/* Info */}
              <div className="space-y-2">
                <h3 className="font-semibold">{component.name}</h3>
                <p className="text-sm text-gray-500">{component.description}</p>
                
                <div className="flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    {component.framework}
                  </span>
                  <span className="rounded bg-green-100 px-2 py-1 text-xs text-green-700">
                    {component.styling}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopyCode(component.code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedComponent(component);
                    setIsModalOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteComponent(component.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComponent(null);
        }}
        title="Edit Component"
      >
        {selectedComponent && (
          <div className="space-y-4">
            <Input
              label="Name"
              value={selectedComponent.name}
              onChange={(e) => setSelectedComponent(prev => ({
                ...prev!,
                name: e.target.value
              }))}
            />
            <Input
              label="Description"
              value={selectedComponent.description}
              onChange={(e) => setSelectedComponent(prev => ({
                ...prev!,
                description: e.target.value
              }))}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedComponent(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  // Save changes
                  setIsModalOpen(false);
                  setSelectedComponent(null);
                }}
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};