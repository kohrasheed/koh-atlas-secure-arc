import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card">
        <div className="h-full px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-xl font-bold">Koh Atlas</h1>
              <p className="text-sm text-muted-foreground">Secure Architecture Designer</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">
              Theme Toggle Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Theme Toggle Demo</CardTitle>
            <CardDescription>
              Use the theme toggle in the top-right corner to switch between light, dark, and system themes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-md bg-muted">
              <p className="text-sm text-muted-foreground">
                This card demonstrates the theme colors. Notice how the background, 
                text, and borders change when you toggle themes.
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="default">Primary Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded bg-primary text-primary-foreground">Primary</div>
              <div className="p-2 rounded bg-secondary text-secondary-foreground">Secondary</div>
              <div className="p-2 rounded bg-accent text-accent-foreground">Accent</div>
              <div className="p-2 rounded bg-destructive text-destructive-foreground">Destructive</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;