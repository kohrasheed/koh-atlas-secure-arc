import React, { useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Controls,
  Background,
  ConnectionMode,
  Panel,
  useReactFlow,
} from '@xyflow/react';
import { ArchComponent, Connection as ArchConnection } from '../../types';
import { ArchComponentNode } from './ArchComponentNode';
import { Button } from '../ui/button';
import { Icon } from '../Icon';

const nodeTypes = {
  archComponent: ArchComponentNode,
};

interface DiagramCanvasProps {
  components: ArchComponent[];
  connections: ArchConnection[];
  selectedComponent: string | null;
  onComponentSelect: (id: string | null) => void;
  onComponentUpdate: (id: string, updates: Partial<ArchComponent>) => void;
  onConnectionCreate: (from: string, to: string) => void;
  onConnectionSelect: (id: string | null) => void;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
}

export function DiagramCanvas({
  components,
  connections,
  selectedComponent,
  onComponentSelect,
  onComponentUpdate,
  onConnectionCreate,
  onConnectionSelect,
  onAnalyze,
  isAnalyzing = false,
}: DiagramCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
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
      },
    }));
    setNodes(newNodes);
  }, [components, selectedComponent, onComponentSelect, onComponentUpdate, setNodes]);

  // Convert connections to edges
  const convertConnectionsToEdges = useCallback(() => {
    const newEdges: Edge[] = connections.map((connection) => ({
      id: connection.id,
      source: connection.from,
      target: connection.to,
      label: `${connection.protocol}:${connection.ports.join(',')}`,
      style: {
        stroke: connection.encryption.includes('TLS') ? '#10b981' : '#ef4444',
        strokeWidth: 2,
      },
      data: { connection },
    }));
    setEdges(newEdges);
  }, [connections, setEdges]);

  // Update nodes and edges when components/connections change
  useEffect(() => {
    convertComponentsToNodes();
  }, [convertComponentsToNodes]);

  useEffect(() => {
    convertConnectionsToEdges();
  }, [convertConnectionsToEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
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
    },
    [onConnectionSelect]
  );

  const onPaneClick = useCallback(() => {
    onComponentSelect(null);
    onConnectionSelect(null);
  }, [onComponentSelect, onConnectionSelect]);

  const fitView = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 });
  }, [setViewport]);

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
        <Background color="#e2e8f0" size={1} />
        <Controls />
        
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
      </ReactFlow>
    </div>
  );
}