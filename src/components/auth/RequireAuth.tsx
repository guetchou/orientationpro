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
  
  // Vérifier si l'utilisateur est connecté via le backend (utilisateur normal)
  const userToken = localStorage.getItem('userToken');
  const userData = localStorage.getItem('userData');
  
  if (userToken && userData) {
    return <>{children}</>;
  }
  
  // Si en cours de chargement, afficher un loader ou rien
  if (loading) {
    return <div>Chargement...</div>;
  }
  
  // Rediriger vers la page de connexion si non authentifié
  return <Navigate to="/login" replace />;
};

export default RequireAuth; 