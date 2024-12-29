// frontend/src/App.tsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

// Layout Components
import { Layout } from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/payment/Success';
import PaymentCancel from './pages/payment/Cancel';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';

// Route Protection
interface ProtectedRouteProps {
 children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
 const { isAuthenticated, loading } = useAuth();

 if (loading) {
   return (
     <div className="min-h-screen flex items-center justify-center">
       <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
     </div>
   );
 }

 if (!isAuthenticated) {
   return <Navigate to="/login" replace />;
 }

 return <>{children}</>;
};

export const App: React.FC = () => {
 const { init } = useAuth();

 useEffect(() => {
   init();
 }, [init]);

 return (
   <Router>
     <Toaster
       position="bottom-right"
       toastOptions={{
         duration: 5000,
         style: {
           background: '#333',
           color: '#fff',
         },
       }}
     />
     
     <Routes>
       {/* Public Routes */}
       <Route path="/" element={<Layout><Home /></Layout>} />
       <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
       <Route 
         path="/login" 
         element={
           <div className="min-h-screen flex items-center justify-center bg-gray-50">
             <LoginForm />
           </div>
         } 
       />
       <Route 
         path="/register" 
         element={
           <div className="min-h-screen flex items-center justify-center bg-gray-50">
             <SignupForm />
           </div>
         } 
       />

       {/* Protected Routes */}
       <Route
         path="/dashboard"
         element={
           <ProtectedRoute>
             <Layout>
               <Dashboard />
             </Layout>
           </ProtectedRoute>
         }
       />
       <Route
         path="/builder"
         element={
           <ProtectedRoute>
             <Layout>
               <Builder />
             </Layout>
           </ProtectedRoute>
         }
       />

       {/* Payment Routes */}
       <Route
         path="/payment/success"
         element={
           <ProtectedRoute>
             <PaymentSuccess />
           </ProtectedRoute>
         }
       />
       <Route
         path="/payment/cancel"
         element={
           <ProtectedRoute>
             <PaymentCancel />
           </ProtectedRoute>
         }
       />

       {/* 404 Route */}
       <Route
         path="*"
         element={
           <Layout>
             <div className="min-h-[60vh] flex flex-col items-center justify-center">
               <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
               <p className="text-gray-600 mb-8">
                 The page you're looking for doesn't exist.
               </p>
               <button
                 onClick={() => window.history.back()}
                 className="text-primary hover:underline"
               >
                 Go Back
               </button>
             </div>
           </Layout>
         }
       />
     </Routes>
   </Router>
 );
};

export default App;