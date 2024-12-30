import { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';

// Layout components


// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/payment/Success';
import PaymentCancel from './pages/payment/Cancel';

// Auth components


// Styles
import './App.css';
import { Sidebar } from 'lucide-react';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

const App: FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Protected route wrapper
  const ProtectedRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
    if (loading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/login" />;
    return <>{children}</>;
  };

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="flex min-h-screen flex-col bg-gray-50">
          <Header />
          
          <main className="flex flex-1">
            {isAuthenticated && <Sidebar />}
            
            <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route 
                  path="/login" 
                  element={
                    !isAuthenticated ? <LoginForm /> : <Navigate to="/dashboard" />
                  }
                />
                <Route 
                  path="/signup" 
                  element={
                    !isAuthenticated ? <SignupForm /> : <Navigate to="/dashboard" />
                  }
                />

                {/* Protected routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/builder"
                  element={
                    <ProtectedRoute>
                      <Builder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/builder/:projectId"
                  element={
                    <ProtectedRoute>
                      <Builder />
                    </ProtectedRoute>
                  }
                />

                {/* Payment routes */}
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

                {/* 404 route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </main>

          <Footer />
        </div>

        {/* Toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;