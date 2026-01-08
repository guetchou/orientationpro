import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';
import { RouteTracker } from '@/components/analytics/RouteTracker';

// Composant de chargement optimisé
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

// Lazy loading pour toutes les pages
// Pages publiques
const Index = lazy(() => import('@/pages/Index'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Tests = lazy(() => import('@/pages/Tests'));
const RiasecTest = lazy(() => import('@/pages/RiasecTest'));
const EmotionalTest = lazy(() => import('@/pages/EmotionalTest'));
const LearningTest = lazy(() => import('@/pages/LearningTest'));
const MultipleIntelligenceTest = lazy(() => import('@/pages/MultipleIntelligenceTest'));
const CareerTransitionTest = lazy(() => import('@/pages/CareerTransitionTest'));
const NoDiplomaTest = lazy(() => import('@/pages/NoDiplomaTest'));
const SeniorEmploymentTest = lazy(() => import('@/pages/SeniorEmploymentTest'));
const EntrepreneurialTest = lazy(() => import('@/pages/EntrepreneurialTest'));
const Recrutement = lazy(() => import('@/pages/Recrutement'));
const ProfessionalJobsPage = lazy(() => import('@/pages/ProfessionalJobsPage'));
const Conseillers = lazy(() => import('@/pages/Conseillers'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const CVOptimizer = lazy(() => import('@/pages/CVOptimizer'));
const CVHistory = lazy(() => import('@/pages/CVHistory'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));
const GuideEtudesCongo2024 = lazy(() => import('@/pages/GuideEtudesCongo2024'));
const BookAppointment = lazy(() => import('@/pages/BookAppointment'));
const RecruitmentPage = lazy(() => import('@/pages/RecruitmentPage'));

// Pages utilisateur
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const TestResults = lazy(() => import('@/pages/TestResults'));
const Profile = lazy(() => import('@/pages/Profile'));

// Pages admin
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const SuperAdmin = lazy(() => import('@/pages/admin/SuperAdmin'));
const ATSAdmin = lazy(() => import('@/pages/admin/ATSAdmin'));
const BlogAdmin = lazy(() => import('@/pages/admin/BlogAdmin'));
const MediaManager = lazy(() => import('@/pages/admin/MediaManager'));

// Pages conseiller
const ConseillerDashboard = lazy(() => import('@/pages/conseiller/Dashboard'));
// Pages recruteur/coach/RH/superadmin
const RecruteurDashboard = lazy(() => import('@/pages/recruteur/Dashboard'));
const CoachDashboard = lazy(() => import('@/pages/coach/Dashboard'));
const RhDashboard = lazy(() => import('@/pages/rh/Dashboard'));
const SuperAdminDashboard = lazy(() => import('@/pages/superadmin/Dashboard'));

// Composants d'authentification - pas de lazy loading car utilisés immédiatement
import { 
  PublicRoute, 
  PrivateRoute, 
  AdminRoute, 
  SuperAdminRoute, 
  ConseillerRoute, 
  UserRoute,
  RecruteurRoute,
  CoachRoute,
  RhRoute
} from '@/components/auth/AuthGuard';

export const AppRouter = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <RouteTracker />
        <Header />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Routes publiques */}
            <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/tests/riasec" element={<RiasecTest />} />
          <Route path="/tests/emotional" element={<EmotionalTest />} />
          <Route path="/tests/learning" element={<LearningTest />} />
          <Route path="/tests/multiple" element={<MultipleIntelligenceTest />} />
          <Route path="/tests/career-transition" element={<CareerTransitionTest />} />
          <Route path="/tests/no-diploma" element={<NoDiplomaTest />} />
          <Route path="/tests/senior-employment" element={<SeniorEmploymentTest />} />
          <Route path="/tests/entrepreneurial" element={<EntrepreneurialTest />} />
          <Route path="/ats" element={<Recrutement />} />
          <Route path="/conseiller" element={<Conseillers />} />
          <Route path="/recrutement" element={<Recrutement />} />
          <Route path="/jobs" element={<ProfessionalJobsPage />} />
          <Route path="/orientation-services" element={<Tests />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/cv-optimizer" element={<CVOptimizer />} />
          <Route path="/cv-history" element={<CVHistory />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/guide-congo-2024" element={<GuideEtudesCongo2024 />} />
          <Route path="/book-appointment" element={<BookAppointment />} />
          <Route path="/recruitment" element={<RecruitmentPage />} />
          
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
          <Route path="/profile" element={
            <UserRoute>
              <Profile />
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

          {/* Routes recruteur protégées */}
          <Route path="/recruteur/dashboard" element={
            <RecruteurRoute>
              <RecruteurDashboard />
            </RecruteurRoute>
          } />

          {/* Routes coach protégées */}
          <Route path="/coach/dashboard" element={
            <CoachRoute>
              <CoachDashboard />
            </CoachRoute>
          } />

          {/* Routes RH protégées */}
          <Route path="/rh/dashboard" element={
            <RhRoute>
              <RhDashboard />
            </RhRoute>
          } />

          {/* Route SuperAdmin Dashboard (optionnelle) */}
          <Route path="/superadmin/dashboard" element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          } />
          
            {/* Redirection pour toutes les autres routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>
    </Router>
  );
};
