import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { COMPONENT_CATALOG } from '../../data/catalog';
import { Icon } from '../Icon';
import { ComponentType } from '../../types';

interface ComponentPaletteProps {
  onComponentSelect: (componentId: string) => void;
}

const TYPE_COLORS: Record<ComponentType, string> = {
  web: 'bg-blue-100 text-blue-800',
  app: 'bg-green-100 text-green-800',
  data: 'bg-purple-100 text-purple-800',
  network: 'bg-orange-100 text-orange-800',
  platform: 'bg-gray-100 text-gray-800',
  security: 'bg-red-100 text-red-800',
};

export function ComponentPalette({ onComponentSelect }: ComponentPaletteProps) {
  const groupedComponents = COMPONENT_CATALOG.reduce((acc, component) => {
    if (!acc[component.category]) {
      acc[component.category] = [];
    }
    acc[component.category].push(component);
    return acc;
  }, {} as Record<string, typeof COMPONENT_CATALOG>);

  return (
    <div className="w-80 h-full bg-card border-r border-border overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Component Palette</h2>
        
        <div className="space-y-4">
          {Object.entries(groupedComponents).map(([category, components]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{category}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {components.map((component) => (
                  <Button
                    key={component.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => onComponentSelect(component.id)}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="flex-shrink-0">
                        <Icon 
                          name={component.icon} 
                          className="text-muted-foreground" 
                          size={20} 
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium">{component.name}</div>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${TYPE_COLORS[component.type]}`}
                        >
                          {component.type}
                        </Badge>
                      </div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}