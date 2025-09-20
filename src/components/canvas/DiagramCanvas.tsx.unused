import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection as ReactFlowConnection,
  Controls,
  Background,
  ConnectionMode,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import { ArchComponent, Connection as ArchConnection } from '../../types';
import { ArchComponentNode } from './ArchComponentNode';
import { ConnectionEditor } from './ConnectionEditor';
import { Button } from '../ui/button';
import { Icon } from '../Icon';

const nodeTypes = {
  archComponent: ArchComponentNode,
};

interface DiagramCanvasProps {
  components: ArchComponent[];
  connections: ArchConnection[];
  selectedComponent: string | null;
  selectedConnection: string | null;
  onComponentSelect: (id: string | null) => void;
  onComponentUpdate: (id: string, updates: Partial<ArchComponent>) => void;
  onComponentDelete: (id: string) => void;
  onConnectionCreate: (from: string, to: string) => void;
  onConnectionSelect: (id: string | null) => void;
  onConnectionUpdate: (id: string, updates: Partial<ArchConnection>) => void;
  onConnectionDelete: (id: string) => void;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
}

export function DiagramCanvas({
  components,
  connections,
  selectedComponent,
  selectedConnection,
  onComponentSelect,
  onComponentUpdate,
  onComponentDelete,
  onConnectionCreate,
  onConnectionSelect,
  onConnectionUpdate,
  onConnectionDelete,
  onAnalyze,
  isAnalyzing = false,
}: DiagramCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showConnectionEditor, setShowConnectionEditor] = useState(false);
  const { getViewport, setViewport } = useReactFlow();

  // Convert components to nodes
  const convertComponentsToNodes = useCallback(() => {
    const newNodes: Node[] = components.map((component, index) => ({
      id: component.id,
      type: 'archComponent',
      position: { x: 100 + (index % 5) * 200, y: 100 + Math.floor(index / 5) * 150 },
      data: {
        component,
        isSelected: selectedComponent === component.id,
        onSelect: onComponentSelect,
        onUpdate: onComponentUpdate,
        onDelete: onComponentDelete,
      },
    }));
    setNodes(newNodes);
  }, [components, selectedComponent, onComponentSelect, onComponentUpdate, onComponentDelete, setNodes]);

  // Convert connections to edges
  const convertConnectionsToEdges = useCallback(() => {
    const newEdges: Edge[] = connections.map((connection) => ({
      id: connection.id,
      source: connection.from,
      target: connection.to,
      label: `${connection.protocol}:${connection.ports.join(',')}`,
      style: {
        stroke: selectedConnection === connection.id 
          ? '#3b82f6' 
          : connection.encryption.includes('TLS') ? '#10b981' : '#ef4444',
        strokeWidth: selectedConnection === connection.id ? 3 : 2,
        strokeDasharray: selectedConnection === connection.id ? '5,5' : undefined,
      },
      labelStyle: {
        fill: selectedConnection === connection.id ? '#3b82f6' : '#64748b',
        fontWeight: selectedConnection === connection.id ? 'bold' : 'normal',
      },
      data: { 
        connection,
        isSelected: selectedConnection === connection.id,
        onUpdate: onConnectionUpdate,
        onDelete: onConnectionDelete,
      },
    }));
    setEdges(newEdges);
  }, [connections, selectedConnection, onConnectionUpdate, onConnectionDelete, setEdges]);

  // Update nodes and edges when components/connections change
  useEffect(() => {
    convertComponentsToNodes();
  }, [convertComponentsToNodes]);

  useEffect(() => {
    convertConnectionsToEdges();
  }, [convertConnectionsToEdges]);

  const onConnect = useCallback(
    (connection: ReactFlowConnection) => {
      if (connection.source && connection.target) {
        onConnectionCreate(connection.source, connection.target);
      }
    },
    [onConnectionCreate]
  );

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      onConnectionSelect(edge.id);
      setShowConnectionEditor(true);
    },
    [onConnectionSelect]
  );

  const onPaneClick = useCallback(() => {
    onComponentSelect(null);
    onConnectionSelect(null);
    setShowConnectionEditor(false);
  }, [onComponentSelect, onConnectionSelect]);

  const fitView = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, [setViewport]);

  const handleConnectionEditorClose = () => {
    setShowConnectionEditor(false);
    onConnectionSelect(null);
  };

  const selectedConnectionData = connections.find(c => c.id === selectedConnection);

  return (
    <div className="flex-1 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="bg-background"
      >
        <Background color="#e2e8f0" size={1} className="dark:!bg-muted" />
        <Controls />
        
        {/* Help overlay when empty */}
        {components.length === 0 && (
          <Panel position="center" className="pointer-events-none">
            <div className="bg-card/80 backdrop-blur-sm border border-border rounded-lg p-6 max-w-md text-center">
              <Icon name="Info" size={32} className="mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Get Started</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select components from the left panel and click here to place them. 
                Connect components by dragging from their connection points.
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Right-click components to edit or delete</div>
                <div>• Click edges to edit connection details</div>
                <div>• Use Delete key to remove selected items</div>
                <div>• Press Ctrl+Enter to analyze security</div>
              </div>
            </div>
          </Panel>
        )}

        <Panel position="top-right" className="space-y-2">
          <Button onClick={fitView} variant="outline" size="sm">
            <Icon name="CornersOut" size={16} className="mr-2" />
            Fit View
          </Button>
          <Button 
            onClick={onAnalyze} 
            disabled={isAnalyzing}
            className="bg-accent hover:bg-accent/90"
          >
            <Icon 
              name={isAnalyzing ? "CircleNotch" : "MagnifyingGlass"} 
              size={16} 
              className={`mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} 
            />
            {isAnalyzing ? 'Analyzing...' : 'Analyze Security'}
          </Button>
        </Panel>

        {/* Connection Editor Panel */}
        {showConnectionEditor && selectedConnectionData && (
          <Panel position="top-left" className="mt-4">
            <ConnectionEditor
              connection={selectedConnectionData}
              onUpdate={onConnectionUpdate}
              onDelete={onConnectionDelete}
              onClose={handleConnectionEditorClose}
            />
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}