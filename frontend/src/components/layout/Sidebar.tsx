// frontend/src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Code, Box, Settings, CreditCard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Dashboard' },
  { path: '/builder', icon: Code, label: 'AI Builder' },
  { path: '/projects', icon: Box, label: 'Projects' },
  { path: '/billing', icon: CreditCard, label: 'Billing' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { checkPlanAccess } = useSubscription();

  return (
    <aside className="fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] w-56 border-r bg-background md:block">
      <div className="flex h-full flex-col gap-4 py-4">
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                  ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-4 py-2 border-t">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <img
                src={`https://avatars.dicebear.com/api/initials/${user?.name || 'U'}.svg`}
                alt="Avatar"
                className="h-8 w-8 rounded-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};