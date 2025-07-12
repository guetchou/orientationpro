import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthProvider'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  roles?: string[]
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  roles = []
}) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Afficher un loader pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  // Si l'authentification est requise mais l'utilisateur n'est pas connecté
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si l'utilisateur est connecté mais essaie d'accéder aux pages de connexion
  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />
  }

  // Vérifier les rôles si spécifiés
  if (roles.length > 0 && user) {
    const userRole = user.user_metadata?.role || 'user'
    if (!roles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}

// Composant pour les routes publiques (redirige si connecté)
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute requireAuth={false}>{children}</ProtectedRoute>
}

// Composant pour les routes admin
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute roles={['admin', 'super_admin']}>{children}</ProtectedRoute>
}

// Composant pour les routes consultant
export const ConsultantRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute roles={['consultant', 'admin', 'super_admin']}>{children}</ProtectedRoute>
} 