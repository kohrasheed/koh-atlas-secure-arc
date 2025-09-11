import { useState } from 'react';
import { ArchComponent, Connection, Project } from '../types';
import { COMPONENT_CATALOG } from '../data/catalog';

export function useArchitectureDesigner() {
  const [components, setComponents] = useState<ArchComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);

  const addComponent = (templateId: string, position: { x: number; y: number }) => {
    const template = COMPONENT_CATALOG.find(c => c.id === templateId);
    if (!template) return;

    const newComponent: ArchComponent = {
      ...template,
      id: `${template.id}-${Date.now()}`,
      name: `${template.name} ${components.filter(c => c.type === template.type).length + 1}`,
    };

    setComponents(prev => [...prev, newComponent]);
    return newComponent.id;
  };

  const updateComponent = (id: string, updates: Partial<ArchComponent>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    ));
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    setConnections(prev => prev.filter(conn => conn.from !== id && conn.to !== id));
    if (selectedComponent === id) {
      setSelectedComponent(null);
    }
  };

  const addConnection = (from: string, to: string) => {
    const fromComp = components.find(c => c.id === from);
    const toComp = components.find(c => c.id === to);
    
    if (!fromComp || !toComp) return;

    const newConnection: Connection = {
      id: `${from}-${to}-${Date.now()}`,
      from,
      to,
      purpose: 'Data flow',
      ports: [443],
      protocol: 'HTTPS',
      encryption: 'TLS 1.2+',
      auth: 'Bearer Token',
      dataClass: 'Internal',
      egress: false,
      controls: [],
    };

    setConnections(prev => [...prev, newConnection]);
    return newConnection.id;
  };

  const updateConnection = (id: string, updates: Partial<Connection>) => {
    setConnections(prev => prev.map(conn => 
      conn.id === id ? { ...conn, ...updates } : conn
    ));
  };

  const removeConnection = (id: string) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
    if (selectedConnection === id) {
      setSelectedConnection(null);
    }
  };

  const loadPreset = (preset: Project) => {
    setComponents(preset.components);
    setConnections(preset.connections);
    setSelectedComponent(null);
    setSelectedConnection(null);
  };

  const clearAll = () => {
    setComponents([]);
    setConnections([]);
    setSelectedComponent(null);
    setSelectedConnection(null);
  };

  return {
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
    loadPreset,
    clearAll,
  };
}