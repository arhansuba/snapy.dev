import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from './hooks/useAuth';
import { SubscriptionProvider } from './hooks/useSubscription';
import { ProjectProvider } from './hooks/useProject';
import App from './App';
import './index.css';

// Configure React Query client
const queryClient = new QueryClient({
 defaultOptions: {
   queries: {    
     refetchOnWindowFocus: false,
     retry: 1,
     staleTime: 5 * 60 * 1000, // 5 minutes
   },
 },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
 <React.StrictMode>
   <Router>
     <QueryClientProvider client={queryClient}>
       <AuthProvider>
         <SubscriptionProvider>
           <ProjectProvider>
             <App />
           </ProjectProvider>
         </SubscriptionProvider>
       </AuthProvider>
       {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
     </QueryClientProvider>
   </Router>
 </React.StrictMode>
);

// Enable hot module replacement (HMR) in development
if (import.meta.hot) {
 import.meta.hot.accept();
}

// Report web vitals
// Optional: Add web vitals reporting for performance monitoring
if (import.meta.env.PROD) {
 import('web-vitals').then((webVitals) => {
   webVitals.onCLS(console.log);
   webVitals.onFID(console.log);
   webVitals.onFCP(console.log);
   webVitals.onLCP(console.log);
   webVitals.onTTFB(console.log);
 });
}

// Error tracking setup
window.onerror = (message, source, lineno, colno, error) => {
 // TODO: Add your error tracking service here
 console.error('Global error:', { message, source, lineno, colno, error });
 return false;
};

// Unhandled promise rejection handling
window.onunhandledrejection = (event) => {
 // TODO: Add your error tracking service here
 console.error('Unhandled promise rejection:', event.reason);
};

// Type declarations for environment variables
declare global {
 interface ImportMetaEnv {
   readonly VITE_API_URL: string;
   readonly VITE_STRIPE_PUBLIC_KEY: string;
   // Add other environment variables as needed
 }

 interface ImportMeta {
   readonly env: ImportMetaEnv;
 }
}