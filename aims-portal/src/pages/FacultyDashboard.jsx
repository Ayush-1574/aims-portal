import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ClipboardCheck, CheckCircle, XCircle, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { MAX_CREDIT_LIMIT } from '@/config/constants';

const FacultyDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const courses = JSON.parse(localStorage.getItem('courses') || '[]');

    const pendingRequests = enrollments
      .filter(e => e.status === 'pending')
      .map(enrollment => {
        const student = users.find(u => u.id === enrollment.student_id);
        const course = courses.find(c => c.id === enrollment.course_id);

        // Calculate student's current credits
        const studentEnrollments = enrollments.filter(
          e => e.student_id === enrollment.student_id && e.status === 'approved'
        );
        const approvedCourseIds = studentEnrollments.map(e => e.course_id);
        const approvedCourses = courses.filter(c => approvedCourseIds.includes(c.id));
        const currentCredits = approvedCourses.reduce((sum, c) => sum + c.credits, 0);

        return {
          ...enrollment,
          student,
          course,
          currentCredits
        };
      })
      .filter(r => r.student && r.course);

    setRequests(pendingRequests);
    setLoading(false);
  };

  const handleApprove = (request) => {
    if (request.currentCredits + request.course.credits > MAX_CREDIT_LIMIT) {
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
      c.id === request.course.id
        ? { ...c, current_enrollment: (c.current_enrollment || 0) + 1 }
        : c
    );
    localStorage.setItem('courses', JSON.stringify(updatedCourses));

    toast({
      title: 'Request Approved!',
      description: `Enrollment approved for ${request.student.name}`,
    });

    loadRequests();
  };

  const handleReject = (request) => {
    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const updated = enrollments.map(e =>
      e.id === request.id
        ? { ...e, status: 'rejected', rejected_at: new Date().toISOString() }
        : e
    );
    localStorage.setItem('enrollments', JSON.stringify(updated));

    toast({
      title: 'Request Rejected',
      description: `Enrollment rejected for ${request.student.name}`,
    });

    loadRequests();
  };

  const filteredRequests = requests.filter(r =>
    r.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.course.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Faculty Advisor Dashboard - Course Enrollment</title>
        <meta name="description" content="Review and approve student enrollment requests" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Faculty Advisor Dashboard
            </h1>
            <p className="text-gray-600">Review and manage student enrollment requests</p>
          </motion.div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by student name or course..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Pending Requests */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-purple-600" />
              Pending Enrollment Requests ({filteredRequests.length})
            </h2>

            {filteredRequests.length === 0 ? (
              <EmptyState
                icon={ClipboardCheck}
                title={searchTerm ? "No Matching Requests" : "No Pending Requests"}
                description={
                  searchTerm
                    ? "Try adjusting your search criteria"
                    : "All enrollment requests have been processed"
                }
              />
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request, index) => {
                  const wouldExceedLimit = request.currentCredits + request.course.credits > MAX_CREDIT_LIMIT;

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg mb-1">
                                {request.student.name}
                              </h3>
                              <p className="text-sm text-gray-600">{request.student.email}</p>
                            </div>
                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                              {request.course.credits} Credits
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Course:</span>
                              <p className="font-semibold text-gray-900">
                                {request.course.name} ({request.course.code})
                              </p>
                            </div>
                            <div>
                              <span className="text-gray-500">Current Credits:</span>
                              <p className={`font-semibold ${wouldExceedLimit ? 'text-red-600' : 'text-gray-900'}`}>
                                {request.currentCredits}/{MAX_CREDIT_LIMIT}
                                {wouldExceedLimit && ' ⚠️ Would exceed limit'}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-gray-500 mt-3">
                            Requested: {new Date(request.requested_at).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-3">
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
          </section>
        </div>
      </div>
    </>
  );
};

export default FacultyDashboard;