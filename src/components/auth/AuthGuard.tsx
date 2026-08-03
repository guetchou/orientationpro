import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  roles?: string[];
  fallback?: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  roles = [],
  fallback,
}) => {
  const { user, loading, isSuperAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const isAuthenticated = !!user;

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />;
  }

  if (roles.length > 0 && isAuthenticated) {
    const accountRoles = user?.roles?.length
      ? user.roles
      : [user?.role || 'user'];
    const normalizedRoles = accountRoles.map((role) => role.trim().toLowerCase());
    const hasRequiredRole = normalizedRoles.some((role) => roles.includes(role))
      || (isSuperAdmin && roles.includes('admin'))
      || (normalizedRoles.includes('super_admin') && roles.includes('admin'));

    if (!hasRequiredRole) {
      console.log(`AuthGuard - Accès refusé: rôles ${normalizedRoles.join(', ')} requis: ${roles.join(', ')}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth={false}>{children}</AuthGuard>
);

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth>{children}</AuthGuard>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth roles={['admin', 'super_admin']}>{children}</AuthGuard>
);

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth roles={['super_admin']}>{children}</AuthGuard>
);

export const ConseillerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth roles={['conseiller', 'admin', 'super_admin']}>{children}</AuthGuard>
);

export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth roles={['user', 'admin', 'super_admin', 'conseiller']}>{children}</AuthGuard>
);

export const RecruteurRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth roles={['recruteur', 'recruiter', 'recruitment_manager', 'admin', 'super_admin']}>{children}</AuthGuard>
);

export const CoachRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth roles={['coach', 'admin', 'super_admin']}>{children}</AuthGuard>
);

export const RhRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthGuard requireAuth roles={['rh', 'admin', 'super_admin']}>{children}</AuthGuard>
);
