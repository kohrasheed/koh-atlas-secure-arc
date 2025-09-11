import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "sonner";

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

import "./main.css"
import "./index.css"

// Import Spark after React and other dependencies
import "@github/spark/spark"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <App />
      <Toaster position="top-right" />
    </ErrorBoundary>
  </StrictMode>
)
