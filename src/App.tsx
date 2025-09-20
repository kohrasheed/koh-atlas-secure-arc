import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  ReactFlowProvider,
  ReactFlowInstance,
  Handle,
  Position,
  MarkerType,
  ConnectionMode,
  XYPosition,
  NodeProps,
  NodeResizer,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import ComponentLibrary, { CustomComponent } from '@/components/ComponentLibrary';
import {
  Shield,
  Database,
  Globe,
  Cloud,
  Eye,
  CheckCircle,
  Plus,
  Trash,
  Moon,
  Sun,
  Play,
  Bug,
  Target,
  Desktop,
  DeviceMobile,
  HardDrives,
  Browser,
  Scales,
  Network,
  Tree,
  Hexagon,
} from '@phosphor-icons/react';

// Component types and configurations
interface ComponentConfig {
  type: string;
  label: string;
  icon: React.ReactElement;
  category: 'application' | 'security' | 'network' | 'data' | 'container' | 'custom';
  color: string;
  isContainer?: boolean;
}

const componentTypes: ComponentConfig[] = [
  // Container Components (can contain other components)
  { type: 'vpc-vnet', label: 'VPC / VNet', icon: <Network />, category: 'container', color: '#0ea5e9', isContainer: true },
  { type: 'subnet', label: 'Subnet', icon: <Network />, category: 'container', color: '#0284c7', isContainer: true },
  { type: 'network-segmentation', label: 'Network Segmentation', icon: <Tree />, category: 'container', color: '#0891b2', isContainer: true },
  
  // Application Components
  { type: 'web-browser', label: 'Web Browser', icon: <Browser />, category: 'application', color: '#3b82f6' },
  { type: 'web-server', label: 'Web Server', icon: <Desktop />, category: 'application', color: '#3b82f6' },
  { type: 'app-server', label: 'App Server', icon: <Desktop />, category: 'application', color: '#6366f1' },
  { type: 'api-gateway', label: 'API Gateway', icon: <Globe />, category: 'application', color: '#8b5cf6' },
  { type: 'microservice', label: 'Microservice', icon: <Cloud />, category: 'application', color: '#06b6d4' },
  { type: 'mobile-app', label: 'Mobile App', icon: <DeviceMobile />, category: 'application', color: '#10b981' },
  { type: 'kubernetes-cluster', label: 'Kubernetes Cluster', icon: <Hexagon />, category: 'application', color: '#326ce5' },
  { type: 'container', label: 'Container', icon: <Hexagon />, category: 'application', color: '#0db7ed' },
  
  // Network Components
  { type: 'load-balancer-global', label: 'Global Load Balancer', icon: <Scales />, category: 'network', color: '#059669' },
  { type: 'load-balancer-internal', label: 'Internal Load Balancer', icon: <Scales />, category: 'network', color: '#047857' },
  
  // Data Components
  { type: 'database', label: 'Database', icon: <Database />, category: 'data', color: '#f59e0b' },
  { type: 'cache', label: 'Cache', icon: <HardDrives />, category: 'data', color: '#f97316' },
  { type: 'message-queue', label: 'Message Queue', icon: <HardDrives />, category: 'data', color: '#ef4444' },
  
  // Security Components
  { type: 'firewall', label: 'Firewall', icon: <Shield />, category: 'security', color: '#dc2626' },
  { type: 'waf', label: 'WAF', icon: <Shield />, category: 'security', color: '#b91c1c' },
  { type: 'ids-ips', label: 'IDS/IPS', icon: <Eye />, category: 'security', color: '#991b1b' },
  { type: 'dam', label: 'DAM', icon: <Database />, category: 'security', color: '#7c2d12' },
  { type: 'edge-dns', label: 'Edge DNS', icon: <Globe />, category: 'security', color: '#166534' },
  { type: 'edge-cdn', label: 'Edge CDN', icon: <Cloud />, category: 'security', color: '#0f766e' },
];

// Security findings types
interface SecurityFinding {
  id: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  affected: string[];
  recommendation: string;
  standards: string[];
}

// Attack path types
interface AttackPath {
  id: string;
  name: string;
  steps: string[];
  impact: string;
  likelihood: string;
  mitigations: string[];
}

// Protocol configurations with common ports
const protocolConfigs = {
  'HTTPS': { port: 443, description: 'Secure HTTP over TLS' },
  'HTTP': { port: 80, description: 'Unencrypted HTTP (not recommended)' },
  'gRPC': { port: 443, description: 'gRPC over TLS' },
  'PostgreSQL': { port: 5432, description: 'PostgreSQL database connection' },
  'MySQL': { port: 3306, description: 'MySQL database connection' },
  'Redis': { port: 6379, description: 'Redis cache connection' },
  'MongoDB': { port: 27017, description: 'MongoDB database connection' },
  'SSH': { port: 22, description: 'Secure Shell protocol' },
  'RDP': { port: 3389, description: 'Remote Desktop Protocol' },
  'SMTP': { port: 587, description: 'SMTP email with STARTTLS' },
  'SMTPS': { port: 465, description: 'SMTP over SSL/TLS' },
  'DNS': { port: 53, description: 'Domain Name System' },
  'LDAPS': { port: 636, description: 'LDAP over SSL/TLS' },
  'KAFKA': { port: 9092, description: 'Apache Kafka messaging' },
  'ELASTICSEARCH': { port: 9200, description: 'Elasticsearch REST API' }
};

