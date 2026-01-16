import React from 'react';

// IMPORTANT: Supabase integration is not yet completed
// This file is a placeholder. To use Supabase:
// 1. Complete the Supabase integration steps in your Hostinger panel
// 2. Add your Supabase credentials to environment variables
// 3. Uncomment the code below and remove the mock implementation

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/

// Mock Supabase client for development with localStorage
export const supabase = {
  auth: {
    signInWithOtp: async ({ email }) => {
      // Mock OTP sending
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem('mock_otp', otp);
      localStorage.setItem('mock_otp_email', email);
      localStorage.setItem('mock_otp_expiry', Date.now() + 5 * 60 * 1000);
      console.log('Mock OTP generated:', otp); // For development
      return { data: { user: null }, error: null };
    },
    verifyOtp: async ({ email, token }) => {
      const storedOtp = localStorage.getItem('mock_otp');
      const storedEmail = localStorage.getItem('mock_otp_email');
      const expiry = parseInt(localStorage.getItem('mock_otp_expiry'));
      
      if (email !== storedEmail || token !== storedOtp || Date.now() > expiry) {
        return { data: { user: null }, error: { message: 'Invalid or expired OTP' } };
      }
      
      // Check if user exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === email);
      
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        return { data: { user }, error: null };
      }
      
      return { data: { user: { email, id: Date.now().toString() } }, error: null };
    },
    getUser: async () => {
      const user = JSON.parse(localStorage.getItem('current_user') || 'null');
      return { data: { user }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem('current_user');
      return { error: null };
    }
  },
  from: (table) => ({
    select: (columns = '*') => ({
      eq: (column, value) => ({
        single: async () => {
          const data = JSON.parse(localStorage.getItem(table) || '[]');
          const item = data.find(d => d[column] === value);
          return { data: item || null, error: null };
        },
        execute: async () => {
          const data = JSON.parse(localStorage.getItem(table) || '[]');
          const filtered = data.filter(d => d[column] === value);
          return { data: filtered, error: null };
        }
      }),
      execute: async () => {
        const data = JSON.parse(localStorage.getItem(table) || '[]');
        return { data, error: null };
      }
    }),
    insert: (records) => ({
      select: () => ({
        execute: async () => {
          const data = JSON.parse(localStorage.getItem(table) || '[]');
          const newRecords = Array.isArray(records) ? records : [records];
          const withIds = newRecords.map(r => ({ ...r, id: r.id || Date.now().toString() + Math.random() }));
          data.push(...withIds);
          localStorage.setItem(table, JSON.stringify(data));
          return { data: withIds, error: null };
        }
      })
    }),
    update: (updates) => ({
      eq: (column, value) => ({
        execute: async () => {
          const data = JSON.parse(localStorage.getItem(table) || '[]');
          const updated = data.map(d => d[column] === value ? { ...d, ...updates } : d);
          localStorage.setItem(table, JSON.stringify(updated));
          return { data: updated.filter(d => d[column] === value), error: null };
        }
      })
    }),
    delete: () => ({
      eq: (column, value) => ({
        execute: async () => {
          const data = JSON.parse(localStorage.getItem(table) || '[]');
          const filtered = data.filter(d => d[column] !== value);
          localStorage.setItem(table, JSON.stringify(filtered));
          return { error: null };
        }
      })
    })
  })
};