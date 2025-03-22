import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
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
import Establishments from "@/pages/Establishments";
import Contact from "@/pages/Contact";
import Impressum from "@/pages/Impressum";
import DataProtection from "@/pages/DataProtection";
import OrientationGuide from "@/pages/OrientationGuide";
import NotFound from "@/pages/NotFound";
import RequireAuth from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/hooks/useAuth";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/tests",
    element: <Tests />
  },
  {
    path: "/test-results",
    element: <RequireAuth><TestResults /></RequireAuth>
  },
  {
    path: "/payment/success",
    element: <PaymentSuccess />
  },
  {
    path: "/payment/cancel",
    element: <PaymentCancel />
  },
  {
    path: "/profile",
    element:  <RequireAuth><Profile /></RequireAuth>
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: "/dashboard",
    element:  <RequireAuth><Dashboard /></RequireAuth>
  },
  {
    path: "/riasec-test",
    element:  <RequireAuth><RiasecTest /></RequireAuth>
  },
  {
    path: "/establishments",
    element: <Establishments />
  },
  {
    path: "/contact",
    element: <Contact />
  },
  {
    path: "/impressum",
    element: <Impressum />
  },
  {
    path: "/data-protection",
    element: <DataProtection />
  },
  {
    path: "/orientation-guide",
    element: <OrientationGuide />
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
