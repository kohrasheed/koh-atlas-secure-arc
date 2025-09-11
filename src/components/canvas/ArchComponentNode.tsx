import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArchComponent, ComponentType } from '../../types';
import { Icon } from '../Icon';

const TYPE_COLORS: Record<ComponentType, string> = {
  web: 'border-blue-500 bg-blue-50',
  app: 'border-green-500 bg-green-50',
  data: 'border-purple-500 bg-purple-50',
  network: 'border-orange-500 bg-orange-50',
  platform: 'border-gray-500 bg-gray-50',
  security: 'border-red-500 bg-red-50',
};

const TYPE_BADGE_COLORS: Record<ComponentType, string> = {
  web: 'bg-blue-100 text-blue-800',
  app: 'bg-green-100 text-green-800',
  data: 'bg-purple-100 text-purple-800',
  network: 'bg-orange-100 text-orange-800',
  platform: 'bg-gray-100 text-gray-800',
  security: 'bg-red-100 text-red-800',
};

interface ArchComponentNodeData {
  component: ArchComponent;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<ArchComponent>) => void;
}

export const ArchComponentNode = memo(({ data }: NodeProps<ArchComponentNodeData>) => {
  const { component, isSelected, onSelect } = data;

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(component.id);
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
          min-w-[180px] cursor-pointer transition-all duration-200
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
              <div className="text-sm font-medium truncate">
                {component.name}
              </div>
              <Badge 
                variant="secondary" 
                className={`text-xs mt-1 ${TYPE_BADGE_COLORS[component.type]}`}
              >
                {component.type}
              </Badge>
            </div>
          </div>
          
          {component.zone && (
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