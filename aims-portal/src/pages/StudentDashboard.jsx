import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  fetchAvailableCourses,
  fetchStudentCredits,
  requestEnrollment,
  fetchPendingRequests,
  fetchApprovedCourses
} from '@/services/studentService';
import { MAX_CREDIT_LIMIT } from '@/config/constants';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedCourses, setApprovedCourses] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load all courses
    const coursesData = JSON.parse(localStorage.getItem('courses') || '[]');
    setCourses(coursesData);

    // Load enrollments
    const enrollmentsData = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const userEnrollments = enrollmentsData.filter(e => e.student_id === user.id);

    // Calculate available courses
    const enrolledIds = userEnrollments.map(e => e.course_id);
    const available = coursesData.filter(c => !enrolledIds.includes(c.id));
    setAvailableCourses(available);

    // Calculate pending and approved
    const pending = userEnrollments.filter(e => e.status === 'pending');
    const approved = userEnrollments.filter(e => e.status === 'approved');
    
    setPendingRequests(pending);
    setApprovedCourses(approved);

    // Calculate total credits
    const approvedCourseIds = approved.map(e => e.course_id);
    const approvedCourseObjects = coursesData.filter(c => approvedCourseIds.includes(c.id));
    const credits = approvedCourseObjects.reduce((sum, c) => sum + c.credits, 0);
    setTotalCredits(credits);

    setLoading(false);
  };

  const handleRequestEnrollment = async (course) => {
    if (totalCredits + course.credits > MAX_CREDIT_LIMIT) {
      toast({
        title: 'Credit Limit Exceeded',
        description: `Adding this course would exceed your ${MAX_CREDIT_LIMIT} credit limit`,
        variant: 'destructive'
      });
      return;
    }

    const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    const newEnrollment = {
      id: Date.now().toString(),
      student_id: user.id,
      course_id: course.id,
      status: 'pending',
      requested_at: new Date().toISOString()
    };

    enrollments.push(newEnrollment);
    localStorage.setItem('enrollments', JSON.stringify(enrollments));

    toast({
      title: 'Request Submitted!',
      description: `Your enrollment request for ${course.name} has been submitted`,
    });

    loadData();
  };

  const getCourseById = (courseId) => {
    return courses.find(c => c.id === courseId);
  };

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
        <title>Student Dashboard - Course Enrollment</title>
        <meta name="description" content="Browse and request course enrollments" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-gray-600">Browse courses and manage your enrollments</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Credit Usage</p>
                <div className="flex items-center gap-2">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {totalCredits}/{MAX_CREDIT_LIMIT}
                  </div>
                  {totalCredits >= MAX_CREDIT_LIMIT && (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Available Courses */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-600" />
              Available Courses
            </h2>
            {availableCourses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No Available Courses"
                description="All courses have been requested or you've reached enrollment capacity"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{course.name}</h3>
                        <p className="text-sm text-purple-600 font-semibold">{course.code}</p>
                      </div>
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                        {course.credits} Credits
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>Max: {course.max_students}</span>
                      <span>Enrolled: {course.current_enrollment || 0}</span>
                    </div>
                    {totalCredits + course.credits > MAX_CREDIT_LIMIT && (
                      <p className="text-red-500 text-xs mb-2">
                        ⚠️ Would exceed credit limit
                      </p>
                    )}
                    <Button
                      onClick={() => handleRequestEnrollment(course)}
                      disabled={totalCredits + course.credits > MAX_CREDIT_LIMIT}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Request Enrollment
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          {/* Pending Requests */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-6 h-6 text-yellow-600" />
              Pending Requests
            </h2>
            {pendingRequests.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="No Pending Requests"
                description="You don't have any pending enrollment requests"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingRequests.map((request, index) => {
                  const course = getCourseById(request.course_id);
                  if (!course) return null;
                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500"
                    >
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{course.name}</h3>
                      <p className="text-sm text-purple-600 font-semibold mb-2">{course.code}</p>
                      <p className="text-sm text-gray-600 mb-2">{course.credits} Credits</p>
                      <p className="text-xs text-gray-500">
                        Requested: {new Date(request.requested_at).toLocaleDateString()}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Approved Courses */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Approved Courses
            </h2>
            {approvedCourses.length === 0 ? (
              <EmptyState
                icon={CheckCircle}
                title="No Approved Courses"
                description="You don't have any approved enrollments yet"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedCourses.map((enrollment, index) => {
                  const course = getCourseById(enrollment.course_id);
                  if (!course) return null;
                  return (
                    <motion.div
                      key={enrollment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500"
                    >
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{course.name}</h3>
                      <p className="text-sm text-purple-600 font-semibold mb-2">{course.code}</p>
                      <p className="text-sm text-gray-600 mb-2">{course.credits} Credits</p>
                      <p className="text-xs text-gray-500">
                        Approved: {new Date(enrollment.approved_at || enrollment.requested_at).toLocaleDateString()}
                      </p>
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

export default StudentDashboard;