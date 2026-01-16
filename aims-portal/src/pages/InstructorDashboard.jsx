import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/common/Navbar';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import EnrollmentRequestsModal from '@/components/instructor/EnrollmentRequestsModal';
import { MIN_COURSE_CREDITS, MAX_COURSE_CREDITS } from '@/config/constants';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    credits: 3,
    max_students: 30,
    description: ''
  });

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = () => {
    const coursesData = JSON.parse(localStorage.getItem('courses') || '[]');
    const instructorCourses = coursesData.filter(c => c.instructor_id === user.id);
    setCourses(instructorCourses);
    setLoading(false);
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    const coursesData = JSON.parse(localStorage.getItem('courses') || '[]');
    const newCourse = {
      id: Date.now().toString(),
      ...formData,
      instructor_id: user.id,
      instructor_name: user.name,
      current_enrollment: 0,
      created_at: new Date().toISOString()
    };

    coursesData.push(newCourse);
    localStorage.setItem('courses', JSON.stringify(coursesData));

    toast({
      title: 'Course Created!',
      description: `${formData.name} has been created successfully`,
    });

    setFormData({
      name: '',
      code: '',
      credits: 3,
      max_students: 30,
      description: ''
    });
    setShowCreateForm(false);
    loadCourses();
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
        <title>Instructor Dashboard - Course Enrollment</title>
        <meta name="description" content="Manage your courses and enrollment requests" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Instructor Dashboard
            </h1>
            <p className="text-gray-600">Create and manage your courses</p>
          </motion.div>

          {/* Create Course Section */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-6 h-6 text-green-600" />
                Create New Course
              </h2>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {showCreateForm ? 'Hide Form' : 'Show Form'}
              </Button>
            </div>

            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <form onSubmit={handleCreateCourse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Introduction to Computer Science"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Code *
                      </label>
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="CS101"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credits ({MIN_COURSE_CREDITS}-{MAX_COURSE_CREDITS})
                      </label>
                      <input
                        type="number"
                        value={formData.credits}
                        onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                        min={MIN_COURSE_CREDITS}
                        max={MAX_COURSE_CREDITS}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Students
                      </label>
                      <input
                        type="number"
                        value={formData.max_students}
                        onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                        min={1}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the course..."
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  >
                    Create Course
                  </Button>
                </form>
              </motion.div>
            )}
          </section>

          {/* My Courses */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-green-600" />
              My Courses
            </h2>
            {courses.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No Courses Yet"
                description="Create your first course to get started"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
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
                        <p className="text-sm text-green-600 font-semibold">{course.code}</p>
                      </div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                        {course.credits} Credits
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{course.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                      <span>Max: {course.max_students}</span>
                      <span>Enrolled: {course.current_enrollment || 0}</span>
                    </div>
                    <Button
                      onClick={() => setSelectedCourse(course)}
                      variant="outline"
                      className="w-full border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      View Requests
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {selectedCourse && (
        <EnrollmentRequestsModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onUpdate={loadCourses}
        />
      )}
    </>
  );
};

export default InstructorDashboard;