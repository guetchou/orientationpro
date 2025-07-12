import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ProfessionalHeader } from '@/components/layout/ProfessionalHeader';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import TestResults from '@/pages/TestResults';
import SuperAdmin from '@/pages/admin/SuperAdmin';
import AdminDashboard from '@/pages/admin/Dashboard';
import ATSAdmin from '@/pages/admin/ATSAdmin';
import BlogAdmin from '@/pages/admin/BlogAdmin';
import MediaManager from '@/pages/admin/MediaManager';
import Tests from '@/pages/Tests';
import RiasecTest from '@/pages/RiasecTest';
import RequireAuth from '@/components/auth/RequireAuth';
import Recrutement from '@/pages/Recrutement';
import Conseillers from '@/pages/Conseillers';
import SeniorEmploymentTest from '@/pages/SeniorEmploymentTest';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import CVOptimizerPage from '@/pages/CVOptimizer';
import CVHistoryPage from '@/pages/CVHistory';
import ConseillerDashboard from '@/pages/conseiller/Dashboard';
import Unauthorized from '@/pages/Unauthorized';
import { 
  PublicRoute, 
  PrivateRoute, 
  AdminRoute, 
  SuperAdminRoute, 
  ConseillerRoute, 
  UserRoute 
} from '@/components/auth/AuthGuard';

// Anciens composants supprimés - utilisation des nouveaux AuthGuard

export const AppRouter = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <ProfessionalHeader />
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/tests/riasec" element={<RiasecTest />} />
          <Route path="/tests/emotional" element={<RiasecTest />} />
          <Route path="/tests/learning" element={<RiasecTest />} />
          <Route path="/tests/multiple" element={<RiasecTest />} />
          <Route path="/tests/career-transition" element={<RiasecTest />} />
          <Route path="/tests/no-diploma" element={<RiasecTest />} />
          <Route path="/tests/senior-employment" element={<SeniorEmploymentTest />} />
          <Route path="/tests/entrepreneurial" element={<RiasecTest />} />
          <Route path="/ats" element={<Recrutement />} />
          <Route path="/conseiller" element={<Conseillers />} />
          <Route path="/recrutement" element={<Recrutement />} />
          <Route path="/orientation-services" element={<Tests />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/cv-optimizer" element={<CVOptimizerPage />} />
          <Route path="/cv-history" element={<CVHistoryPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          {/* Routes protégées utilisateur */}
          <Route path="/dashboard" element={
            <UserRoute>
              <Dashboard />
            </UserRoute>
          } />
          <Route path="/test-results" element={
            <UserRoute>
              <TestResults />
            </UserRoute>
          } />
          
          {/* Routes admin protégées */}
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="/admin/super-admin" element={
            <SuperAdminRoute>
              <SuperAdmin />
            </SuperAdminRoute>
          } />
          <Route path="/admin/ats" element={
            <AdminRoute>
              <ATSAdmin />
            </AdminRoute>
          } />
          <Route path="/admin/blog" element={
            <AdminRoute>
              <BlogAdmin />
            </AdminRoute>
          } />
          <Route path="/admin/media" element={
            <AdminRoute>
              <MediaManager />
            </AdminRoute>
          } />
          
          {/* Routes conseiller protégées */}
          <Route path="/conseiller/dashboard" element={
            <ConseillerRoute>
              <ConseillerDashboard />
            </ConseillerRoute>
          } />
          
          {/* Redirection pour toutes les autres routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};
