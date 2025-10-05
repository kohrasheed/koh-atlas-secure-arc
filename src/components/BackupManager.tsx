import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useKV } from '@github/spark/hooks';
import { Node, Edge } from '@xyflow/react';
import {
  FloppyDisk,
  Download,
  Upload,
  Trash,
  FolderOpen,
  Clock,
  Copy,
  Archive
} from '@phosphor-icons/react';
import { CustomComponent } from './ComponentLibrary';

export interface ProjectBackup {
  id: string;
  name: string;
  description: string;
  timestamp: number;
  version: string;
  data: {
    nodes: Node[];
    edges: Edge[];
    customComponents: CustomComponent[];
    findings: any[];
    attackPaths: any[];
    settings: {
      darkTheme: string;
      lastAnalysis?: number;
    };
  };
  statistics: {
    nodeCount: number;
    edgeCount: number;
    componentTypes: string[];
    securityFindings: number;
  };
}

interface BackupManagerProps {
  nodes: Node[];
  edges: Edge[];
  customComponents: CustomComponent[];
  findings: any[];
  attackPaths: any[];
  onLoadBackup: (backup: ProjectBackup) => void;
}

export default function BackupManager({
  nodes,
  edges,
  customComponents,
  findings,
  attackPaths,
  onLoadBackup
}: BackupManagerProps) {
  const [backups, setBackups] = useKV<ProjectBackup[]>('project-backups', []);
  const [isDarkTheme] = useKV('dark-theme', 'false');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [selectedBackup, setSelectedBackup] = useState<ProjectBackup | null>(null);

  // Create a new backup
  const createBackup = () => {
    if (!backupName.trim()) {
      toast.error('Please enter a backup name');
      return;
    }

    // Generate statistics
    const componentTypes = [...new Set(nodes.map(n => (n.data as any)?.type).filter(Boolean) as string[])];
    
    const newBackup: ProjectBackup = {
      id: `backup-${Date.now()}`,
      name: backupName.trim(),
      description: backupDescription.trim(),
      timestamp: Date.now(),
      version: '1.0.0',
      data: {
        nodes: JSON.parse(JSON.stringify(nodes)),
        edges: JSON.parse(JSON.stringify(edges)),
        customComponents: JSON.parse(JSON.stringify(customComponents)),
        findings: JSON.parse(JSON.stringify(findings)),
        attackPaths: JSON.parse(JSON.stringify(attackPaths)),
        settings: {
          darkTheme: isDarkTheme || 'false',
          lastAnalysis: findings.length > 0 ? Date.now() : undefined
        }
      },
      statistics: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        componentTypes,
        securityFindings: findings.length
      }
    };

    setBackups((currentBackups = []) => [newBackup, ...currentBackups]);
    setShowCreateDialog(false);
    setBackupName('');
    setBackupDescription('');
    
    toast.success(`Backup "${newBackup.name}" created successfully`);
  };

  // Load a backup
  const loadBackup = (backup: ProjectBackup) => {
    onLoadBackup(backup);
    setShowLoadDialog(false);
    setSelectedBackup(null);
    toast.success(`Loaded backup "${backup.name}"`);
  };

  // Delete a backup
  const deleteBackup = (backupId: string) => {
    setBackups((currentBackups = []) => currentBackups.filter(b => b.id !== backupId));
    toast.success('Backup deleted');
  };

  // Export backup to JSON file
  const exportBackup = (backup: ProjectBackup) => {
    const dataStr = JSON.stringify(backup, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `koh-atlas-backup-${backup.name.replace(/[^a-z0-9]/gi, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Backup exported to file');
  };

  // Import backup from JSON file
  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedBackup = JSON.parse(e.target?.result as string) as ProjectBackup;
        
        // Validate backup structure
        if (!importedBackup.id || !importedBackup.data || !importedBackup.data.nodes) {
          throw new Error('Invalid backup file format');
        }

        // Generate new ID to avoid conflicts
        importedBackup.id = `imported-${Date.now()}`;
        importedBackup.name = `${importedBackup.name} (Imported)`;
        
        setBackups((currentBackups = []) => [importedBackup, ...currentBackups]);
        toast.success(`Imported backup "${importedBackup.name}"`);
      } catch (error) {
        toast.error('Failed to import backup: Invalid file format');
      }
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  // Duplicate a backup
  const duplicateBackup = (backup: ProjectBackup) => {
    const duplicated: ProjectBackup = {
      ...JSON.parse(JSON.stringify(backup)),
      id: `backup-${Date.now()}`,
      name: `${backup.name} (Copy)`,
      timestamp: Date.now()
    };
    
    setBackups((currentBackups = []) => [duplicated, ...currentBackups]);
    toast.success(`Duplicated backup "${backup.name}"`);
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get backup age
  const getBackupAge = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          onClick={() => setShowCreateDialog(true)}
          className="flex-1"
        >
          <FloppyDisk className="w-4 h-4 mr-1" />
          Create Backup
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setShowLoadDialog(true)}
          className="flex-1"
          disabled={(backups || []).length === 0}
        >
          <FolderOpen className="w-4 h-4 mr-1" />
          Load Backup
        </Button>
      </div>

      {/* Import/Export */}
      <div className="flex gap-2">
        <Button 
          size="sm" 
          variant="secondary"
          onClick={() => document.getElementById('backup-import')?.click()}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-1" />
          Import
        </Button>
        <input
          id="backup-import"
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={importBackup}
        />
        {(backups || []).length > 0 && (
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => exportBackup((backups || [])[0])}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-1" />
            Export Latest
          </Button>
        )}
      </div>

      {/* Current Project Status */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Archive className="w-4 h-4" />
            Current Project
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Components:</span>
            <Badge variant="secondary">{nodes.length}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Connections:</span>
            <Badge variant="secondary">{edges.length}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Custom Components:</span>
            <Badge variant="secondary">{customComponents.length}</Badge>
          </div>
          <div className="flex justify-between">
            <span>Security Findings:</span>
            <Badge variant={findings.length > 0 ? "destructive" : "secondary"}>
              {findings.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Recent Backups List */}
      <div>
        <h4 className="text-sm font-medium mb-2">Recent Backups ({(backups || []).length})</h4>
        <ScrollArea className="h-48">
          <div className="space-y-2 pr-2">
            {(backups || []).slice(0, 10).map(backup => (
              <Card key={backup.id} className="p-2">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{backup.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {getBackupAge(backup.timestamp)}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => loadBackup(backup)}
                      title="Load backup"
                    >
                      <FolderOpen className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => duplicateBackup(backup)}
                      title="Duplicate backup"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => exportBackup(backup)}
                      title="Export backup"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => deleteBackup(backup.id)}
                      title="Delete backup"
                    >
                      <Trash className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                {backup.description && (
                  <div className="text-xs text-muted-foreground mb-1">
                    {backup.description}
                  </div>
                )}
                <div className="flex gap-1 text-xs">
                  <Badge variant="outline" className="text-xs">
                    {backup.statistics.nodeCount} nodes
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {backup.statistics.edgeCount} edges
                  </Badge>
                  {backup.statistics.securityFindings > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {backup.statistics.securityFindings} issues
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
            {(backups || []).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <FloppyDisk className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No backups yet</p>
                <p className="text-xs">Create your first backup to save your work</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Create Backup Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Backup</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="backup-name">Backup Name</Label>
              <Input
                id="backup-name"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                placeholder="Enter backup name"
                maxLength={50}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="backup-description">Description (Optional)</Label>
              <Input
                id="backup-description"
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
                placeholder="Brief description of this backup"
                maxLength={100}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              This backup will include:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>{nodes.length} components</li>
                <li>{edges.length} connections</li>
                <li>{customComponents.length} custom components</li>
                <li>{findings.length} security findings</li>
                <li>Current theme and settings</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={createBackup}>
              Create Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Backup Dialog */}
      <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Backup</DialogTitle>
          </DialogHeader>
          
          <ScrollArea className="h-96">
            <div className="space-y-2 pr-2">
              {(backups || []).map(backup => (
                <Card 
                  key={backup.id}
                  className={`cursor-pointer transition-colors ${
                    selectedBackup?.id === backup.id 
                      ? 'ring-2 ring-primary bg-accent/5' 
                      : 'hover:bg-accent/5'
                  }`}
                  onClick={() => setSelectedBackup(backup)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{backup.name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(backup.timestamp)}
                        </div>
                      </div>
                      <Badge variant="outline">v{backup.version}</Badge>
                    </div>
                    
                    {backup.description && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {backup.description}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 text-xs">
                      <Badge variant="secondary">
                        {backup.statistics.nodeCount} nodes
                      </Badge>
                      <Badge variant="secondary">
                        {backup.statistics.edgeCount} edges
                      </Badge>
                      <Badge variant="secondary">
                        {backup.statistics.componentTypes.length} types
                      </Badge>
                      {backup.statistics.securityFindings > 0 && (
                        <Badge variant="destructive">
                          {backup.statistics.securityFindings} issues
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowLoadDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedBackup && loadBackup(selectedBackup)}
              disabled={!selectedBackup}
            >
              Load Selected Backup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}