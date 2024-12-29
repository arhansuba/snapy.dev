// frontend/src/components/layout/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container flex flex-col items-center gap-4 py-6 md:flex-row md:justify-between md:gap-0">
        <div className="flex flex-col items-center gap-2 md:flex-row md:gap-4">
          <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} AI App Builder. All rights reserved.
          </p>
        </div>

        <nav className="flex items-center gap-4">
          <Link
            to="/terms"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Terms
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Privacy
          </Link>
          
            href="https://github.com/your-repo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-900"
          >
            <Github className="h-5 w-5" />
          </a>
          
            href="https://twitter.com/your-handle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-900"
          >
            <Twitter className="h-5 w-5" />
          </a>
        </nav>
      </div>
    </footer>
  );
};

// Optional: Layout wrapper component
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-56 p-4">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};