// Custom node component with connection handles
const CustomNode = ({ data, selected }: NodeProps) => {
  const config = componentTypes.find(c => c.type === data.type);
  const isHighlighted = data.isHighlighted;
  
  if (config?.isContainer) {
    // Container node (VPC, Subnet, Network Segmentation)
    return (
      <div 
        className={`
          relative min-w-[200px] min-h-[150px] rounded-lg border-2 border-dashed 
          ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
          ${isHighlighted ? 'ring-4 ring-yellow-400/60 border-yellow-400' : ''}
          transition-all duration-200 hover:border-primary/50
          bg-card/10 backdrop-blur-sm
        `}
        style={{ 
          borderColor: isHighlighted ? '#facc15' : (config?.color || '#666'),
          backgroundColor: `${config?.color}10` || '#66610'
        }}
      >
        {/* Node Resizer */}
        <NodeResizer 
          isVisible={selected}
          minWidth={200}
          minHeight={150}
          handleStyle={{
            backgroundColor: config?.color || '#666',
            borderColor: 'white',
            borderWidth: 2,
            width: 8,
            height: 8
          }}
        />
        
        {/* Container header */}
        <div 
          className={`absolute -top-6 left-2 px-2 py-1 bg-card border border-border rounded-md shadow-sm ${isHighlighted ? 'bg-yellow-100 border-yellow-400' : ''}`}
          style={{ borderLeftColor: isHighlighted ? '#facc15' : (config?.color || '#666'), borderLeftWidth: '3px' }}
        >
          <div className="flex items-center gap-2">
            <div style={{ color: isHighlighted ? '#facc15' : (config?.color || '#666') }}>
              {config?.icon}
            </div>
            <div>
              <div className="font-medium text-xs">{String((data as any).label || '')}</div>
              <div className="text-xs text-muted-foreground">{config?.label || ''}</div>
            </div>
          </div>
          {(data as any).zone && String((data as any).zone) && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {String((data as any).zone)}
            </Badge>
          )}
        </div>
        
        {/* Container content area */}
        <div className="w-full h-full p-4 flex items-center justify-center">
          <div className="text-xs text-muted-foreground opacity-50">
            Drop components here
          </div>
        </div>
        
        {/* Connection handles */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-primary border-2 border-background"
          style={{ left: -6 }}
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-primary border-2 border-background"
          style={{ right: -6 }}
        />
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-primary border-2 border-background"
          style={{ top: -6 }}
        />
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-primary border-2 border-background"
          style={{ bottom: -6 }}
        />
      </div>
    );
  }

  // Regular component node
  return (
    <div 
      className={`
        px-4 py-2 shadow-lg rounded-lg bg-card border-2 min-w-[120px] relative
        ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
        ${isHighlighted ? 'ring-4 ring-yellow-400/60 border-yellow-400 bg-yellow-50' : ''}
        transition-all duration-200 hover:shadow-xl hover:border-primary/50
      `}
      style={{ borderLeftColor: isHighlighted ? '#facc15' : (config?.color || '#666') }}
    >
      {/* Node Resizer for regular components */}
      <NodeResizer 
        isVisible={selected}
        minWidth={120}
        minHeight={60}
        handleStyle={{
          backgroundColor: config?.color || '#666',
          borderColor: 'white',
          borderWidth: 2,
          width: 6,
          height: 6
        }}
      />
      
      {/* Connection handles */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-primary border-2 border-background"
        style={{ left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-primary border-2 border-background"
        style={{ right: -6 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary border-2 border-background"
        style={{ top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary border-2 border-background"
        style={{ bottom: -6 }}
      />
      
      <div className="flex items-center gap-2">
        <div style={{ color: isHighlighted ? '#facc15' : (config?.color || '#666') }}>
          {config?.icon}
        </div>
        <div>
          <div className="font-medium text-sm">{String((data as any).label || '')}</div>
          <div className="text-xs text-muted-foreground">{config?.label || ''}</div>
        </div>
      </div>
      {(data as any).zone && String((data as any).zone) && (
        <Badge variant="secondary" className="mt-1 text-xs">
          {String((data as any).zone)}
        </Badge>
      )}
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// Custom designs
const customDesigns = {
  secure: {
    name: "Secure Web Application",
    nodes: [
      { id: 'vpc-1', type: 'custom', position: { x: 50, y: 50 }, data: { type: 'vpc-vnet', label: 'Production VPC', zone: 'Cloud' } },
      { id: 'subnet-dmz', type: 'custom', position: { x: 100, y: 120 }, data: { type: 'subnet', label: 'DMZ Subnet', zone: 'DMZ' } },
      { id: 'subnet-web', type: 'custom', position: { x: 400, y: 120 }, data: { type: 'subnet', label: 'Web Subnet', zone: 'Web Tier' } },
      { id: 'subnet-app', type: 'custom', position: { x: 700, y: 120 }, data: { type: 'subnet', label: 'App Subnet', zone: 'App Tier' } },
      { id: 'subnet-data', type: 'custom', position: { x: 1000, y: 120 }, data: { type: 'subnet', label: 'Data Subnet', zone: 'Data Tier' } },
      
      { id: '1', type: 'custom', position: { x: 100, y: 300 }, data: { type: 'web-browser', label: 'Web Browser', zone: 'External' } },
      { id: '2', type: 'custom', position: { x: 150, y: 180 }, data: { type: 'waf', label: 'WAF', zone: 'DMZ' } },
      { id: '3', type: 'custom', position: { x: 450, y: 180 }, data: { type: 'load-balancer-global', label: 'Global Load Balancer', zone: 'Web Tier' } },
      { id: '4', type: 'custom', position: { x: 420, y: 240 }, data: { type: 'web-server', label: 'Web Server 1', zone: 'Web Tier' } },
      { id: '5', type: 'custom', position: { x: 480, y: 240 }, data: { type: 'web-server', label: 'Web Server 2', zone: 'Web Tier' } },
      { id: '6', type: 'custom', position: { x: 750, y: 180 }, data: { type: 'api-gateway', label: 'API Gateway', zone: 'App Tier' } },
      { id: '7', type: 'custom', position: { x: 720, y: 240 }, data: { type: 'app-server', label: 'App Server 1', zone: 'App Tier' } },
      { id: '8', type: 'custom', position: { x: 780, y: 240 }, data: { type: 'app-server', label: 'App Server 2', zone: 'App Tier' } },
      { id: '9', type: 'custom', position: { x: 1050, y: 200 }, data: { type: 'database', label: 'Primary DB', zone: 'Data Tier' } },
      { id: '10', type: 'custom', position: { x: 300, y: 350 }, data: { type: 'firewall', label: 'Internal Firewall', zone: 'Security' } },
      { id: '11', type: 'custom', position: { x: 600, y: 350 }, data: { type: 'ids-ips', label: 'IDS/IPS', zone: 'Security' } },
    ] as Node[],
    edges: [
      { 
        id: 'e1-2', 
        source: '1', 
        target: '2', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'Web Browser', targetLabel: 'WAF' } 
      },
      { 
        id: 'e2-3', 
        source: '2', 
        target: '3', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'WAF', targetLabel: 'Global Load Balancer' } 
      },
      { 
        id: 'e3-4', 
        source: '3', 
        target: '4', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'Global Load Balancer', targetLabel: 'Web Server 1' } 
      },
      { 
        id: 'e3-5', 
        source: '3', 
        target: '5', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'Global Load Balancer', targetLabel: 'Web Server 2' } 
      },
      { 
        id: 'e4-6', 
        source: '4', 
        target: '6', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'Web Server 1', targetLabel: 'API Gateway' } 
      },
      { 
        id: 'e5-6', 
        source: '5', 
        target: '6', 
        label: 'HTTPS:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'HTTPS', port: 443, encryption: 'TLS 1.3', sourceLabel: 'Web Server 2', targetLabel: 'API Gateway' } 
      },
      { 
        id: 'e6-7', 
        source: '6', 
        target: '7', 
        label: 'gRPC:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'gRPC', port: 443, encryption: 'mTLS', sourceLabel: 'API Gateway', targetLabel: 'App Server 1' } 
      },
      { 
        id: 'e6-8', 
        source: '6', 
        target: '8', 
        label: 'gRPC:443', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'gRPC', port: 443, encryption: 'mTLS', sourceLabel: 'API Gateway', targetLabel: 'App Server 2' } 
      },
      { 
        id: 'e7-9', 
        source: '7', 
        target: '9', 
        label: 'PostgreSQL:5432', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'PostgreSQL', port: 5432, encryption: 'TLS', sourceLabel: 'App Server 1', targetLabel: 'Primary DB' } 
      },
      { 
        id: 'e8-9', 
        source: '8', 
        target: '9', 
        label: 'PostgreSQL:5432', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#10b981', strokeWidth: 2 },
        data: { protocol: 'PostgreSQL', port: 5432, encryption: 'TLS', sourceLabel: 'App Server 2', targetLabel: 'Primary DB' } 
      },
    ] as Edge[]
  },
  vulnerable: {
    name: "Vulnerable Architecture",
    nodes: [
      { id: '1', type: 'custom', position: { x: 100, y: 100 }, data: { type: 'web-browser', label: 'Web Browser', zone: 'External' } },
      { id: '2', type: 'custom', position: { x: 400, y: 100 }, data: { type: 'web-server', label: 'Web Server', zone: 'Public' } },
      { id: '3', type: 'custom', position: { x: 700, y: 100 }, data: { type: 'database', label: 'Database', zone: 'Internal' } },
      { id: '4', type: 'custom', position: { x: 400, y: 250 }, data: { type: 'app-server', label: 'Admin Panel', zone: 'Public' } },
    ] as Node[],
    edges: [
      { 
        id: 'e1-2', 
        source: '1', 
        target: '2', 
        label: 'HTTP:80', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#ef4444', strokeWidth: 2 },
        data: { protocol: 'HTTP', port: 80, encryption: 'None', sourceLabel: 'Web Browser', targetLabel: 'Web Server' } 
      },
      { 
        id: 'e2-3', 
        source: '2', 
        target: '3', 
        label: 'MySQL:3306', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#ef4444', strokeWidth: 2 },
        data: { protocol: 'MySQL', port: 3306, encryption: 'None', sourceLabel: 'Web Server', targetLabel: 'Database' } 
      },
      { 
        id: 'e1-4', 
        source: '1', 
        target: '4', 
        label: 'HTTP:80', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#ef4444', strokeWidth: 2 },
        data: { protocol: 'HTTP', port: 80, encryption: 'None', sourceLabel: 'Web Browser', targetLabel: 'Admin Panel' } 
      },
      { 
        id: 'e4-3', 
        source: '4', 
        target: '3', 
        label: 'MySQL:3306', 
        type: 'smoothstep',
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
        style: { stroke: '#ef4444', strokeWidth: 2 },
        data: { protocol: 'MySQL', port: 3306, encryption: 'None', sourceLabel: 'Admin Panel', targetLabel: 'Database' } 
      },
    ] as Edge[]
  }
};

function App() {
  const [isDarkTheme, setIsDarkTheme] = useKV('dark-theme', 'false');
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentConfig | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showAttackPaths, setShowAttackPaths] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [highlightedElements, setHighlightedElements] = useState<string[]>([]);
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Combine built-in and custom components
  const allComponentTypes = [
    ...componentTypes,
    ...customComponents.map(comp => ({
      type: comp.type,
      label: comp.label,
      icon: React.createElement(Shield), // Default icon for now
      category: comp.category,
      color: comp.color,
      isContainer: comp.isContainer
    }))
  ];

  // Handler for importing custom components
  const handleImportComponents = (importedComponents: CustomComponent[]) => {
    setCustomComponents(prev => {
      const newComponents = importedComponents.filter(
        imported => !prev.some(existing => existing.type === imported.type)
      );
      return [...prev, ...newComponents];
    });
    toast.success(`Imported ${importedComponents.length} components to application`);
  };

  // Security findings
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [attackPaths, setAttackPaths] = useState<AttackPath[]>([]);

  // Suppress ResizeObserver loop errors (benign browser warning)
  useEffect(() => {
    // Suppress ResizeObserver loop errors globally
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop')) {
        return; // Suppress ResizeObserver errors
      }
      originalError.call(console, ...args);
    };
    
    // Suppress ResizeObserver errors in window error handler
    const originalWindowError = window.onerror;
    window.onerror = (message, source, lineno, colno, error) => {
      if (typeof message === 'string' && message.includes('ResizeObserver loop')) {
        return true; // Suppress the error
      }
      if (originalWindowError) {
        return originalWindowError.call(window, message, source, lineno, colno, error);
      }
      return false;
    };
    
    return () => {
      console.error = originalError;
      window.onerror = originalWindowError;
    };
  }, []);

  // Update theme
  useEffect(() => {
    if (isDarkTheme === 'true') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isDarkTheme]);

  // Keyboard shortcuts for deletion
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        if (selectedNode || selectedEdge) {
          event.preventDefault();
          onDeleteSelected();
        }
      }
      if (event.key === 'Escape') {
        setSelectedNode(null);
        setSelectedEdge(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNode, selectedEdge]);

  // Load custom design with randomized positions and variations
  const loadCustomDesign = (designKey: 'secure' | 'vulnerable') => {
    const design = customDesigns[designKey];
    
    // Add more randomization by shuffling component positions and creating variations
    const shuffledNodes = [...design.nodes];
    
    // Create completely randomized grid positions
    const gridColumns = 6;
    const gridRows = Math.ceil(shuffledNodes.length / gridColumns);
    const cellWidth = 200;
    const cellHeight = 150;
    const margin = 100;
    
    // Shuffle the nodes for different arrangement each time
    for (let i = shuffledNodes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledNodes[i], shuffledNodes[j]] = [shuffledNodes[j], shuffledNodes[i]];
    }
    
    // Create randomized positions while maintaining relative structure
    const randomizedNodes = shuffledNodes.map((node, index) => {
      const config = componentTypes.find(c => c.type === (node.data as any)?.type);
      const isContainer = config?.isContainer;
      
      if (isContainer) {
        // Container components get special positioning
        const containerIndex = shuffledNodes.filter((n, i) => i <= index && 
          componentTypes.find(c => c.type === (n.data as any)?.type)?.isContainer).length - 1;
        
        // More varied container positioning
        const arrangements = [
          { x: 50, y: 50 },
          { x: 800, y: 50 },
          { x: 50, y: 400 },
          { x: 800, y: 400 },
          { x: 400, y: 200 },
          { x: 1200, y: 100 },
        ];
        
        const basePosition = arrangements[containerIndex % arrangements.length];
        
        // Larger random variation for containers
        const randomOffsetX = (Math.random() - 0.5) * 200; // ±100px variation
        const randomOffsetY = (Math.random() - 0.5) * 150; // ±75px variation
        
        return {
          ...node,
          position: { 
            x: Math.max(50, basePosition.x + randomOffsetX), 
            y: Math.max(50, basePosition.y + randomOffsetY) 
          }
        };
      } else {
        // Regular components with more randomized grid positioning
        const regularIndex = shuffledNodes.filter((n, i) => i <= index && 
          !componentTypes.find(c => c.type === (n.data as any)?.type)?.isContainer).length - 1;
        
        // Calculate grid position with randomness
        const col = regularIndex % gridColumns;
        const row = Math.floor(regularIndex / gridColumns);
        
        // Base grid position
        const baseX = margin + col * cellWidth;
        const baseY = margin + row * cellHeight;
        
        // Add significant random variation
        const randomOffsetX = (Math.random() - 0.5) * 250; // ±125px variation
        const randomOffsetY = (Math.random() - 0.5) * 200; // ±100px variation
        
        // Sometimes create clusters or lines
        const layoutVariation = Math.random();
        let finalX = baseX + randomOffsetX;
        let finalY = baseY + randomOffsetY;
        
        if (layoutVariation < 0.3) {
          // Cluster layout - group some components
          const clusterCenterX = 300 + Math.random() * 600;
          const clusterCenterY = 200 + Math.random() * 300;
          const clusterRadius = 150;
          const angle = Math.random() * 2 * Math.PI;
          finalX = clusterCenterX + Math.cos(angle) * (Math.random() * clusterRadius);
          finalY = clusterCenterY + Math.sin(angle) * (Math.random() * clusterRadius);
        } else if (layoutVariation < 0.6) {
          // Linear layout - arrange in flowing lines
          const lineY = 150 + (regularIndex % 3) * 200 + Math.random() * 100;
          finalX = 100 + regularIndex * 180 + Math.random() * 100;
          finalY = lineY;
        }
        // Otherwise use the standard grid with variation
        
        return {
          ...node,
          position: { 
            x: Math.max(50, finalX), 
            y: Math.max(50, finalY) 
          }
        };
      }
    });
    
    // Also randomize edge colors and styles slightly
    const randomizedEdges = design.edges.map(edge => {
      const variations = [
        { strokeWidth: 2 },
        { strokeWidth: 3 },
        { strokeWidth: 1.5 },
      ];
      
      const variation = variations[Math.floor(Math.random() * variations.length)];
      
      return {
        ...edge,
        style: {
          ...edge.style,
          ...variation
        }
      };
    });
    
    setNodes(randomizedNodes);
    setEdges(randomizedEdges);
    toast.success(`Loaded ${design.name} with completely randomized layout`);
  };

  // Add new component to canvas with container detection
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowInstance || !selectedComponent) return;

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // For container components, set larger size
      const isContainer = selectedComponent.isContainer;
      const nodeData: any = {
        type: selectedComponent.type,
        label: selectedComponent.label,
        zone: selectedComponent.category === 'security' ? 'Security' : 'Internal',
      };

      if (isContainer) {
        nodeData.width = 300;
        nodeData.height = 200;
      }

      const newNode: Node = {
        id: `${Date.now()}`,
        type: 'custom',
        position,
        data: nodeData,
        ...(isContainer && {
          style: {
            width: 300,
            height: 200,
          },
        }),
      };

      setNodes(nds => nds.concat(newNode));
      setSelectedComponent(null);
    },
    [reactFlowInstance, selectedComponent, setNodes]
  );

  // Handle connection validation and dialog
  const onConnect = useCallback(
    (params: Connection) => {
      // Store the pending connection and show dialog for protocol selection
      setPendingConnection(params);
      setShowConnectionDialog(true);
    },
    []
  );

  // Create connection with specified protocol
  const createConnection = (protocol: string, port: number, encryption: string) => {
    if (!pendingConnection) return;

    const sourceNode = nodes.find(n => n.id === pendingConnection.source);
    const targetNode = nodes.find(n => n.id === pendingConnection.target);
    
    const newEdge: Edge = {
      ...pendingConnection,
      id: `e${pendingConnection.source}-${pendingConnection.target}-${Date.now()}`,
      label: `${protocol}:${port}`,
      type: 'smoothstep',
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      data: { 
        protocol, 
        port, 
        encryption,
        sourceLabel: sourceNode?.data?.label,
        targetLabel: targetNode?.data?.label,
      },
      style: {
        stroke: encryption === 'None' ? '#ef4444' : '#10b981',
        strokeWidth: 2,
      },
    };
    
    setEdges(eds => addEdge(newEdge, eds));
    setPendingConnection(null);
    setShowConnectionDialog(false);
    
    toast.success(`Connected ${sourceNode?.data?.label} → ${targetNode?.data?.label}`);
  };

  // Quick connection with smart defaults
  const createQuickConnection = () => {
    if (!pendingConnection) return;

    const sourceNode = nodes.find(n => n.id === pendingConnection.source);
    const targetNode = nodes.find(n => n.id === pendingConnection.target);
    
    // Smart protocol selection based on target component type
    let protocol = 'HTTPS';
    let port = 443;
    let encryption = 'TLS 1.3';
    
    if (targetNode?.data?.type === 'database') {
      protocol = 'PostgreSQL';
      port = 5432;
      encryption = 'TLS';
    } else if (targetNode?.data?.type === 'cache') {
      protocol = 'Redis';
      port = 6379;
      encryption = 'TLS';
    } else if (targetNode?.data?.type === 'message-queue') {
      protocol = 'KAFKA';
      port = 9092;
      encryption = 'SASL_SSL';
    }
    
    createConnection(protocol, port, encryption);
  };

  // Delete selected elements
  const onDeleteSelected = useCallback(() => {
    if (selectedNode) {
      setNodes(nds => nds.filter((n: Node) => n.id !== selectedNode.id));
      // Remove connected edges
      setEdges(eds => eds.filter((e: Edge) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
      toast.success('Node deleted');
    }
    if (selectedEdge) {
      setEdges(eds => eds.filter((e: Edge) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
      toast.success('Connection deleted');
    }
  }, [selectedNode, selectedEdge, setNodes, setEdges]);

  // Security analysis
  const runSecurityAnalysis = async () => {
    // Clear any existing highlights first
    clearHighlights();
    
    const newFindings: SecurityFinding[] = [];
    const newAttackPaths: AttackPath[] = [];

    // Analyze for common security issues
    edges.forEach((edge: Edge) => {
      const edgeData = edge.data || {};
      
      // Check for unencrypted connections
      if (edgeData.protocol === 'HTTP' || edgeData.encryption === 'None') {
        newFindings.push({
          id: `unencrypted-${edge.id}`,
          title: 'Unencrypted Communication',
          severity: 'High',
          description: `Connection ${edge.label} uses unencrypted communication`,
          affected: [edge.source!, edge.target!],
          recommendation: 'Implement TLS encryption for all communications',
          standards: ['NIST 800-53 SC-8', 'ISO 27001 A.13.1.1']
        });
      }

      // Check for direct database connections
      const targetNode = nodes.find((n: Node) => n.id === edge.target);
      const sourceNode = nodes.find((n: Node) => n.id === edge.source);
      
      if (targetNode?.data.type === 'database' && sourceNode?.data.type !== 'app-server') {
        newFindings.push({
          id: `direct-db-${edge.id}`,
          title: 'Direct Database Access',
          severity: 'Medium',
          description: 'Direct database access bypasses application tier',
          affected: [edge.source!, edge.target!],
          recommendation: 'Route database access through application tier',
          standards: ['OWASP Top 10', 'NIST 800-53 AC-3']
        });
      }
    });

    // Check for missing security controls
    const hasFirewall = nodes.some((n: Node) => n.data.type === 'firewall');
    const hasWAF = nodes.some((n: Node) => n.data.type === 'waf');
    const hasDAM = nodes.some((n: Node) => n.data.type === 'dam');
    const hasEdgeDNS = nodes.some((n: Node) => n.data.type === 'edge-dns');
    const hasEdgeCDN = nodes.some((n: Node) => n.data.type === 'edge-cdn');
    
    if (!hasFirewall) {
      newFindings.push({
        id: 'missing-firewall',
        title: 'Missing Firewall Protection',
        severity: 'High',
        description: 'No firewall protection detected in architecture',
        affected: ['architecture'],
        recommendation: 'Add firewall protection at network perimeters',
        standards: ['NIST 800-53 SC-7', 'CIS Controls 12']
      });
    }

    if (!hasWAF && nodes.some((n: Node) => n.data.type === 'web-server')) {
      newFindings.push({
        id: 'missing-waf',
        title: 'Missing Web Application Firewall',
        severity: 'Medium',
        description: 'Web servers without WAF protection',
        affected: nodes.filter((n: Node) => n.data.type === 'web-server').map((n: Node) => n.id),
        recommendation: 'Deploy WAF to protect web applications',
        standards: ['OWASP ASVS', 'PCI DSS 6.5.1']
      });
    }

    if (!hasDAM && nodes.some((n: Node) => n.data.type === 'database')) {
      newFindings.push({
        id: 'missing-dam',
        title: 'Missing Database Activity Monitoring',
        severity: 'Medium',
        description: 'Databases without activity monitoring and threat detection',
        affected: nodes.filter((n: Node) => n.data.type === 'database').map((n: Node) => n.id),
        recommendation: 'Deploy DAM to monitor database access and detect anomalies',
        standards: ['NIST 800-53 AU-2', 'PCI DSS 10.2']
      });
    }

    if (!hasEdgeDNS && nodes.some((n: Node) => ['web-server', 'api-gateway'].includes((n.data as any).type))) {
      newFindings.push({
        id: 'missing-edge-dns',
        title: 'Missing Edge DNS Protection',
        severity: 'Low',
        description: 'No DNS security and performance optimization at edge',
        affected: ['architecture'],
        recommendation: 'Deploy Edge DNS for DDoS protection and DNS filtering',
        standards: ['NIST 800-53 SC-20', 'CIS Controls 9']
      });
    }

    if (!hasEdgeCDN && nodes.some((n: Node) => ['web-server', 'web-browser'].includes((n.data as any).type))) {
      newFindings.push({
        id: 'missing-edge-cdn',
        title: 'Missing Edge CDN Protection',
        severity: 'Low',
        description: 'No content delivery network for performance and DDoS protection',
        affected: nodes.filter((n: Node) => n.data.type === 'web-server').map((n: Node) => n.id),
        recommendation: 'Deploy Edge CDN for content caching and DDoS mitigation',
        standards: ['NIST 800-53 SC-5', 'OWASP Top 10']
      });
    }

    // Generate attack paths
    if (newFindings.length > 0) {
      newAttackPaths.push({
        id: 'web-attack',
        name: 'Web Application Attack Path',
        steps: [
          'Attacker identifies unencrypted HTTP endpoints',
          'Man-in-the-middle attack intercepts credentials',
          'Direct database access bypasses application controls',
          'Data exfiltration from database'
        ],
        impact: 'Data breach, compliance violations',
        likelihood: 'High',
        mitigations: ['Implement HTTPS', 'Add WAF', 'Database access controls', 'Network segmentation', 'Deploy DAM for database monitoring', 'Add Edge DNS for DNS protection', 'Use Edge CDN for DDoS mitigation']
      });
    }

    setFindings(newFindings);
    setAttackPaths(newAttackPaths);
    
    if (newFindings.length === 0) {
      toast.success('No security issues found!');
    } else {
      toast.warning(`Found ${newFindings.length} security issues`);
    }
  };

  // Node selection handler
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Edge selection handler
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Update node data
  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds: Node[]) => nds.map((node: Node) => 
      node.id === nodeId 
        ? { ...node, data: { ...node.data, ...newData } }
        : node
    ));
  };

  // Update edge data
  const updateEdgeData = (edgeId: string, newData: any) => {
    setEdges((eds: Edge[]) => eds.map((edge: Edge) => 
      edge.id === edgeId 
        ? { 
            ...edge, 
            data: { ...edge.data, ...newData }, 
            label: `${newData.protocol}:${newData.port}`,
            style: {
              ...edge.style,
              stroke: newData.encryption === 'None' ? '#ef4444' : '#10b981',
            }
          }
        : edge
    ));
  };

  // Highlight findings on canvas
  const highlightFinding = (finding: SecurityFinding) => {
    // Clear previous highlights
    setHighlightedElements([]);
    
    // Update nodes with highlight status
    setNodes((nds: Node[]) => nds.map((node: Node) => ({
      ...node,
      data: {
        ...node.data,
        isHighlighted: finding.affected.includes(node.id)
      }
    })));

    // Update edges with highlight status
    setEdges((eds: Edge[]) => eds.map((edge: Edge) => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: finding.affected.includes(edge.id!) ? '#facc15' : (
          (edge.data as any)?.encryption === 'None' ? '#ef4444' : '#10b981'
        ),
        strokeWidth: finding.affected.includes(edge.id!) ? 4 : 2,
        filter: finding.affected.includes(edge.id!) ? 'drop-shadow(0 0 8px #facc15)' : undefined
      }
    })));

    toast.success(`Highlighted components for: ${finding.title}`);
  };

  // Clear highlights
  const clearHighlights = () => {
    setHighlightedElements([]);
    
    // Reset node highlights
    setNodes((nds: Node[]) => nds.map((node: Node) => ({
      ...node,
      data: {
        ...node.data,
        isHighlighted: false
      }
    })));

    // Reset edge highlights
    setEdges((eds: Edge[]) => eds.map((edge: Edge) => ({
      ...edge,
      style: {
        ...edge.style,
        stroke: (edge.data as any)?.encryption === 'None' ? '#ef4444' : '#10b981',
        strokeWidth: 2,
        filter: undefined
      }
    })));
  };

  // Auto-fix vulnerabilities
  const autoFixVulnerabilities = () => {
    let fixesApplied = 0;
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Fix unencrypted connections
    setEdges((eds: Edge[]) => eds.map((edge: Edge) => {
      const edgeData = edge.data || {};
      
      if (edgeData.protocol === 'HTTP' || edgeData.encryption === 'None') {
        fixesApplied++;
        
        // Smart protocol upgrade based on target
        const targetNode = nodes.find(n => n.id === edge.target);
        let newProtocol = 'HTTPS';
        let newPort = 443;
        let newEncryption = 'TLS 1.3';
        
        if (targetNode?.data?.type === 'database') {
          newProtocol = 'PostgreSQL';
          newPort = 5432;
          newEncryption = 'TLS';
        } else if (targetNode?.data?.type === 'cache') {
          newProtocol = 'Redis';
          newPort = 6379;
          newEncryption = 'TLS';
        } else if (targetNode?.data?.type === 'message-queue') {
          newProtocol = 'KAFKA';
          newPort = 9092;
          newEncryption = 'SASL_SSL';
        }
        
        return {
          ...edge,
          label: `${newProtocol}:${newPort}`,
          data: {
            ...edgeData,
            protocol: newProtocol,
            port: newPort,
            encryption: newEncryption
          },
          style: {
            ...edge.style,
            stroke: '#10b981',
            strokeWidth: 2
          }
        };
      }
      
      return edge;
    }));

    // Add missing security controls with proper connections
    const existingNodeTypes = nodes.map(n => (n.data as any)?.type);
    const existingNodes = [...nodes];
    
    // Add DAM if databases exist but no DAM
    if (existingNodes.some(n => (n.data as any)?.type === 'database') && !existingNodeTypes.includes('dam')) {
      const databases = existingNodes.filter(n => (n.data as any)?.type === 'database');
      
      if (databases.length > 0) {
        const avgX = databases.reduce((sum, n) => sum + n.position.x, 0) / databases.length;
        const avgY = databases.reduce((sum, n) => sum + n.position.y, 0) / databases.length;
        
        const damId = `dam-autofix-${Date.now()}`;
        const damNode = {
          id: damId,
          type: 'custom',
          position: { x: avgX + 150, y: avgY + 50 },
          data: { type: 'dam', label: 'DAM (Auto-added)', zone: 'Security' }
        };
        
        newNodes.push(damNode);
        
        // Connect DAM to databases for monitoring
        databases.forEach(database => {
          newEdges.push({
            id: `${damId}-monitor-${database.id}`,
            source: damId,
            target: database.id,
            label: 'Monitor',
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            style: { stroke: '#7c2d12', strokeWidth: 1, strokeDasharray: '5,5' },
            data: { 
              protocol: 'DB Monitoring', 
              port: 443, 
              encryption: 'TLS 1.3',
              sourceLabel: 'DAM (Auto-added)',
              targetLabel: (database.data as any)?.label,
              description: 'Database activity monitoring and threat detection'
            }
          });
        });
        
        fixesApplied++;
      }
    }
    
    // Add Edge DNS if web servers exist but no Edge DNS
    if (existingNodes.some(n => ['web-server', 'api-gateway'].includes((n.data as any)?.type)) && !existingNodeTypes.includes('edge-dns')) {
      const webComponents = existingNodes.filter(n => ['web-server', 'api-gateway'].includes((n.data as any)?.type));
      
      if (webComponents.length > 0) {
        const avgX = webComponents.reduce((sum, n) => sum + n.position.x, 0) / webComponents.length;
        const avgY = webComponents.reduce((sum, n) => sum + n.position.y, 0) / webComponents.length;
        
        const edgeDnsId = `edge-dns-autofix-${Date.now()}`;
        const edgeDnsNode = {
          id: edgeDnsId,
          type: 'custom',
          position: { x: avgX - 200, y: avgY - 100 },
          data: { type: 'edge-dns', label: 'Edge DNS (Auto-added)', zone: 'Edge' }
        };
        
        newNodes.push(edgeDnsNode);
        
        // Connect Edge DNS to protect web components
        webComponents.slice(0, 2).forEach(component => {
          newEdges.push({
            id: `${edgeDnsId}-protect-${component.id}`,
            source: edgeDnsId,
            target: component.id,
            label: 'DNS:53',
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            style: { stroke: '#166534', strokeWidth: 2 },
            data: { 
              protocol: 'DNS', 
              port: 53, 
              encryption: 'DNSSEC',
              sourceLabel: 'Edge DNS (Auto-added)',
              targetLabel: (component.data as any)?.label,
              description: 'DNS filtering and DDoS protection'
            }
          });
        });
        
        fixesApplied++;
      }
    }
    
    // Add Edge CDN if web servers exist but no Edge CDN
    if (existingNodes.some(n => (n.data as any)?.type === 'web-server') && !existingNodeTypes.includes('edge-cdn')) {
      const webServers = existingNodes.filter(n => (n.data as any)?.type === 'web-server');
      const browsers = existingNodes.filter(n => (n.data as any)?.type === 'web-browser');
      
      if (webServers.length > 0) {
        const avgX = webServers.reduce((sum, n) => sum + n.position.x, 0) / webServers.length;
        const avgY = webServers.reduce((sum, n) => sum + n.position.y, 0) / webServers.length;
        
        const edgeCdnId = `edge-cdn-autofix-${Date.now()}`;
        const edgeCdnNode = {
          id: edgeCdnId,
          type: 'custom',
          position: { x: avgX - 250, y: avgY - 150 },
          data: { type: 'edge-cdn', label: 'Edge CDN (Auto-added)', zone: 'Edge' }
        };
        
        newNodes.push(edgeCdnNode);
        
        // Connect browsers to Edge CDN and Edge CDN to web servers
        browsers.forEach(browser => {
          newEdges.push({
            id: `${browser.id}-${edgeCdnId}-autofix`,
            source: browser.id,
            target: edgeCdnId,
            label: 'HTTPS:443',
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            style: { stroke: '#10b981', strokeWidth: 2 },
            data: { 
              protocol: 'HTTPS', 
              port: 443, 
              encryption: 'TLS 1.3',
              sourceLabel: (browser.data as any)?.label,
              targetLabel: 'Edge CDN (Auto-added)',
              description: 'Content delivery with DDoS protection'
            }
          });
        });
        
        // Connect Edge CDN to web servers
        webServers.forEach(server => {
          newEdges.push({
            id: `${edgeCdnId}-${server.id}-autofix`,
            source: edgeCdnId,
            target: server.id,
            label: 'HTTPS:443',
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
            style: { stroke: '#10b981', strokeWidth: 2 },
            data: { 
              protocol: 'HTTPS', 
              port: 443, 
              encryption: 'TLS 1.3',
              sourceLabel: 'Edge CDN (Auto-added)',
              targetLabel: (server.data as any)?.label,
              description: 'Origin server connection'
            }
          });
        });
        
        fixesApplied++;
      }
    }
    
    // Add WAF if web servers exist but no WAF
    if (existingNodes.some(n => (n.data as any)?.type === 'web-server') && !existingNodeTypes.includes('waf')) {
      const webServers = existingNodes.filter(n => (n.data as any)?.type === 'web-server');
      const browsers = existingNodes.filter(n => (n.data as any)?.type === 'web-browser');
      
      if (webServers.length > 0) {
        const avgX = webServers.reduce((sum, n) => sum + n.position.x, 0) / webServers.length;
        const avgY = webServers.reduce((sum, n) => sum + n.position.y, 0) / webServers.length;
        
        const wafId = `waf-autofix-${Date.now()}`;
        const wafNode = {
          id: wafId,
          type: 'custom',
          position: { x: avgX - 150, y: avgY - 50 },
          data: { type: 'waf', label: 'WAF (Auto-added)', zone: 'DMZ' }
        };
        
        newNodes.push(wafNode);
        
        // Connect browsers to WAF and WAF to web servers
        browsers.forEach(browser => {
          // Find existing browser -> web server connections and reroute through WAF
          const browserConnections = edges.filter(e => e.source === browser.id && 
            webServers.some(ws => ws.id === e.target));
          
          browserConnections.forEach(conn => {
            // Create browser -> WAF connection
            newEdges.push({
              id: `${browser.id}-${wafId}-autofix`,
              source: browser.id,
              target: wafId,
              label: 'HTTPS:443',
              type: 'smoothstep',
              markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
              style: { stroke: '#10b981', strokeWidth: 2 },
              data: { 
                protocol: 'HTTPS', 
                port: 443, 
                encryption: 'TLS 1.3',
                sourceLabel: (browser.data as any)?.label,
                targetLabel: 'WAF (Auto-added)'
              }
            });
            
            // Create WAF -> web server connection
            const targetServer = webServers.find(ws => ws.id === conn.target);
            if (targetServer) {
              newEdges.push({
                id: `${wafId}-${targetServer.id}-autofix`,
                source: wafId,
                target: targetServer.id,
                label: 'HTTPS:443',
                type: 'smoothstep',
                markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
                style: { stroke: '#10b981', strokeWidth: 2 },
                data: { 
                  protocol: 'HTTPS', 
                  port: 443, 
                  encryption: 'TLS 1.3',
                  sourceLabel: 'WAF (Auto-added)',
                  targetLabel: (targetServer.data as any)?.label
                }
              });
            }
          });
        });
        
        fixesApplied++;
      }
    }
    
    // Add firewall if none exists
    if (!existingNodeTypes.includes('firewall')) {
      const firewallId = `firewall-autofix-${Date.now()}`;
      const firewallNode = {
        id: firewallId,
        type: 'custom',
        position: { x: 50, y: 300 },
        data: { type: 'firewall', label: 'Firewall (Auto-added)', zone: 'Security' }
      };
      
      newNodes.push(firewallNode);
      
      // Connect firewall to protect internal traffic
      const internalNodes = existingNodes.filter(n => 
        ['app-server', 'database', 'cache'].includes((n.data as any)?.type));
      
      // Create monitoring connections from firewall to critical assets
      internalNodes.slice(0, 2).forEach((node, idx) => {
        newEdges.push({
          id: `${firewallId}-monitor-${node.id}`,
          source: firewallId,
          target: node.id,
          label: 'Monitor',
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          style: { stroke: '#059669', strokeWidth: 1, strokeDasharray: '5,5' },
          data: { 
            protocol: 'Monitoring', 
            port: 443, 
            encryption: 'TLS 1.3',
            sourceLabel: 'Firewall (Auto-added)',
            targetLabel: (node.data as any)?.label,
            description: 'Traffic monitoring and filtering'
          }
        });
      });
      
      fixesApplied++;
    }
    
    // Add IDS/IPS if none exists and there are multiple tiers
    if (!existingNodeTypes.includes('ids-ips') && existingNodes.length > 3) {
      const idsId = `ids-autofix-${Date.now()}`;
      const idsNode = {
        id: idsId,
        type: 'custom',
        position: { x: 500, y: 350 },
        data: { type: 'ids-ips', label: 'IDS/IPS (Auto-added)', zone: 'Security' }
      };
      
      newNodes.push(idsNode);
      
      // Connect IDS/IPS to monitor east-west traffic between tiers
      const appServers = existingNodes.filter(n => (n.data as any)?.type === 'app-server');
      const databases = existingNodes.filter(n => (n.data as any)?.type === 'database');
      
      // Monitor app server to database connections
      if (appServers.length > 0 && databases.length > 0) {
        const appServer = appServers[0];
        const database = databases[0];
        
        // Create IDS monitoring connection
        newEdges.push({
          id: `${idsId}-monitor-${appServer.id}-${database.id}`,
          source: idsId,
          target: database.id,
          label: 'Monitor',
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          style: { stroke: '#991b1b', strokeWidth: 1, strokeDasharray: '3,3' },
          data: { 
            protocol: 'IDS Monitoring', 
            port: 443, 
            encryption: 'TLS 1.3',
            sourceLabel: 'IDS/IPS (Auto-added)',
            targetLabel: (database.data as any)?.label,
            description: 'Intrusion detection and prevention'
          }
        });
      }
      
      fixesApplied++;
    }
    
    // Add load balancer if web servers exist without one
    const webServers = existingNodes.filter(n => (n.data as any)?.type === 'web-server');
    const hasLoadBalancer = existingNodeTypes.includes('load-balancer-global') || 
                          existingNodeTypes.includes('load-balancer-internal');
    
    if (webServers.length > 1 && !hasLoadBalancer) {
      const avgX = webServers.reduce((sum, n) => sum + n.position.x, 0) / webServers.length;
      const avgY = webServers.reduce((sum, n) => sum + n.position.y, 0) / webServers.length;
      
      const lbId = `lb-autofix-${Date.now()}`;
      const lbNode = {
        id: lbId,
        type: 'custom',
        position: { x: avgX, y: avgY - 100 },
        data: { type: 'load-balancer-global', label: 'Load Balancer (Auto-added)', zone: 'Web Tier' }
      };
      
      newNodes.push(lbNode);
      
      // Connect load balancer to web servers
      webServers.forEach(server => {
        newEdges.push({
          id: `${lbId}-${server.id}-autofix`,
          source: lbId,
          target: server.id,
          label: 'HTTPS:443',
          type: 'smoothstep',
          markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20 },
          style: { stroke: '#10b981', strokeWidth: 2 },
          data: { 
            protocol: 'HTTPS', 
            port: 443, 
            encryption: 'TLS 1.3',
            sourceLabel: 'Load Balancer (Auto-added)',
            targetLabel: (server.data as any)?.label
          }
        });
      });
      
      fixesApplied++;
    }
    
    // Update nodes and edges
    if (newNodes.length > 0) {
      setNodes(nds => [...nds, ...newNodes]);
    }
    
    if (newEdges.length > 0) {
      setEdges(eds => [...eds, ...newEdges]);
    }
    
    // Remove old insecure direct connections that are now protected
    setTimeout(() => {
      setEdges(eds => eds.filter(edge => {
        const edgeData = edge.data || {};
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        
        // Remove direct browser -> web server connections if WAF was added
        if ((sourceNode?.data as any)?.type === 'web-browser' && 
            (targetNode?.data as any)?.type === 'web-server' &&
            newNodes.some(n => (n.data as any)?.type === 'waf')) {
          return false;
        }
        
        return true;
      }));
      
      // Re-run analysis to update findings
      setTimeout(() => {
        runSecurityAnalysis();
      }, 200);
    }, 100);
    
    if (fixesApplied > 0) {
      toast.success(`Applied ${fixesApplied} security fixes with proper connections`);
    } else {
      toast.info('No automatic fixes available');
    }
  };

  // Connection Dialog Component
  const ConnectionDialog = () => {
    const [selectedProtocol, setSelectedProtocol] = useState('HTTPS');
    const [selectedPort, setSelectedPort] = useState(443);
    const [selectedEncryption, setSelectedEncryption] = useState('TLS 1.3');

    const sourceNode = nodes.find(n => n.id === pendingConnection?.source);
    const targetNode = nodes.find(n => n.id === pendingConnection?.target);

    const handleProtocolChange = (protocol: string) => {
      setSelectedProtocol(protocol);
      const config = protocolConfigs[protocol as keyof typeof protocolConfigs];
      if (config) {
        setSelectedPort(config.port);
      }
    };

    return (
      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Connection</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Connecting: <span className="font-medium">{sourceNode?.data?.label}</span> → <span className="font-medium">{targetNode?.data?.label}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection-protocol">Protocol</Label>
              <Select value={selectedProtocol} onValueChange={handleProtocolChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(protocolConfigs).map(([protocol, config]) => (
                    <SelectItem key={protocol} value={protocol}>
                      <div className="flex flex-col">
                        <span>{protocol}</span>
                        <span className="text-xs text-muted-foreground">{config.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection-port">Port</Label>
              <Input
                id="connection-port"
                type="number"
                value={selectedPort}
                onChange={(e) => setSelectedPort(parseInt(e.target.value))}
                min="1"
                max="65535"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="connection-encryption">Encryption</Label>
              <Select value={selectedEncryption} onValueChange={setSelectedEncryption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TLS 1.3">TLS 1.3 (Recommended)</SelectItem>
                  <SelectItem value="TLS 1.2">TLS 1.2</SelectItem>
                  <SelectItem value="mTLS">Mutual TLS (mTLS)</SelectItem>
                  <SelectItem value="SASL_SSL">SASL with SSL</SelectItem>
                  <SelectItem value="None">None (Not Recommended)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedEncryption === 'None' && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Security Warning</span>
                </div>
                <p className="text-xs text-destructive/80 mt-1">
                  Unencrypted connections are vulnerable to eavesdropping and tampering.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowConnectionDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="secondary"
              onClick={createQuickConnection}
            >
              Quick Connect
            </Button>
            <Button 
              onClick={() => createConnection(selectedProtocol, selectedPort, selectedEncryption)}
            >
              Create Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-80 border-r border-border bg-card overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">Koh Atlas</h1>
              <p className="text-sm text-muted-foreground">Secure Architecture Designer</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDarkTheme(isDarkTheme === 'true' ? 'false' : 'true')}
            >
              {isDarkTheme === 'true' ? <Sun /> : <Moon />}
            </Button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <Button 
              size="sm" 
              onClick={() => loadCustomDesign('secure')}
              className="flex-1"
            >
              <Shield className="w-4 h-4 mr-1" />
              Secure
            </Button>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => loadCustomDesign('vulnerable')}
              className="flex-1"
            >
              <Bug className="w-4 h-4 mr-1" />
              Vulnerable
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={runSecurityAnalysis}
                className="flex-1"
              >
                <Play className="w-4 h-4 mr-1" />
                Analyze
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowAttackPaths(!showAttackPaths)}
                className="flex-1"
              >
                <Target className="w-4 h-4 mr-1" />
                Attacks
              </Button>
            </div>
            {findings.length > 0 && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={autoFixVulnerabilities}
                className="w-full"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Fix Vulnerabilities
              </Button>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="components" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mt-2">
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="components" className="flex-1 px-4 pb-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                {/* Container Components */}
                <div>
                  <h3 className="font-medium mb-2">Containers</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {componentTypes.filter(c => c.category === 'container').map(component => (
                      <Button
                        key={component.type}
                        variant="outline"
                        className="h-auto p-2 justify-start border-dashed"
                        draggable
                        onDragStart={() => setSelectedComponent(component)}
                      >
                        <div className="flex items-center gap-2">
                          <div style={{ color: component.color }}>
                            {component.icon}
                          </div>
                          <span className="text-xs">{component.label}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Regular Components */}
                {(['application', 'network', 'data', 'security'] as const).map(category => (
                  <div key={category}>
                    <h3 className="font-medium mb-2 capitalize">{category}</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {allComponentTypes.filter(c => c.category === category).map(component => (
                        <Button
                          key={component.type}
                          variant="outline"
                          className="h-auto p-2 justify-start"
                          draggable
                          onDragStart={() => setSelectedComponent(component)}
                        >
                          <div className="flex items-center gap-2">
                            <div style={{ color: component.color }}>
                              {component.icon}
                            </div>
                            <span className="text-xs">{component.label}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Custom Components Section */}
                {customComponents.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Custom Components</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {customComponents.map(component => (
                        <Button
                          key={component.type}
                          variant="outline"
                          className="h-auto p-2 justify-start border-dashed"
                          draggable
                          onDragStart={() => {
                            // Convert CustomComponent to ComponentConfig
                            const config: ComponentConfig = {
                              type: component.type,
                              label: component.label,
                              icon: React.createElement(Shield),
                              category: component.category,
                              color: component.color,
                              isContainer: component.isContainer
                            };
                            setSelectedComponent(config);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div style={{ color: component.color }}>
                              <Shield />
                            </div>
                            <span className="text-xs">{component.label}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Component Library Manager */}
                <div className="pt-4 border-t border-border">
                  <ComponentLibrary
                    onImportComponents={handleImportComponents}
                    existingComponents={customComponents}
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="properties" className="flex-1 px-4 pb-4">
            <ScrollArea className="h-full">
              {selectedNode && (
                <div className="space-y-4">
                  <h3 className="font-medium">
                    {componentTypes.find(c => c.type === selectedNode.data?.type)?.isContainer ? 'Container' : 'Node'} Properties
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="node-label">Label</Label>
                    <Input
                      id="node-label"
                      value={(selectedNode.data as any)?.label || ''}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="node-zone">Zone</Label>
                    <Select
                      value={(selectedNode.data as any)?.zone || ''}
                      onValueChange={(value) => updateNodeData(selectedNode.id, { zone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="External">External</SelectItem>
                        <SelectItem value="DMZ">DMZ</SelectItem>
                        <SelectItem value="Web Tier">Web Tier</SelectItem>
                        <SelectItem value="App Tier">App Tier</SelectItem>
                        <SelectItem value="Data Tier">Data Tier</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Management">Management</SelectItem>
                        <SelectItem value="Cloud">Cloud</SelectItem>
                        <SelectItem value="Internal">Internal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Container-specific properties */}
                  {componentTypes.find(c => c.type === selectedNode.data?.type)?.isContainer && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="container-cidr">CIDR Block (optional)</Label>
                        <Input
                          id="container-cidr"
                          placeholder="e.g., 10.0.0.0/16"
                          value={(selectedNode.data as any)?.cidr || ''}
                          onChange={(e) => updateNodeData(selectedNode.id, { cidr: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="container-description">Description</Label>
                        <Input
                          id="container-description"
                          placeholder="Container purpose or notes"
                          value={(selectedNode.data as any)?.description || ''}
                          onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Keyboard Shortcuts:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• <kbd>Delete</kbd> or <kbd>Backspace</kbd> to delete</p>
                      <p>• <kbd>Escape</kbd> to deselect</p>
                      <p>• Drag corners to resize when selected</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onDeleteSelected}
                    className="w-full"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete {componentTypes.find(c => c.type === selectedNode.data?.type)?.isContainer ? 'Container' : 'Node'}
                  </Button>
                </div>
              )}
              
              {selectedEdge && (
                <div className="space-y-4">
                  <h3 className="font-medium">Connection Properties</h3>
                  
                  <div className="p-3 bg-muted/50 rounded-md">
                    <div className="text-sm">
                      <span className="font-medium">{(selectedEdge.data as any)?.sourceLabel}</span>
                      <span className="mx-2 text-muted-foreground">→</span>
                      <span className="font-medium">{(selectedEdge.data as any)?.targetLabel}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edge-protocol">Protocol</Label>
                    <Select
                      value={(selectedEdge.data as any)?.protocol || 'HTTPS'}
                      onValueChange={(value) => {
                        const config = protocolConfigs[value as keyof typeof protocolConfigs];
                        updateEdgeData(selectedEdge.id, { 
                          ...(selectedEdge.data || {}), 
                          protocol: value,
                          port: config?.port || (selectedEdge.data as any)?.port || 443
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(protocolConfigs).map(([protocol, config]) => (
                          <SelectItem key={protocol} value={protocol}>
                            <div className="flex flex-col">
                              <span>{protocol}</span>
                              <span className="text-xs text-muted-foreground">{config.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edge-port">Port</Label>
                    <Input
                      id="edge-port"
                      type="number"
                      value={((selectedEdge.data as any)?.port || 443).toString()}
                      onChange={(e) => updateEdgeData(selectedEdge.id, { 
                        ...(selectedEdge.data || {}), 
                        port: parseInt(e.target.value) 
                      })}
                      min="1"
                      max="65535"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edge-encryption">Encryption</Label>
                    <Select
                      value={(selectedEdge.data as any)?.encryption || 'TLS 1.2'}
                      onValueChange={(value) => updateEdgeData(selectedEdge.id, { 
                        ...(selectedEdge.data || {}), 
                        encryption: value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TLS 1.3">TLS 1.3 (Recommended)</SelectItem>
                        <SelectItem value="TLS 1.2">TLS 1.2</SelectItem>
                        <SelectItem value="mTLS">Mutual TLS (mTLS)</SelectItem>
                        <SelectItem value="SASL_SSL">SASL with SSL</SelectItem>
                        <SelectItem value="None">None (Not Recommended)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {(selectedEdge.data as any)?.encryption === 'None' && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <div className="flex items-center gap-2 text-destructive text-sm">
                        <Shield className="w-4 h-4" />
                        <span className="font-medium">Security Risk</span>
                      </div>
                      <p className="text-xs text-destructive/80 mt-1">
                        This connection is unencrypted and vulnerable to attacks.
                      </p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="edge-description">Description</Label>
                    <Input
                      id="edge-description"
                      placeholder="Optional connection description"
                      value={(selectedEdge.data as any)?.description || ''}
                      onChange={(e) => updateEdgeData(selectedEdge.id, { 
                        ...(selectedEdge.data || {}), 
                        description: e.target.value 
                      })}
                    />
                  </div>
                  
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Keyboard Shortcuts:</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>• <kbd>Delete</kbd> or <kbd>Backspace</kbd> to delete</p>
                      <p>• <kbd>Escape</kbd> to deselect</p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onDeleteSelected}
                    className="w-full"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete Connection
                  </Button>
                </div>
              )}
              
              {!selectedNode && !selectedEdge && (
                <div className="text-center text-muted-foreground py-8">
                  <p>Select a node or connection to edit properties</p>
                  <div className="mt-4 text-xs space-y-1">
                    <p>• Click on any component to select it</p>
                    <p>• Click on connections to edit protocols</p>
                    <p>• Drag corners of selected components to resize</p>
                    <p>• Use keyboard shortcuts for faster editing</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="analysis" className="flex-1 px-4 pb-4">
            <ScrollArea className="h-full">
              {showAttackPaths ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Attack Path Analysis</h3>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAttackPaths(false)}
                    >
                      Back to Findings
                    </Button>
                  </div>
                  {attackPaths.map(path => (
                    <Card key={path.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{path.name}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant="destructive">Impact: {path.impact}</Badge>
                          <Badge variant="outline">Likelihood: {path.likelihood}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <h4 className="text-xs font-medium mb-1">Attack Steps:</h4>
                          <ol className="text-xs space-y-1">
                            {path.steps.map((step, idx) => (
                              <li key={idx} className="flex">
                                <span className="mr-2 text-muted-foreground">{idx + 1}.</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div>
                          <h4 className="text-xs font-medium mb-1">Mitigations:</h4>
                          <ul className="text-xs space-y-1">
                            {path.mitigations.map((mitigation, idx) => (
                              <li key={idx} className="flex items-start">
                                <CheckCircle className="w-3 h-3 mr-1 mt-0.5 text-green-500" />
                                <span>{mitigation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {attackPaths.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No attack paths identified</p>
                      <p className="text-xs">Run security analysis first</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Security Findings</h3>
                    <div className="flex gap-2">
                      {highlightedElements.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={clearHighlights}
                        >
                          Clear Highlights
                        </Button>
                      )}
                      {attackPaths.length > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowAttackPaths(true)}
                        >
                          View Attack Paths
                        </Button>
                      )}
                    </div>
                  </div>
                  {findings.map(finding => (
                    <Card 
                      key={finding.id}
                      className="cursor-pointer hover:bg-accent/5 transition-colors"
                      onClick={() => highlightFinding(finding)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">{finding.title}</CardTitle>
                          <Badge 
                            variant={
                              finding.severity === 'Critical' ? 'destructive' : 
                              finding.severity === 'High' ? 'destructive' :
                              finding.severity === 'Medium' ? 'default' : 'secondary'
                            }
                          >
                            {finding.severity}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-xs text-muted-foreground">{finding.description}</p>
                        <div>
                          <h4 className="text-xs font-medium">Recommendation:</h4>
                          <p className="text-xs">{finding.recommendation}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {finding.standards.map(standard => (
                            <Badge key={standard} variant="outline" className="text-xs">
                              {standard}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground pt-1 border-t border-border">
                          Click to highlight affected components on the diagram
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {findings.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No security findings</p>
                      <p className="text-xs">Run analysis to identify issues</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative" ref={reactFlowWrapper}>
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={(reactFlowInstance) => setReactFlowInstance(reactFlowInstance)}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            className="bg-background"
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={{
              type: 'smoothstep',
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
              },
            }}
          >
            <Background />
            <MiniMap />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
        
        {/* Connection Dialog */}
        <ConnectionDialog />
        
        {/* Instructions overlay */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center p-8 bg-card/80 backdrop-blur rounded-lg border border-border">
              <h2 className="text-xl font-medium mb-2">Welcome to Koh Atlas</h2>
              <p className="text-muted-foreground mb-4">
                Drag components from the sidebar to start designing your architecture
              </p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Load a secure or vulnerable template to get started</p>
                <p>• Start with container components (VPC, Subnet) to organize zones</p>
                <p>• Drag regular components into containers or onto the canvas</p>
                <p>• Connect components by dragging between connection points</p>
                <p>• Specify protocols and ports for each connection</p>
                <p>• Select components to resize them by dragging the corners</p>
                <p>• Use the Properties panel to edit selected components</p>
                <p>• Run security analysis to identify vulnerabilities</p>
                <p>• View attack paths to understand threat scenarios</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;