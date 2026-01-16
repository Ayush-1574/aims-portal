import { supabase } from '@/lib/supabase';
import { ENROLLMENT_STATUS, MAX_CREDIT_LIMIT } from '@/config/constants';

export const fetchAvailableCourses = async (studentId) => {
  try {
    const { data: courses } = await supabase.from('courses').select('*').execute();
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .execute();

    const enrolledCourseIds = enrollments?.map(e => e.course_id) || [];
    const available = courses?.filter(c => !enrolledCourseIds.includes(c.id)) || [];

    return { success: true, courses: available };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { success: false, error: error.message };
  }
};

export const fetchStudentCredits = async (studentId) => {
  try {
    const { data } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('student_id', studentId)
      .eq('status', ENROLLMENT_STATUS.APPROVED)
      .execute();

    if (!data) return { success: true, totalCredits: 0 };

    const courseIds = data.map(e => e.course_id);
    const { data: courses } = await supabase
      .from('courses')
      .select('credits')
      .execute();

    const totalCredits = courses
      ?.filter(c => courseIds.includes(c.id))
      .reduce((sum, c) => sum + c.credits, 0) || 0;

    return { success: true, totalCredits };
  } catch (error) {
    console.error('Error fetching credits:', error);
    return { success: false, error: error.message };
  }
};

export const requestEnrollment = async (studentId, courseId, courseCredits) => {
  try {
    const creditsResult = await fetchStudentCredits(studentId);
    if (!creditsResult.success) throw new Error(creditsResult.error);

    if (creditsResult.totalCredits + courseCredits > MAX_CREDIT_LIMIT) {
      return { 
        success: false, 
        error: `Adding this course would exceed your credit limit of ${MAX_CREDIT_LIMIT}` 
      };
    }

    const { data, error } = await supabase
      .from('enrollments')
      .insert([{
        student_id: studentId,
        course_id: courseId,
        status: ENROLLMENT_STATUS.PENDING,
        requested_at: new Date().toISOString()
      }])
      .select()
      .execute();

    if (error) throw error;
    return { success: true, enrollment: data[0] };
  } catch (error) {
    console.error('Error requesting enrollment:', error);
    return { success: false, error: error.message };
  }
};

export const fetchPendingRequests = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', ENROLLMENT_STATUS.PENDING)
      .execute();

    if (error) throw error;
    return { success: true, requests: data || [] };
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return { success: false, error: error.message };
  }
};

export const fetchApprovedCourses = async (studentId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', studentId)
      .eq('status', ENROLLMENT_STATUS.APPROVED)
      .execute();

    if (error) throw error;
    return { success: true, courses: data || [] };
  } catch (error) {
    console.error('Error fetching approved courses:', error);
    return { success: false, error: error.message };
  }
};