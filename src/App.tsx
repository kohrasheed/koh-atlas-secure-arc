import { useState, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { toast } from 'sonner';
import { ComponentPalette } from './components/palette/ComponentPalette';
import { DiagramCanvas } from './components/canvas/DiagramCanvas';
import { SecurityAnalysis } from './components/analysis/SecurityAnalysis';
import { useArchitectureDesigner } from './hooks/use-architecture-designer';
import { SecurityAnalyzer } from './lib/security-analyzer';
import { SecurityFinding } from './types';
import { Icon } from './components/Icon';

function App() {
  const {
    components,
    connections,
    selectedComponent,
    selectedConnection,
    setSelectedComponent,
    setSelectedConnection,
    addComponent,
    updateComponent,
    removeComponent,
    addConnection,
    updateConnection,
    removeConnection,
    setComponents,
    setConnections,
  } = useArchitectureDesigner();

  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedComponentTemplate, setSelectedComponentTemplate] = useState<string | null>(null);

  const analyzer = new SecurityAnalyzer();

  const handleComponentSelect = useCallback((componentId: string) => {
    setSelectedComponentTemplate(componentId);
    toast.info('Click on the canvas to place the component');
  }, []);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (selectedComponentTemplate) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const position = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      
      addComponent(selectedComponentTemplate, position);
      setSelectedComponentTemplate(null);
      toast.success('Component added to diagram');
    }
  }, [selectedComponentTemplate, addComponent]);

  const handleAnalyze = useCallback(async () => {
    if (components.length === 0) {
      toast.warning('Add some components to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newFindings = analyzer.analyzeArchitecture(components, connections);
      setFindings(newFindings);
      
      if (newFindings.length === 0) {
        toast.success('No security issues found!');
      } else {
        toast.warning(`Found ${newFindings.length} security issues`);
      }
    } catch (error) {
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [components, connections, analyzer]);

  const handleApplyFix = useCallback((findingId: string) => {
    const finding = findings.find(f => f.id === findingId);
    if (!finding) return;

    try {
      const { components: updatedComponents, connections: updatedConnections } = 
        analyzer.applyAutoFix(finding, components, connections);
      
      setComponents(updatedComponents);
      setConnections(updatedConnections);
      
      // Remove the fixed finding
      setFindings(prev => prev.filter(f => f.id !== findingId));
      
      toast.success('Fix applied successfully');
    } catch (error) {
      toast.error('Failed to apply fix');
    }
  }, [findings, components, connections, analyzer, setComponents, setConnections]);

  const handleExportReport = useCallback(() => {
    const report = {
      projectName: 'Architecture Review',
      timestamp: new Date().toISOString(),
      components: components.length,
      connections: connections.length,
      findings: findings.map(f => ({
        title: f.title,
        severity: f.severity,
        category: f.category,
        standards: f.standards,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'security-analysis-report.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully');
  }, [components, connections, findings]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon name="Shield" className="text-primary" size={32} />
            <div>
              <h1 className="text-xl font-bold">Koh Atlas</h1>
              <p className="text-sm text-muted-foreground">Secure Architecture Designer</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {components.length} components, {connections.length} connections
            </span>
            {findings.length > 0 && (
              <span className="text-sm font-medium text-destructive">
                {findings.length} security issues
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <ComponentPalette onComponentSelect={handleComponentSelect} />
        
        <ReactFlowProvider>
          <div className="flex-1 flex" onClick={handleCanvasClick}>
            <DiagramCanvas
              components={components}
              connections={connections}
              selectedComponent={selectedComponent}
              onComponentSelect={setSelectedComponent}
              onComponentUpdate={updateComponent}
              onConnectionCreate={addConnection}
              onConnectionSelect={setSelectedConnection}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </ReactFlowProvider>

        <SecurityAnalysis
          findings={findings}
          isAnalyzing={isAnalyzing}
          onApplyFix={handleApplyFix}
          onExportReport={handleExportReport}
        />
      </div>

      {/* Status Bar */}
      <footer className="h-8 border-t border-border bg-muted px-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {selectedComponentTemplate ? 'Click on canvas to place component' : 'Ready'}
        </span>
        <span>Koh Atlas v1.0</span>
      </footer>
    </div>
  );
}

export default App;