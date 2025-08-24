import { GlobalLoadingSpinner } from '@/components/GlobalLoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

interface RouteGuardsProps {
  children: React.ReactNode;
  path: string;
}

export function PublicRoute({ children, path }: RouteGuardsProps) {
  const { user } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (user && (path === '/login' || path === '/register' || path === '/')) {
      navigate('/dashboard', { replace: true, state: { from: location } });
    }
  }, [user, path, navigate, location]);

  if (user && (path === '/login' || path === '/register')) {
    return null;
  }

  return <>{children}</>;
}

export function ProtectedRoute({ children, path }: RouteGuardsProps) {
  const { user, loading } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', {
        replace: true,
        state: { from: location },
      });
    }
  }, [user, path, loading, navigate, location]);

  if (loading) {
    return <GlobalLoadingSpinner />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
