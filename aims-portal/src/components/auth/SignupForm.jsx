import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { registerUser } from '@/services/authService';

const SignupForm = ({ email, role, onSignupComplete, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const result = await registerUser({
      email,
      name: formData.name,
      phone: formData.phone,
      role
    });
    setLoading(false);

    if (result.success) {
      toast({
        title: 'Account Created!',
        description: 'Welcome to Course Enrollment System',
      });
      onSignupComplete(result.user);
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to create account',
        variant: 'destructive'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600">Tell us a bit more about yourself</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 234 567 8900"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-gray-900"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default SignupForm;