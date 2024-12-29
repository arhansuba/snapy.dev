// frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Analytics } from '@vercel/analytics/react';

// Import global CSS
import './index.css';

// Setup error tracking
const reportError = (error: Error) => {
 // Implement your error reporting service here
 console.error('Application Error:', error);
};

// Setup error boundary
class ErrorBoundary extends React.Component
 { children: React.ReactNode },
 { hasError: boolean }
> {
 constructor(props: { children: React.ReactNode }) {
   super(props);
   this.state = { hasError: false };
 }

 static getDerivedStateFromError(_: Error) {
   return { hasError: true };
 }

 componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
   reportError(error);
   console.error('Error Info:', errorInfo);
 }

 render() {
   if (this.state.hasError) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
         <div className="text-center p-8">
           <h1 className="text-2xl font-bold text-gray-900 mb-4">
             Oops! Something went wrong
           </h1>
           <p className="text-gray-600 mb-8">
             We're having trouble loading this page. Please try refreshing.
           </p>
           <button
             onClick={() => window.location.reload()}
             className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
           >
             Refresh Page
           </button>
         </div>
       </div>
     );
   }

   return this.props.children;
 }
}

// Create root and render app
const root = ReactDOM.createRoot(
 document.getElementById('root') as HTMLElement
);

root.render(
 <React.StrictMode>
   <ErrorBoundary>
     <App />
     <Analytics />
   </ErrorBoundary>
 </React.StrictMode>
);

// Enable hot module replacement for development
if (import.meta.hot) {
 import.meta.hot.accept();
}

// Register service worker for PWA support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
 window.addEventListener('load', () => {
   navigator.serviceWorker
     .register('/service-worker.js')
     .then(registration => {
       console.log('SW registered:', registration);
     })
     .catch(registrationError => {
       console.error('SW registration failed:', registrationError);
     });
 });
}

// Add debugging tools for development
if (import.meta.env.DEV) {
 // You can add development-specific tools here
 const whyDidYouRender = require('@welldone-software/why-did-you-render');
 whyDidYouRender(React, {
   trackAllPureComponents: true,
 });
}

// Export additional utilities if needed
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;