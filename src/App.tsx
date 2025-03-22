
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';
import UpdatePassword from './pages/UpdatePassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import CMS from './pages/admin/CMS';
import { UserManagement } from './components/admin/UserManagement';
import SuperAdmin from './pages/admin/SuperAdmin';
import UserCredentials from "./pages/admin/UserCredentials";
import { AuthProvider } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster />
        <div>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
            
            {/* Routes administrateurs */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/cms" element={<CMS />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            <Route path="/admin/super-admin" element={<SuperAdmin />} />
            <Route path="/admin/user-credentials" element={<UserCredentials />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
