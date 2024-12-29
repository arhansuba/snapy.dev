// frontend/src/hooks/useAuth.ts
import { useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LoginCredentials, RegisterCredentials } from '../../../shared/types/auth';
import { APP_ROUTES } from '../config/routes';

export const useAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
  } = useAuthStore();

  // Check auth status and redirect if needed
  useEffect(() => {
    const from = location.state?.from?.pathname || APP_ROUTES.DASHBOARD.path;
    if (isAuthenticated && location.pathname === APP_ROUTES.LOGIN.path) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  const handleLogin = useCallback(async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      const from = location.state?.from?.pathname || APP_ROUTES.DASHBOARD.path;
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by the store
    }
  }, [login, navigate, location]);

  const handleRegister = useCallback(async (credentials: RegisterCredentials) => {
    try {
      await register(credentials);
      navigate(APP_ROUTES.DASHBOARD.path, { replace: true });
    } catch (error) {
      // Error is handled by the store
    }
  }, [register, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate(APP_ROUTES.HOME.path);
  }, [logout, navigate]);

  const checkAuth = useCallback(() => {
    if (!isAuthenticated) {
      navigate(APP_ROUTES.LOGIN.path, {
        state: { from: location },
        replace: true,
      });
      return false;
    }
    return true;
  }, [isAuthenticated, navigate, location]);

  return {
    isAuthenticated,
    user,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    updateUser,
    checkAuth,
  };
};