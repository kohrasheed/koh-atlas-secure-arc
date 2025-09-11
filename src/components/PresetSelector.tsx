import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '../Icon';
import { Project } from '../../types';
import { PRESET_DESIGNS } from '../../data/presets';

interface PresetSelectorProps {
  onSelectPreset: (preset: Project) => void;
  onStartBlank: () => void;
}

export function PresetSelector({ onSelectPreset, onStartBlank }: PresetSelectorProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Icon name="Shield" className="text-primary" size={48} />
            <div>
              <h1 className="text-4xl font-bold">Koh Atlas</h1>
              <p className="text-xl text-muted-foreground">Secure Architecture Designer</p>
            </div>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Design and analyze application architectures with built-in security best practices.
            Choose a preset design to get started quickly, or begin with a blank canvas.
          </p>
        </div>

        {/* Quick Start Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Blank Canvas */}
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onStartBlank}>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Icon name="Plus" className="text-muted-foreground" size={24} />
                <CardTitle className="text-lg">Start Blank</CardTitle>
              </div>
              <CardDescription>
                Begin with an empty canvas and build your architecture from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Star" size={16} />
                <span>Custom Design</span>
              </div>
            </CardContent>
          </Card>

          {/* Preset Designs */}
          {PRESET_DESIGNS.map((preset) => (
            <Card 
              key={preset.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => onSelectPreset(preset)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={preset.id === 'secure-web-app' ? 'Shield' : 'Warning'} 
                      className={preset.id === 'secure-web-app' ? 'text-green-500' : 'text-red-500'} 
                      size={24} 
                    />
                    <CardTitle className="text-lg">{preset.name}</CardTitle>
                  </div>
                  <Badge 
                    variant={preset.id === 'secure-web-app' ? 'default' : 'destructive'}
                    className="text-xs"
                  >
                    {preset.id === 'secure-web-app' ? 'Secure' : 'Vulnerable'}
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {preset.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Icon name="Package" size={16} className="text-muted-foreground" />
                      <span>{preset.components.length} Components</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="ArrowRight" size={16} className="text-muted-foreground" />
                      <span>{preset.connections.length} Connections</span>
                    </div>
                  </div>
                  
                  {/* Component types preview */}
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(preset.components.map(c => c.category))).slice(0, 4).map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {Array.from(new Set(preset.components.map(c => c.category))).length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{Array.from(new Set(preset.components.map(c => c.category))).length - 4} more
                      </Badge>
                    )}
                  </div>

                  {/* Security highlights */}
                  <div className="pt-2 border-t border-border">
                    {preset.id === 'secure-web-app' ? (
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <Icon name="Check" size={16} />
                        <span>Defense in depth, encrypted connections, monitoring</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-red-600">
                        <Icon name="Warning" size={16} />
                        <span>Multiple vulnerabilities for educational analysis</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="Palette" className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold mb-2">Design Visually</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop components, create connections, and visualize your architecture
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="Eye" className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold mb-2">Analyze Security</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered security analysis with findings mapped to industry standards
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Icon name="Wrench" className="text-primary" size={24} />
            </div>
            <h3 className="font-semibold mb-2">Apply Fixes</h3>
            <p className="text-sm text-muted-foreground">
              One-click security improvements with auto-fix suggestions
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Koh Atlas helps you design secure architectures with confidence
          </p>
        </div>
      </div>
    </div>
  );
}