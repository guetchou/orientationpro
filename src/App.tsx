
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from "@/pages/Index";
import Tests from "@/pages/Tests";
import TestResults from "@/pages/TestResults";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentCancel from "@/pages/PaymentCancel";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import RiasecTest from "@/pages/RiasecTest";
import EmotionalTest from "@/pages/EmotionalTest";
import LearningStyleTest from "@/pages/LearningStyleTest";
import MultipleIntelligenceTest from "@/pages/MultipleIntelligenceTest";
import CareerTransitionTest from "@/pages/CareerTransitionTest";
import NoDiplomaCareerTest from "@/pages/NoDiplomaCareerTest";
import SeniorEmploymentTest from "@/pages/SeniorEmploymentTest";
import EntrepreneurialTest from "@/pages/EntrepreneurialTest";
import Establishments from "@/pages/Establishments";
import Resources from "@/pages/Resources";
import Conseillers from "@/pages/Conseillers";
import Contact from "@/pages/Contact";
import Impressum from "@/pages/Impressum";
import DataProtection from "@/pages/DataProtection";
import OrientationGuide from "@/pages/OrientationGuide";
import NotFound from "@/pages/NotFound";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import BlogAdmin from "@/pages/admin/BlogAdmin";
import Recrutement from "@/pages/Recrutement";
import ATSAdmin from "@/pages/admin/ATSAdmin";
import CandidateDetails from "@/pages/admin/CandidateDetails";
import SuperAdmin from "@/pages/admin/SuperAdmin";
import RequireAuth from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "sonner";
import Appointment from "@/pages/Appointment";
import About from "@/pages/About";
import OrientationServices from "@/pages/OrientationServices";
import { StandardQueryClientProvider, createStandardQueryClient } from "@/hooks/useQueryWrapper";

function App() {
  const queryClient = createStandardQueryClient();

  return (
    <StandardQueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tests" element={<Tests />} />
            <Route path="/test-results" element={<RequireAuth><TestResults /></RequireAuth>} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/conseillers" element={<Conseillers />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/recrutement" element={<Recrutement />} />
            <Route path="/appointment" element={<Appointment />} />
            <Route path="/about" element={<About />} />
            <Route path="/orientation-services" element={<OrientationServices />} />
            
            {/* Test Routes */}
            <Route path="/test-riasec" element={<RiasecTest />} />
            <Route path="/test-emotional" element={<EmotionalTest />} />
            <Route path="/test-learning" element={<LearningStyleTest />} />
            <Route path="/test-multiple" element={<MultipleIntelligenceTest />} />
            <Route path="/test-career-transition" element={<CareerTransitionTest />} />
            <Route path="/test-no-diploma" element={<NoDiplomaCareerTest />} />
            <Route path="/test-senior-employment" element={<SeniorEmploymentTest />} />
            <Route path="/test-entrepreneurial" element={<EntrepreneurialTest />} />
            
            {/* Admin Routes */}
            <Route path="/admin/blog" element={<RequireAuth><BlogAdmin /></RequireAuth>} />
            <Route path="/admin/ats" element={<RequireAuth><ATSAdmin /></RequireAuth>} />
            <Route path="/admin/candidate/:id" element={<RequireAuth><CandidateDetails /></RequireAuth>} />
            <Route path="/admin/super-admin" element={<RequireAuth><SuperAdmin /></RequireAuth>} />
            
            {/* Static Pages */}
            <Route path="/establishments" element={<Establishments />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/data-protection" element={<DataProtection />} />
            <Route path="/orientation-guide" element={<OrientationGuide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </StandardQueryClientProvider>
  );
}

export default App;
