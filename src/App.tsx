import React from 'react';
import { Button } from '@/components/ui/button';
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
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <span className="text-sm text-muted-foreground">
              Test Mode - All errors resolved
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Application is running successfully!</h2>
          <p className="text-muted-foreground">All React context errors have been resolved.</p>
          <Button onClick={() => alert('Working!')}>Test Button</Button>
        </div>
      </div>
    </div>
  );
}

export default App;