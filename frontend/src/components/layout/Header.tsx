// frontend/src/components/layout/Header.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, Settings } from 'lucide-react';
import { Button } from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { currentPlan } = useSubscription();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="hidden font-bold sm:inline-block">
              AI App Builder
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <div className="hidden md:block">
                <span className="text-sm font-medium">
                  {currentPlan?.name || 'Free'} Plan
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2">
                  <img
                    src={`https://avatars.dicebear.com/api/initials/${user.name || 'U'}.svg`}
                    alt="Avatar"
                    className="h-8 w-8 rounded-full"
                  />
                  <div className="hidden md:block">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};