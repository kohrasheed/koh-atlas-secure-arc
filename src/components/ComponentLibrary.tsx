import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { 
  Plus, 
  Download, 
  Upload, 
  Trash, 
  Package,
  Share,
  Eye,
  File,
  ArrowDown,
  ArrowUp
} from '@phosphor-icons/react';
import { 
  safeParseJSON, 
  ComponentLibrarySchema,
  generateSecureId,
  sanitizeInput,
  sanitizeError,
  validateFileSize,
  MAX_FILE_SIZE
} from '@/lib/security-utils';

// Component library types
export interface CustomComponent {
  id: string;
  type: string;
  label: string;
  icon: string; // Icon name as string
  category: 'application' | 'security' | 'network' | 'data' | 'container' | 'custom';
  color: string;
  description?: string;
  isContainer?: boolean;
  ports?: number[];
  protocols?: string[];
  vendor?: string;
  version?: string;
  tags?: string[];
  created: string;
  author?: string;
}

export interface ComponentLibrary {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  components: CustomComponent[];
  created: string;
  updated: string;
}

interface ComponentLibraryProps {
  onImportComponents: (components: CustomComponent[]) => void;
  existingComponents: CustomComponent[];
}

const defaultIcons = [
  'Shield', 'Database', 'Globe', 'Cloud', 'Eye', 'Desktop', 'DeviceMobile', 
  'HardDrives', 'Browser', 'Scales', 'Network', 'Tree', 'Hexagon', 'Server',
  'Lock', 'Key', 'Cpu', 'CircuitBoard', 'Router', 'Switch', 'Firewall'
];

