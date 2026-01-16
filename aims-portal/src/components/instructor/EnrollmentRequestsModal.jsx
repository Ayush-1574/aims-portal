import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import EmptyState from '@/components/common/EmptyState';
import { MAX_CREDIT_LIMIT } from '@/config/constants';

const EnrollmentRequestsModal = ({ course, onClose, onUpdate }) => {
  const { toast } = useToast();
  const [requests, setRequests] = useState([]);
  const [students, setStudents] = useState({});

  useEffect(() => {
    loadRequests();
  }, [course]);

  const loadRequests = () => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');

    const courseRequests = enrollments.filter(
      e => e.course_id === course.id && e.status === 'pending'
    );

    // Get student info and calculate credits
    const studentsMap = {};
    users.forEach(user => {
      if (user.role === 'student') {
        const userEnrollments = enrollments.filter(
          e => e.student_id === user.id && e.status === 'approved'
        );
        const approvedCourseIds = userEnrollments.map(e => e.course_id);
        const approvedCourses = courses.filter(c => approvedCourseIds.includes(c.id));
        const totalCredits = approvedCourses.reduce((sum, c) => sum + c.credits, 0);
        
        studentsMap[user.id] = {
          ...user,
          currentCredits: totalCredits
        };
      }
    });

    setStudents(studentsMap);
    setRequests(courseRequests);
  };

  const handleApprove = (request) => {
    const student = students[request.student_id];
    if (!student) return;

    if (student.currentCredits + course.credits > MAX_CREDIT_LIMIT) {
      toast({
        title: 'Cannot Approve',
        description: `Student would exceed ${MAX_CREDIT_LIMIT} credit limit`,
        variant: 'destructive'
      });
      return;
    }

    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const updated = enrollments.map(e =>
      e.id === request.id
        ? { ...e, status: 'approved', approved_at: new Date().toISOString() }
        : e
    );
    localStorage.setItem('enrollments', JSON.stringify(updated));

    // Update course enrollment count
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');
    const updatedCourses = courses.map(c =>
      c.id === course.id
        ? { ...c, current_enrollment: (c.current_enrollment || 0) + 1 }
        : c
    );
    localStorage.setItem('courses', JSON.stringify(updatedCourses));

    toast({
      title: 'Request Approved!',
      description: `Enrollment approved for ${student.name}`,
    });

    loadRequests();
    onUpdate();
  };

  const handleReject = (request) => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const updated = enrollments.map(e =>
      e.id === request.id
        ? { ...e, status: 'rejected', rejected_at: new Date().toISOString() }
        : e
    );
    localStorage.setItem('enrollments', JSON.stringify(updated));

    const student = students[request.student_id];
    toast({
      title: 'Request Rejected',
      description: `Enrollment rejected for ${student?.name || 'student'}`,
    });

    loadRequests();
    onUpdate();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">{course.name}</h2>
                <p className="text-green-100">{course.code} - Enrollment Requests</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
            {requests.length === 0 ? (
              <EmptyState
                icon={User}
                title="No Pending Requests"
                description="There are no enrollment requests for this course"
              />
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  const student = students[request.student_id];
                  if (!student) return null;

                  const wouldExceedLimit = student.currentCredits + course.credits > MAX_CREDIT_LIMIT;

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">
                            {student.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{student.email}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600">
                              Current Credits: {student.currentCredits}/{MAX_CREDIT_LIMIT}
                            </span>
                            {wouldExceedLimit && (
                              <span className="text-red-500 font-medium">
                                ⚠️ Would exceed limit
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Requested: {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Button
                            onClick={() => handleApprove(request)}
                            disabled={wouldExceedLimit}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleReject(request)}
                            variant="outline"
                            className="border-red-600 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnrollmentRequestsModal;