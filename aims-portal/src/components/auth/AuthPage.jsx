import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import EmailInput from './EmailInput';
import OTPInput from './OTPInput';
import RoleSelector from './RoleSelector';
import SignupForm from './SignupForm';
import { getUserByEmail } from '@/services/authService';
import { ROUTES, USER_ROLES } from '@/config/constants';

const AuthPage = () => {
  const [step, setStep] = useState('email'); // email, otp, role, signup
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(null);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailSubmit = (submittedEmail) => {
    setEmail(submittedEmail);
    setStep('otp');
  };

  const handleOTPVerified = async (user) => {
    setVerifiedUser(user);
    const result = await getUserByEmail(email);
    
    if (result.user) {
      // Existing user - log them in
      login(result.user);
      redirectToDashboard(result.user.role);
    } else {
      // New user - show role selection
      setStep('role');
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep('signup');
  };

  const handleSignupComplete = (user) => {
    login(user);
    redirectToDashboard(user.role);
  };

  const redirectToDashboard = (userRole) => {
    switch (userRole) {
      case USER_ROLES.STUDENT:
        navigate(ROUTES.STUDENT_DASHBOARD);
        break;
      case USER_ROLES.INSTRUCTOR:
        navigate(ROUTES.INSTRUCTOR_DASHBOARD);
        break;
      case USER_ROLES.FACULTY_ADVISOR:
        navigate(ROUTES.FACULTY_DASHBOARD);
        break;
      default:
        navigate(ROUTES.HOME);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Course Enrollment System</title>
        <meta name="description" content="Login to access your course enrollment dashboard" />
      </Helmet>
      
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1677730277400-097e5da58a56)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 w-full flex items-center justify-center"
        >
          {step === 'email' && <EmailInput onEmailSubmit={handleEmailSubmit} />}
          {step === 'otp' && (
            <OTPInput
              email={email}
              onVerified={handleOTPVerified}
              onBack={() => setStep('email')}
            />
          )}
          {step === 'role' && (
            <RoleSelector onRoleSelect={handleRoleSelect} />
          )}
          {step === 'signup' && (
            <SignupForm
              email={email}
              role={role}
              onSignupComplete={handleSignupComplete}
              onBack={() => setStep('role')}
            />
          )}
        </motion.div>
      </div>
    </>
  );
};

export default AuthPage;