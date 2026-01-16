import { supabase } from '@/lib/supabase';
import { ENROLLMENT_STATUS, MAX_CREDIT_LIMIT } from '@/config/constants';

export const fetchAllPendingRequests = async () => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('status', ENROLLMENT_STATUS.PENDING)
      .execute();

    if (error) throw error;
    return { success: true, requests: data || [] };
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    return { success: false, error: error.message };
  }
};

export const getStudentCredits = async (studentId) => {
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
    console.error('Error getting student credits:', error);
    return { success: false, error: error.message };
  }
};

export const approveFacultyEnrollment = async (enrollmentId, studentId, courseId, courseCredits) => {
  try {
    const creditsResult = await getStudentCredits(studentId);
    if (!creditsResult.success) throw new Error(creditsResult.error);

    if (creditsResult.totalCredits + courseCredits > MAX_CREDIT_LIMIT) {
      return { 
        success: false, 
        error: `Student would exceed credit limit of ${MAX_CREDIT_LIMIT}` 
      };
    }

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

export const rejectFacultyEnrollment = async (enrollmentId) => {
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