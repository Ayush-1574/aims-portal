import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import AuthPage from '@/components/auth/AuthPage';
import StudentDashboard from '@/pages/StudentDashboard';
import InstructorDashboard from '@/pages/InstructorDashboard';
import FacultyDashboard from '@/pages/FacultyDashboard';
import { USER_ROLES } from '@/config/constants';

const LogoutHandler = () => {
  const { logout } = useAuth();
  
  React.useEffect(() => {
    logout();
  }, [logout]);

  return <Navigate to="/" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <AuthPage />} 
      />
      
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.STUDENT]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/instructor/dashboard"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.INSTRUCTOR]}>
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/faculty/dashboard"
        element={
          <ProtectedRoute allowedRoles={[USER_ROLES.FACULTY_ADVISOR]}>
            <FacultyDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route path="/logout" element={<LogoutHandler />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </Router>
  );
}

export default App;