import { supabase } from '@/lib/supabase';
import { ENROLLMENT_STATUS } from '@/config/constants';

export const createCourse = async (courseData, instructorId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert([{
        ...courseData,
        instructor_id: instructorId,
        created_at: new Date().toISOString(),
        current_enrollment: 0
      }])
      .select()
      .execute();

    if (error) throw error;
    return { success: true, course: data[0] };
  } catch (error) {
    console.error('Error creating course:', error);
    return { success: false, error: error.message };
  }
};

export const fetchInstructorCourses = async (instructorId) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('instructor_id', instructorId)
      .execute();

    if (error) throw error;
    return { success: true, courses: data || [] };
  } catch (error) {
    console.error('Error fetching courses:', error);
    return { success: false, error: error.message };
  }
};

export const fetchEnrollmentRequests = async (courseId) => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .eq('status', ENROLLMENT_STATUS.PENDING)
      .execute();

    if (error) throw error;
    return { success: true, requests: data || [] };
  } catch (error) {
    console.error('Error fetching enrollment requests:', error);
    return { success: false, error: error.message };
  }
};

export const approveEnrollment = async (enrollmentId, courseId) => {
  try {
    const { error: updateError } = await supabase
      .from('enrollments')
      .update({ 
        status: ENROLLMENT_STATUS.APPROVED,
        approved_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .execute();

    if (updateError) throw updateError;

    // Update course enrollment count
    const { data: course } = await supabase
      .from('courses')
      .select('current_enrollment')
      .eq('id', courseId)
      .single();

    await supabase
      .from('courses')
      .update({ current_enrollment: (course?.current_enrollment || 0) + 1 })
      .eq('id', courseId)
      .execute();

    return { success: true };
  } catch (error) {
    console.error('Error approving enrollment:', error);
    return { success: false, error: error.message };
  }
};

export const rejectEnrollment = async (enrollmentId) => {
  try {
    const { error } = await supabase
      .from('enrollments')
      .update({ 
        status: ENROLLMENT_STATUS.REJECTED,
        rejected_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .execute();

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error rejecting enrollment:', error);
    return { success: false, error: error.message };
  }
};