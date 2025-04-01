
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
import Establishments from "@/pages/Establishments";
import Contact from "@/pages/Contact";
import Impressum from "@/pages/Impressum";
import DataProtection from "@/pages/DataProtection";
import OrientationGuide from "@/pages/OrientationGuide";
import NotFound from "@/pages/NotFound";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import BlogAdmin from "@/pages/admin/BlogAdmin";
import RequireAuth from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
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
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Test Routes */}
          <Route path="/test-riasec" element={<RiasecTest />} />
          <Route path="/test-emotional" element={<EmotionalTest />} />
          <Route path="/test-learning" element={<LearningStyleTest />} />
          <Route path="/test-multiple" element={<MultipleIntelligenceTest />} />
          <Route path="/test-career-transition" element={<CareerTransitionTest />} />
          <Route path="/test-no-diploma" element={<NoDiplomaCareerTest />} />
          
          {/* Admin Routes */}
          <Route path="/admin/blog" element={<RequireAuth><BlogAdmin /></RequireAuth>} />
          
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
  );
}

export default App;
