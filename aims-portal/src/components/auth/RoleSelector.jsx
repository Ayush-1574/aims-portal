import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Users, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { USER_ROLES } from '@/config/constants';

const RoleSelector = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: USER_ROLES.STUDENT,
      label: 'Student',
      icon: GraduationCap,
      description: 'Browse courses and request enrollment',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: USER_ROLES.INSTRUCTOR,
      label: 'Instructor',
      icon: Users,
      description: 'Create courses and manage enrollments',
      color: 'from-green-500 to-green-600'
    },
    {
      id: USER_ROLES.FACULTY_ADVISOR,
      label: 'Faculty Advisor',
      icon: UserCheck,
      description: 'Review and approve enrollment requests',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Role</h2>
          <p className="text-gray-600">Choose how you want to use the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedRole === role.id
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{role.label}</h3>
                <p className="text-xs text-gray-600">{role.description}</p>
              </motion.button>
            );
          })}
        </div>

        <Button
          onClick={() => onRoleSelect(selectedRole)}
          disabled={!selectedRole}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};

export default RoleSelector;