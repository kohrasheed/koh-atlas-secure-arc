import React, { useState, useEffect } from 'react';
import { Connection } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Icon } from '../Icon';
import { toast } from 'sonner';

interface ConnectionEditorProps {
  connection: Connection | null;
  onUpdate: (id: string, updates: Partial<Connection>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export function ConnectionEditor({ 
  connection, 
  onUpdate, 
  onDelete, 
  onClose 
}: ConnectionEditorProps) {
  const [formData, setFormData] = useState<Partial<Connection>>({});

  useEffect(() => {
    if (connection) {
      setFormData(connection);
    }
  }, [connection]);

  if (!connection) return null;

  const handleSave = () => {
    if (formData.id) {
      onUpdate(formData.id, formData);
      toast.success('Connection updated');
    }
  };

  const handleDelete = () => {
    if (connection.id) {
      onDelete(connection.id);
      onClose();
    }
  };

  const updateField = (field: keyof Connection, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPort = () => {
    const newPort = parseInt((document.getElementById('new-port') as HTMLInputElement)?.value || '80');
    if (newPort && !formData.ports?.includes(newPort)) {
      updateField('ports', [...(formData.ports || []), newPort]);
      (document.getElementById('new-port') as HTMLInputElement).value = '';
    }
  };

  const removePort = (port: number) => {
    updateField('ports', formData.ports?.filter(p => p !== port) || []);
  };

  return (
    <Card className="w-96 border-2 border-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Icon name="Link" className="mr-2" size={20} />
            Edit Connection
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <Icon name="X" size={16} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Purpose */}
        <div className="space-y-2">
          <Label htmlFor="purpose">Purpose</Label>
          <Input
            id="purpose"
            value={formData.purpose || ''}
            onChange={(e) => updateField('purpose', e.target.value)}
            placeholder="e.g., API calls, Data sync"
          />
        </div>

        {/* Protocol */}
        <div className="space-y-2">
          <Label htmlFor="protocol">Protocol</Label>
          <Select 
            value={formData.protocol || ''} 
            onValueChange={(value) => updateField('protocol', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select protocol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="HTTPS">HTTPS</SelectItem>
              <SelectItem value="HTTP">HTTP</SelectItem>
              <SelectItem value="PostgreSQL">PostgreSQL</SelectItem>
              <SelectItem value="MySQL">MySQL</SelectItem>
              <SelectItem value="MongoDB">MongoDB</SelectItem>
              <SelectItem value="SSH">SSH</SelectItem>
              <SelectItem value="gRPC">gRPC</SelectItem>
              <SelectItem value="WebSocket">WebSocket</SelectItem>
              <SelectItem value="MQTT">MQTT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ports */}
        <div className="space-y-2">
          <Label>Ports</Label>
          <div className="flex gap-2">
            <Input
              id="new-port"
              type="number"
              placeholder="Port number"
              className="flex-1"
            />
            <Button onClick={addPort} size="sm">
              <Icon name="Plus" size={16} />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {formData.ports?.map((port) => (
              <Badge 
                key={port} 
                variant="secondary" 
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removePort(port)}
              >
                {port} <Icon name="X" size={12} className="ml-1" />
              </Badge>
            ))}
          </div>
        </div>

        {/* Encryption */}
        <div className="space-y-2">
          <Label htmlFor="encryption">Encryption</Label>
          <Select 
            value={formData.encryption || ''} 
            onValueChange={(value) => updateField('encryption', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select encryption" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TLS 1.3">TLS 1.3</SelectItem>
              <SelectItem value="TLS 1.2+">TLS 1.2+</SelectItem>
              <SelectItem value="mTLS">mTLS</SelectItem>
              <SelectItem value="None">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Authentication */}
        <div className="space-y-2">
          <Label htmlFor="auth">Authentication</Label>
          <Select 
            value={formData.auth || ''} 
            onValueChange={(value) => updateField('auth', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select auth method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bearer Token">Bearer Token</SelectItem>
              <SelectItem value="API Key">API Key</SelectItem>
              <SelectItem value="mTLS">mTLS</SelectItem>
              <SelectItem value="Basic Auth">Basic Auth</SelectItem>
              <SelectItem value="OAuth 2.0">OAuth 2.0</SelectItem>
              <SelectItem value="SAML">SAML</SelectItem>
              <SelectItem value="None">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Data Classification */}
        <div className="space-y-2">
          <Label htmlFor="dataClass">Data Classification</Label>
          <Select 
            value={formData.dataClass || ''} 
            onValueChange={(value) => updateField('dataClass', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Public">Public</SelectItem>
              <SelectItem value="Internal">Internal</SelectItem>
              <SelectItem value="Confidential">Confidential</SelectItem>
              <SelectItem value="Restricted">Restricted</SelectItem>
              <SelectItem value="PII">PII</SelectItem>
              <SelectItem value="PCI">PCI</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            <Icon name="FloppyDisk" size={16} className="mr-2" />
            Save Changes
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            className="flex-1"
          >
            <Icon name="Trash" size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}