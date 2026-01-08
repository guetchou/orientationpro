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
  fallback
}) => {
  const { user, loading, isSuperAdmin } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant le chargement
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

  // Vérifier l'authentification
  const isAuthenticated = !!user;

  // Si l'authentification est requise mais l'utilisateur n'est pas connecté
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si l'utilisateur est connecté mais essaie d'accéder aux pages de connexion (login/register)
  if (!requireAuth && isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    return <Navigate to="/dashboard" replace />;
  }

  // Vérifier les rôles si spécifiés
  if (roles.length > 0 && isAuthenticated) {
    const userRole = user?.role || 'user';
    const hasRequiredRole = roles.includes(userRole) || 
                           (isSuperAdmin && roles.includes('admin')) ||
                           (userRole === 'super_admin' && roles.includes('admin'));

    if (!hasRequiredRole) {
      console.log(`AuthGuard - Accès refusé: rôle ${userRole} requis: ${roles.join(', ')}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

// Composants spécialisés pour différents types de routes
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard requireAuth={false}>{children}</AuthGuard>;
};

export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard requireAuth={true}>{children}</AuthGuard>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard requireAuth={true} roles={['admin', 'super_admin']}>{children}</AuthGuard>;
};

export const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard requireAuth={true} roles={['super_admin']}>{children}</AuthGuard>;
};

export const ConseillerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard requireAuth={true} roles={['conseiller', 'admin', 'super_admin']}>{children}</AuthGuard>;
};

export const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard requireAuth={true} roles={['user', 'admin', 'super_admin', 'conseiller']}>{children}</AuthGuard>;
}; 

export const RecruteurRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard requireAuth={true} roles={['recruteur', 'admin', 'super_admin']}>{children}</AuthGuard>;
};

export const CoachRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard requireAuth={true} roles={['coach', 'admin', 'super_admin']}>{children}</AuthGuard>;
};

export const RhRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <AuthGuard requireAuth={true} roles={['rh', 'admin', 'super_admin']}>{children}</AuthGuard>;
};