const ComponentLibrary: React.FC<ComponentLibraryProps> = ({ 
  onImportComponents, 
  existingComponents 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'import' | 'export'>('browse');
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([]);
  const [libraries, setLibraries] = useState<ComponentLibrary[]>([]);
  
  // Create component form state
  const [newComponent, setNewComponent] = useState<Partial<CustomComponent>>({
    type: '',
    label: '',
    icon: 'Shield',
    category: 'custom',
    color: '#3b82f6',
    description: '',
    isContainer: false,
    ports: [],
    protocols: [],
    vendor: '',
    version: '1.0.0',
    tags: []
  });

  // Create library form state
  const [newLibrary, setNewLibrary] = useState<Partial<ComponentLibrary>>({
    name: '',
    description: '',
    version: '1.0.0',
    author: ''
  });

  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  // Reset form
  const resetForm = () => {
    setNewComponent({
      type: '',
      label: '',
      icon: 'Shield',
      category: 'custom',
      color: '#3b82f6',
      description: '',
      isContainer: false,
      ports: [],
      protocols: [],
      vendor: '',
      version: '1.0.0',
      tags: []
    });
  };

  // Create new component
  const createComponent = () => {
    if (!newComponent.type || !newComponent.label) {
      toast.error('Component type and label are required');
      return;
    }

    const component: CustomComponent = {
      id: generateSecureId('custom'),
      type: sanitizeInput(newComponent.type, 50),
      label: sanitizeInput(newComponent.label, 100),
      icon: newComponent.icon || 'Shield',
      category: newComponent.category || 'custom',
      color: newComponent.color || '#3b82f6',
      description: newComponent.description,
      isContainer: newComponent.isContainer || false,
      ports: newComponent.ports || [],
      protocols: newComponent.protocols || [],
      vendor: newComponent.vendor,
      version: newComponent.version || '1.0.0',
      tags: newComponent.tags || [],
      created: new Date().toISOString(),
      author: 'User'
    };

    setCustomComponents(prev => [...prev, component]);
    resetForm();
    toast.success('Custom component created successfully');
  };

  // Delete component
  const deleteComponent = (id: string) => {
    setCustomComponents(prev => prev.filter(c => c.id !== id));
    toast.success('Component deleted');
  };

  // Create library from selected components
  const createLibrary = () => {
    if (!newLibrary.name || selectedComponents.length === 0) {
      toast.error('Library name and at least one component are required');
      return;
    }

    const components = customComponents.filter(c => selectedComponents.includes(c.id));
    
    const library: ComponentLibrary = {
      id: generateSecureId('lib'),
      name: sanitizeInput(newLibrary.name, 100),
      description: sanitizeInput(newLibrary.description || '', 500),
      version: newLibrary.version || '1.0.0',
      author: newLibrary.author || 'User',
      components,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    };

    setLibraries(prev => [...prev, library]);
    setNewLibrary({ name: '', description: '', version: '1.0.0', author: '' });
    setSelectedComponents([]);
    toast.success('Component library created successfully');
  };

  // Export library as JSON
  const exportLibrary = (library: ComponentLibrary) => {
    const dataStr = JSON.stringify(library, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${library.name.toLowerCase().replace(/\s+/g, '-')}-v${library.version}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Library exported successfully');
  };

  // Import library from JSON
  const importLibrary = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // SEC-003: Validate file size
    try {
      validateFileSize(file, MAX_FILE_SIZE);
    } catch (error) {
      toast.error(sanitizeError(error, 'File validation'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // SEC-001: Safe JSON parsing with validation
        const libraryData = safeParseJSON(content, ComponentLibrarySchema, MAX_FILE_SIZE);

        // Add imported library
        const importedLibrary: ComponentLibrary = {
          ...libraryData,
          id: generateSecureId('imported'),
          updated: new Date().toISOString()
        };

        setLibraries(prev => [...prev, importedLibrary]);
        toast.success(`Imported library: ${libraryData.name}`);
        
      } catch (error) {
        toast.error(sanitizeError(error, 'Library import'));
      }
    };
    
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  // Import components from library to main app
  const importComponentsToApp = (library: ComponentLibrary) => {
    onImportComponents(library.components);
    toast.success(`Imported ${library.components.length} components to application`);
  };

  // Predefined component templates
  const componentTemplates = [
    {
      type: 'custom-siem',
      label: 'SIEM',
      icon: 'Eye',
      category: 'security' as const,
      color: '#dc2626',
      description: 'Security Information and Event Management system',
      ports: [514, 6514, 443],
      protocols: ['Syslog', 'HTTPS', 'SNMP']
    },
    {
      type: 'custom-backup',
      label: 'Backup Storage',
      icon: 'HardDrives',
      category: 'data' as const,
      color: '#059669',
      description: 'Backup and disaster recovery storage',
      ports: [443, 22],
      protocols: ['HTTPS', 'SFTP']
    },
    {
      type: 'custom-monitoring',
      label: 'Monitoring',
      icon: 'Eye',
      category: 'application' as const,
      color: '#7c3aed',
      description: 'Application and infrastructure monitoring',
      ports: [9090, 3000, 443],
      protocols: ['Prometheus', 'Grafana', 'HTTPS']
    }
  ];

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="mb-2"
      >
        <Package className="w-4 h-4 mr-1" />
        Component Library
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Component Library Manager</DialogTitle>
          </DialogHeader>
          
          <div className="flex h-[60vh]">
            {/* Sidebar */}
            <div className="w-48 border-r border-border pr-4">
              <div className="space-y-2">
                <Button
                  variant={activeTab === 'browse' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('browse')}
                  className="w-full justify-start"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Browse
                </Button>
                <Button
                  variant={activeTab === 'create' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('create')}
                  className="w-full justify-start"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
                <Button
                  variant={activeTab === 'import' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('import')}
                  className="w-full justify-start"
                >
                  <ArrowUp className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button
                  variant={activeTab === 'export' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('export')}
                  className="w-full justify-start"
                >
                  <ArrowDown className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 pl-4">
              <ScrollArea className="h-full">
                {activeTab === 'browse' && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Available Libraries</h3>
                    
                    {libraries.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No libraries available</p>
                        <p className="text-xs">Create or import libraries to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {libraries.map(library => (
                          <Card key={library.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-sm">{library.name}</CardTitle>
                                <div className="flex gap-1">
                                  <Badge variant="outline">v{library.version}</Badge>
                                  <Badge variant="secondary">{library.components.length} components</Badge>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{library.description}</p>
                            </CardHeader>
                            <CardContent>
                              <div className="flex justify-between items-center">
                                <div className="text-xs text-muted-foreground">
                                  By {library.author}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => importComponentsToApp(library)}
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Import
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => exportLibrary(library)}
                                  >
                                    <Share className="w-4 h-4 mr-1" />
                                    Export
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'create' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">Create Custom Component</h3>
                      <Button size="sm" onClick={resetForm} variant="outline">
                        Reset Form
                      </Button>
                    </div>
                    
                    {/* Quick templates */}
                    <div>
                      <Label className="text-xs font-medium">Quick Templates</Label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        {componentTemplates.map(template => (
                          <Button
                            key={template.type}
                            size="sm"
                            variant="outline"
                            onClick={() => setNewComponent({ ...template })}
                            className="h-auto p-2 text-xs"
                          >
                            {template.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="comp-type">Component Type *</Label>
                        <Input
                          id="comp-type"
                          value={newComponent.type || ''}
                          onChange={(e) => setNewComponent(prev => ({ ...prev, type: e.target.value }))}
                          placeholder="e.g., custom-siem"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comp-label">Display Label *</Label>
                        <Input
                          id="comp-label"
                          value={newComponent.label || ''}
                          onChange={(e) => setNewComponent(prev => ({ ...prev, label: e.target.value }))}
                          placeholder="e.g., SIEM"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comp-icon">Icon</Label>
                        <Select
                          value={newComponent.icon || 'Shield'}
                          onValueChange={(value) => setNewComponent(prev => ({ ...prev, icon: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {defaultIcons.map(icon => (
                              <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comp-category">Category</Label>
                        <Select
                          value={newComponent.category || 'custom'}
                          onValueChange={(value: any) => setNewComponent(prev => ({ ...prev, category: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="application">Application</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="network">Network</SelectItem>
                            <SelectItem value="data">Data</SelectItem>
                            <SelectItem value="container">Container</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comp-color">Color</Label>
                        <Input
                          id="comp-color"
                          type="color"
                          value={newComponent.color || '#3b82f6'}
                          onChange={(e) => setNewComponent(prev => ({ ...prev, color: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="comp-vendor">Vendor</Label>
                        <Input
                          id="comp-vendor"
                          value={newComponent.vendor || ''}
                          onChange={(e) => setNewComponent(prev => ({ ...prev, vendor: e.target.value }))}
                          placeholder="e.g., Splunk, IBM, etc."
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="comp-description">Description</Label>
                      <Textarea
                        id="comp-description"
                        value={newComponent.description || ''}
                        onChange={(e) => setNewComponent(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Component description..."
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="comp-ports">Common Ports (comma-separated)</Label>
                      <Input
                        id="comp-ports"
                        value={newComponent.ports?.join(', ') || ''}
                        onChange={(e) => {
                          const ports = e.target.value.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
                          setNewComponent(prev => ({ ...prev, ports }));
                        }}
                        placeholder="e.g., 443, 514, 9090"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="comp-protocols">Protocols (comma-separated)</Label>
                      <Input
                        id="comp-protocols"
                        value={newComponent.protocols?.join(', ') || ''}
                        onChange={(e) => {
                          const protocols = e.target.value.split(',').map(p => p.trim()).filter(p => p);
                          setNewComponent(prev => ({ ...prev, protocols }));
                        }}
                        placeholder="e.g., HTTPS, Syslog, gRPC"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is-container"
                        checked={newComponent.isContainer || false}
                        onChange={(e) => setNewComponent(prev => ({ ...prev, isContainer: e.target.checked }))}
                      />
                      <Label htmlFor="is-container">Is Container Component</Label>
                    </div>
                    
                    <Button onClick={createComponent} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Component
                    </Button>
                  </div>
                )}

                {activeTab === 'import' && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Import Component Library</h3>
                    
                    <div className="border border-dashed border-border rounded-lg p-8 text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">
                        Import a component library from JSON file
                      </p>
                      <input
                        type="file"
                        accept=".json"
                        onChange={importLibrary}
                        className="hidden"
                        id="import-file"
                      />
                      <Button asChild>
                        <label htmlFor="import-file" className="cursor-pointer">
                          <File className="w-4 h-4 mr-2" />
                          Choose File
                        </label>
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Supported format:</p>
                      <ul className="space-y-1">
                        <li>• JSON files exported from Koh Atlas</li>
                        <li>• Must contain valid component library structure</li>
                        <li>• Components will be validated before import</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'export' && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Export Component Library</h3>
                    
                    {customComponents.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No custom components to export</p>
                        <p className="text-xs">Create components first</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Select components to include in library:</Label>
                          <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded p-2">
                            {customComponents.map(component => (
                              <div key={component.id} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`comp-${component.id}`}
                                  checked={selectedComponents.includes(component.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedComponents(prev => [...prev, component.id]);
                                    } else {
                                      setSelectedComponents(prev => prev.filter(id => id !== component.id));
                                    }
                                  }}
                                />
                                <Label htmlFor={`comp-${component.id}`} className="text-sm">
                                  {component.label} ({component.type})
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="lib-name">Library Name *</Label>
                            <Input
                              id="lib-name"
                              value={newLibrary.name || ''}
                              onChange={(e) => setNewLibrary(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="My Component Library"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="lib-version">Version</Label>
                            <Input
                              id="lib-version"
                              value={newLibrary.version || '1.0.0'}
                              onChange={(e) => setNewLibrary(prev => ({ ...prev, version: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lib-description">Description</Label>
                          <Textarea
                            id="lib-description"
                            value={newLibrary.description || ''}
                            onChange={(e) => setNewLibrary(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Library description..."
                            rows={2}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="lib-author">Author</Label>
                          <Input
                            id="lib-author"
                            value={newLibrary.author || ''}
                            onChange={(e) => setNewLibrary(prev => ({ ...prev, author: e.target.value }))}
                            placeholder="Your name"
                          />
                        </div>
                        
                        <Button 
                          onClick={createLibrary} 
                          className="w-full"
                          disabled={!newLibrary.name || selectedComponents.length === 0}
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Create & Export Library
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComponentLibrary;