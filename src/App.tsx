
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from 'sonner';

// Pages publiques
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import Tests from './pages/Tests';
import TestResults from './pages/TestResults';
import { ForumLayout } from './components/forum/ForumLayout';
import Blog from './pages/Blog';
import Actualites from './pages/Actualites';

// Pages protégées
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/admin/AdminDashboard';
import CMS from './pages/admin/CMS';
import { UserManagement } from './components/admin/UserManagement';
import SuperAdmin from './pages/admin/SuperAdmin';
import UserCredentials from "./pages/admin/UserCredentials";
import { DashboardLayout } from './components/DashboardLayout';

// Route protégée qui vérifie l'authentification
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('authToken') !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Composants pour le forum
const ForumGeneral = () => <div>Forum général</div>;
const ForumDomain = () => <div>Forum par domaine</div>;
const ForumCreate = () => <div>Créer un post</div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <div>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/test-results" element={<TestResults />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/actualites" element={<Actualites />} />
            
            {/* Routes forum */}
            <Route path="/forum" element={<ForumLayout><ForumGeneral /></ForumLayout>} />
            <Route path="/forum/domain/:id" element={<ForumLayout><ForumDomain /></ForumLayout>} />
            <Route path="/forum/create" element={
              <ProtectedRoute>
                <ForumLayout><ForumCreate /></ForumLayout>
              </ProtectedRoute>
            } />
            
            {/* Routes protégées */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            
            {/* Routes administration */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/cms" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <CMS />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/user-management" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UserManagement />
                </DashboardLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin/super-admin" element={<SuperAdmin />} />
            <Route path="/admin/user-credentials" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UserCredentials />
                </DashboardLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
