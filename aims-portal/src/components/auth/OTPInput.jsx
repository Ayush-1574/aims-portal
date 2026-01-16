import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { verifyOTP, sendOTP } from '@/services/authService';

const OTPInput = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef([]);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      toast({
        title: 'Invalid OTP',
        description: 'Please enter all 6 digits',
        variant: 'destructive'
      });
      return;
    }

    if (timeLeft === 0) {
      toast({
        title: 'OTP Expired',
        description: 'Please request a new OTP',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const result = await verifyOTP(email, otpCode);
    setLoading(false);

    if (result.success) {
      onVerified(result.user);
    } else {
      toast({
        title: 'Verification Failed',
        description: result.error || 'Invalid OTP',
        variant: 'destructive'
      });
    }
  };

  const handleResend = async () => {
    setLoading(true);
    const result = await sendOTP(email);
    setLoading(false);

    if (result.success) {
      setTimeLeft(300);
      setOtp(['', '', '', '', '', '']);
      toast({
        title: 'OTP Resent!',
        description: 'A new verification code has been sent',
      });
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-md"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
          <p className="text-gray-600">
            Enter the 6-digit code sent to<br />
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition-all text-gray-900"
              />
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">
              Time remaining: <span className="font-semibold text-purple-600">{formatTime(timeLeft)}</span>
            </p>
            <button
              type="button"
              onClick={handleResend}
              disabled={timeLeft > 240}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Resend Code
            </button>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default OTPInput;