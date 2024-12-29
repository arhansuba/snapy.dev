// frontend/src/config/constants.ts
export const APP_CONFIG = {
    name: 'AI App Builder',
    version: '1.0.0',
    description: 'Build applications using AI',
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
    environment: import.meta.env.MODE,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
  } as const;
  
  export const AUTH_CONFIG = {
    tokenKey: 'auth_token',
    tokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    refreshTokenKey: 'refresh_token',
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  } as const;
  
  export const UI_CONFIG = {
    theme: {
      light: 'light',
      dark: 'dark',
      system: 'system',
    },
    animation: {
      duration: 200,
      easing: 'ease-in-out',
    },
    toast: {
      duration: 5000,
      position: 'bottom-right',
    },
    pagination: {
      defaultPageSize: 10,
      pageSizeOptions: [10, 20, 50, 100],
    },
    breakpoints: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  } as const;
  
  export const API_ENDPOINTS = {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
    },
    projects: {
      list: '/projects',
      detail: (id: string) => `/projects/${id}`,
      create: '/projects',
      update: (id: string) => `/projects/${id}`,
      delete: (id: string) => `/projects/${id}`,
    },
    ai: {
      generate: '/ai/generate',
      usage: '/ai/usage',
    },
    payment: {
      plans: '/payment/plans',
      subscribe: '/payment/subscribe',
      cancel: '/payment/cancel',
      invoices: '/payment/invoices',
    },
  } as const;
  
  export const ERROR_MESSAGES = {
    general: {
      serverError: 'An unexpected error occurred. Please try again later.',
      networkError: 'Unable to connect to the server. Please check your internet connection.',
      notFound: 'The requested resource was not found.',
      unauthorized: 'You are not authorized to perform this action.',
    },
    auth: {
      invalidCredentials: 'Invalid email or password.',
      emailExists: 'An account with this email already exists.',
      weakPassword: 'Password does not meet security requirements.',
      sessionExpired: 'Your session has expired. Please log in again.',
    },
    validation: {
      required: 'This field is required.',
      email: 'Please enter a valid email address.',
      password: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
      maxLength: (field: string, length: number) => `${field} cannot exceed ${length} characters.`,
    },
    payment: {
      cardDeclined: 'Your card was declined. Please try a different card.',
      insufficientFunds: 'Insufficient funds on your card.',
      invalidCard: 'Invalid card information.',
    },
  } as const;
  
  export const ANALYTICS_EVENTS = {
    page: {
      view: 'page_view',
      exit: 'page_exit',
    },
    user: {
      signup: 'user_signup',
      login: 'user_login',
      logout: 'user_logout',
    },
    project: {
      create: 'project_create',
      update: 'project_update',
      delete: 'project_delete',
      export: 'project_export',
    },
    ai: {
      generate: 'ai_generate',
      error: 'ai_error',
    },
    payment: {
      subscribe: 'payment_subscribe',
      cancel: 'payment_cancel',
    },
  } as const;
  
  