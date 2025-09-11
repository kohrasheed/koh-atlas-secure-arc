import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ArchComponent, ComponentType } from '../../types';
import { Icon } from '../Icon';

const TYPE_COLORS: Record<ComponentType, string> = {
  web: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-400',
  app: 'border-green-500 bg-green-50 dark:bg-green-950/20 dark:border-green-400',
  data: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-400',
  network: 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-400',
  platform: 'border-gray-500 bg-gray-50 dark:bg-gray-950/20 dark:border-gray-400',
  security: 'border-red-500 bg-red-50 dark:bg-red-950/20 dark:border-red-400',
};

const TYPE_BADGE_COLORS: Record<ComponentType, string> = {
  web: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  app: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  data: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  network: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  platform: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  security: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

interface ArchComponentNodeData {
  component: ArchComponent;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<ArchComponent>) => void;
  onDelete: (id: string) => void;
}

export const ArchComponentNode = memo(({ data }: NodeProps<ArchComponentNodeData>) => {
  const { component, isSelected, onSelect, onDelete } = data;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(component.name);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(component.id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(component.id);
  };

  const handleEditClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleNameSave = () => {
    data.onUpdate(component.id, { name: editName });
    setIsEditing(false);
  };

  const handleNameCancel = () => {
    setEditName(component.name);
    setIsEditing(false);
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-primary"
      />
      
      <Card 
        className={`
          min-w-[180px] cursor-pointer transition-all duration-200 relative group
          ${TYPE_COLORS[component.type]}
          ${isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}
        `}
        onClick={handleClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Icon 
                name={component.icon} 
                className="text-foreground" 
                size={24} 
              />
            </div>
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-sm font-medium h-6 px-1"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleNameSave();
                      if (e.key === 'Escape') handleNameCancel();
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={handleNameSave}>
                      <Icon name="Check" size={12} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleNameCancel}>
                      <Icon name="X" size={12} />
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-sm font-medium truncate">
                    {component.name}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs mt-1 ${TYPE_BADGE_COLORS[component.type]}`}
                  >
                    {component.type}
                  </Badge>
                </>
              )}
            </div>
            
            {/* Context Menu */}
            {isSelected && !isEditing && (
              <div className="absolute top-1 right-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0 hover:bg-primary/20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Icon name="DotsThree" size={12} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleEditClick}>
                      <Icon name="PencilSimple" size={16} className="mr-2" />
                      Edit Name
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Icon name="Trash" size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
          
          {component.zone && !isEditing && (
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                {component.zone}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-primary"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary"
      />
    </>
  );
});