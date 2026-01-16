import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    const roleColors = {
      student: 'bg-blue-500',
      instructor: 'bg-green-500',
      faculty_advisor: 'bg-purple-500'
    };
    const roleLabels = {
      student: 'Student',
      instructor: 'Instructor',
      faculty_advisor: 'Faculty Advisor'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${roleColors[user?.role]}`}>
        {roleLabels[user?.role]}
      </span>
    );
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Course Enrollment
            </h1>
          </motion.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              {getRoleBadge()}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t py-4"
          >
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                <div className="mt-2">{getRoleBadge()}</div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;