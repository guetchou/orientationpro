import { CommandPalette } from '@/components/search/CommandPalette';
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { CookieConsentBanner } from '@/components/privacy/CookieConsentBanner';
import { RouteTracker } from '@/components/analytics/RouteTracker';
import {
  AdminRoute,
  CoachRoute,
  ConseillerRoute,
  RecruteurRoute,
  RhRoute,
  SuperAdminRoute,
  UserRoute,
} from '@/components/auth/AuthGuard';

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

/** Ramène en haut de page à chaque navigation, sauf navigation par ancre. */
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
};

const Index = lazy(() => import('@/pages/Index'));
const About = lazy(() => import('@/pages/About'));
const LegalNotice = lazy(() => import('@/pages/LegalNotice'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));
const Cookies = lazy(() => import('@/pages/Cookies'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const VerifyEmail = lazy(() => import('@/pages/VerifyEmail'));
const Tests = lazy(() => import('@/pages/Tests'));
const RiasecTest = lazy(() => import('@/pages/RiasecTest'));
const RiasecResult = lazy(() => import('@/pages/RiasecResult'));
const RiasecResults = lazy(() => import('@/pages/RiasecResults'));
const CareerMatches = lazy(() => import('@/pages/CareerMatches'));
const CareerCatalog = lazy(() => import('@/pages/CareerCatalog'));
const OccupationDetail = lazy(() => import('@/pages/OccupationDetail'));
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
const PostBac = lazy(() => import('@/pages/PostBac'));
const Unauthorized = lazy(() => import('@/pages/Unauthorized'));
const GuideEtudesCongo2024 = lazy(() => import('@/pages/GuideEtudesCongo2024'));
const BookAppointment = lazy(() => import('@/pages/BookAppointment'));
const RecruitmentPage = lazy(() => import('@/pages/RecruitmentPage'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const TestResults = lazy(() => import('@/pages/TestResults'));
const Profile = lazy(() => import('@/pages/Profile'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const SuperAdmin = lazy(() => import('@/pages/admin/SuperAdmin'));
const ATSAdmin = lazy(() => import('@/pages/admin/ATSAdmin'));
const BlogAdmin = lazy(() => import('@/pages/admin/BlogAdmin'));
const MediaManager = lazy(() => import('@/pages/admin/MediaManager'));
const ConseillerDashboard = lazy(() => import('@/pages/conseiller/Dashboard'));
const RecruteurDashboard = lazy(() => import('@/pages/recruteur/Dashboard'));
const CoachDashboard = lazy(() => import('@/pages/coach/Dashboard'));
const RhDashboard = lazy(() => import('@/pages/rh/Dashboard'));
const SuperAdminDashboard = lazy(() => import('@/pages/superadmin/Dashboard'));

export const AppRouter = () => (
  <Router>
    <div className="flex min-h-screen flex-col bg-background">
      <RouteTracker />
      <ScrollToTop />

      <a
        href="#contenu-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Aller au contenu principal
      </a>

      <Header />
      <CommandPalette />

      <main id="contenu-principal" className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/legal" element={<LegalNotice />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/post-bac" element={<PostBac />} />
            <Route path="/tests/riasec" element={<UserRoute><RiasecTest /></UserRoute>} />
            <Route path="/orientation/results" element={<UserRoute><RiasecResults /></UserRoute>} />
            <Route path="/orientation/results/:resultId" element={<UserRoute><RiasecResult /></UserRoute>} />
            <Route path="/orientation/results/:resultId/careers" element={<UserRoute><CareerMatches /></UserRoute>} />
            <Route path="/careers" element={<UserRoute><CareerCatalog /></UserRoute>} />
            <Route path="/careers/:occupationId" element={<UserRoute><OccupationDetail /></UserRoute>} />
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
            <Route path="/cv-optimizer" element={<UserRoute><CVOptimizer /></UserRoute>} />
            <Route path="/cv-history" element={<UserRoute><CVHistory /></UserRoute>} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/guide-congo-2024" element={<GuideEtudesCongo2024 />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/recruitment" element={<RecruitmentPage />} />

            <Route path="/dashboard" element={<UserRoute><Dashboard /></UserRoute>} />
            <Route path="/test-results" element={<UserRoute><TestResults /></UserRoute>} />
            <Route path="/profile" element={<UserRoute><Profile /></UserRoute>} />

            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/super-admin" element={<SuperAdminRoute><SuperAdmin /></SuperAdminRoute>} />
            <Route path="/admin/ats" element={<AdminRoute><ATSAdmin /></AdminRoute>} />
            <Route path="/admin/blog" element={<AdminRoute><BlogAdmin /></AdminRoute>} />
            <Route path="/admin/media" element={<AdminRoute><MediaManager /></AdminRoute>} />
            <Route path="/conseiller/dashboard" element={<ConseillerRoute><ConseillerDashboard /></ConseillerRoute>} />
            <Route path="/recruteur/dashboard" element={<RecruteurRoute><RecruteurDashboard /></RecruteurRoute>} />
            <Route path="/coach/dashboard" element={<CoachRoute><CoachDashboard /></CoachRoute>} />
            <Route path="/rh/dashboard" element={<RhRoute><RhDashboard /></RhRoute>} />
            <Route path="/superadmin/dashboard" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />

            {/* Page inconnue : on l'annonce au lieu de rediriger silencieusement vers l'accueil. */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <CookieConsentBanner />
    </div>
  </Router>
);
