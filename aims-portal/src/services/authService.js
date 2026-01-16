import { supabase } from '@/lib/supabase';

export const sendOTP = async (email) => {
  try {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return { success: false, error: error.message };
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    });
    if (error) throw error;
    return { success: true, user: data.user };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: error.message };
  }
};

export const registerUser = async (userData) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...userData,
        created_at: new Date().toISOString()
      }])
      .select()
      .execute();
    
    if (error) throw error;
    return { success: true, user: data[0] };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error: error.message };
  }
};

export const getUserByEmail = async (email) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return { success: true, user: data };
  } catch (error) {
    console.error('Error fetching user:', error);
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('current_user');
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    return { success: false, error: error.message };
  }
};