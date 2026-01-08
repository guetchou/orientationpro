import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  // Vérifier si l'utilisateur est connecté via Supabase
  if (user) {
    return <>{children}</>;
  }
  
  // Vérifier si l'utilisateur est connecté via le backend (admin)
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  
  if (adminToken && adminUser) {
    return <>{children}</>;
  }
  
  // Vérifier si l'utilisateur est connecté via les comptes de test
  const userToken = localStorage.getItem('userToken');
  const userData = localStorage.getItem('userData');
  
  if (userToken && userData) {
    try {
      const userInfo = JSON.parse(userData);
      // Vérifier que les données sont valides
      if (userInfo.email && userInfo.role) {
        return <>{children}</>;
      }
    } catch (e) {
      console.error('Erreur parsing userData dans RequireAuth:', e);
      // Nettoyer les données corrompues
      localStorage.removeItem('userData');
      localStorage.removeItem('userToken');
    }
  }
  
  // Si en cours de chargement, afficher un loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  // Rediriger vers la page de connexion si non authentifié
  return <Navigate to="/login" replace />;
};

export default RequireAuth; 