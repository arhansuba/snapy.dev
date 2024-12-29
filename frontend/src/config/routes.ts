// frontend/src/config/routes.ts
import { PlanType } from '../../../shared/types/payment';

interface Route {
  path: string;
  name: string;
  title: string;
  requiredAuth: boolean;
  requiredPlan?: readonly PlanType[];
  roles?: string[];
}

export const APP_ROUTES = {
  // Public routes
  HOME: {
    path: '/',
    name: 'home',
    title: 'Home',
    requiredAuth: false,
  },
  LOGIN: {
    path: '/login',
    name: 'login',
    title: 'Login',
    requiredAuth: false,
  },
  REGISTER: {
    path: '/register',
    name: 'register',
    title: 'Register',
    requiredAuth: false,
  },
  PRICING: {
    path: '/pricing',
    name: 'pricing',
    title: 'Pricing',
    requiredAuth: false,
  },

  // Protected routes
  DASHBOARD: {
    path: '/dashboard',
    name: 'dashboard',
    title: 'Dashboard',
    requiredAuth: true,
  },
  BUILDER: {
    path: '/builder',
    name: 'builder',
    title: 'AI Builder',
    requiredAuth: true,
  },
  PROJECTS: {
    path: '/projects',
    name: 'projects',
    title: 'Projects',
    requiredAuth: true,
  },
  PROJECT_DETAIL: {
    path: '/projects/:id',
    name: 'project-detail',
    title: 'Project Details',
    requiredAuth: true,
  },
  SETTINGS: {
    path: '/settings',
    name: 'settings',
    title: 'Settings',
    requiredAuth: true,
  },

  // Payment routes
  BILLING: {
    path: '/billing',
    name: 'billing',
    title: 'Billing',
    requiredAuth: true,
  },
  PAYMENT_SUCCESS: {
    path: '/payment/success',
    name: 'payment-success',
    title: 'Payment Successful',
    requiredAuth: true,
  },
  PAYMENT_CANCEL: {
    path: '/payment/cancel',
    name: 'payment-cancel',
    title: 'Payment Cancelled',
    requiredAuth: true,
  },

  // Premium features
  CODE_EXPORT: {
    path: '/export/:id',
    name: 'code-export',
    title: 'Export Code',
    requiredAuth: true,
    requiredPlan: [PlanType.BASIC, PlanType.PREMIUM, PlanType.ENTERPRISE],
  },
  TEAM_DASHBOARD: {
    path: '/team',
    name: 'team',
    title: 'Team Dashboard',
    requiredAuth: true,
    requiredPlan: [PlanType.PREMIUM, PlanType.ENTERPRISE],
  },
} as const;

export const getRouteByPath = (path: string): Route | undefined => {
  return Object.values(APP_ROUTES).find(route => route.path === path);
};

export const formatPathWithParams = (path: string, params: Record<string, string>): string => {
  let formattedPath = path;
  Object.entries(params).forEach(([key, value]) => {
    formattedPath = formattedPath.replace(`:${key}`, value);
  });
  return formattedPath;
};