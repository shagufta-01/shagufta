import React, { useState } from 'react';
import {
  Shield,
  Smartphone,
  KeyRound,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  PhoneCall,
  XCircle,
} from 'lucide-react';
import { CloudSyncService } from '../services/cloudSyncService';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onSuccess: (user: User) => void;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onSuccess, onClose }) => {
  const [step, setStep] = useState<'mobile' | 'otp'>('mobile');
  const [mobileNumber, setMobileNumber] = useState('+966 50 111 2233');
  const [otpCode, setOtpCode] = useState('');
  const [receivedOtp, setReceivedOtp] = useState<string | null>(null);
  const [showSmsBanner, setShowSmsBanner] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const res = CloudSyncService.requestLoginOTP(mobileNumber);
      setLoading(false);

      if (res.success) {
        setReceivedOtp(res.otp || '123456');
        setShowSmsBanner(true);
        setStep('otp');
      } else {
        setErrorMessage(res.message);
      }
    }, 450);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    setTimeout(() => {
      const res = CloudSyncService.verifyLoginOTP(mobileNumber, otpCode);
      setLoading(false);

      if (res.success && res.user) {
        onSuccess(res.user);
      } else {
        setErrorMessage(res.message || 'Verification failed. Please check the code.');
      }
    }, 400);
  };

  const quickSelectNumber = (num: string) => {
    setMobileNumber(num);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      {/* Simulated SMS Notification Banner */}
      {showSmsBanner && receivedOtp && (
        <div className="fixed top-6 max-w-md w-full mx-auto bg-slate-900 border border-amber-500/50 rounded-2xl p-4 shadow-2xl z-50 animate-bounce duration-1000">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">MADAR-AUTH SMS Gateway</span>
                <span className="text-[10px] text-slate-400">Just now</span>
              </div>
              <p className="text-slate-200 mt-1 font-mono text-sm tracking-wider">
                Your MADAR AL-TASIS security OTP code is:{' '}
                <span className="text-amber-400 font-bold text-base px-1.5 py-0.5 rounded bg-slate-800 border border-amber-500/40">
                  {receivedOtp}
                </span>
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">Valid for 5 minutes</span>
                <button
                  onClick={() => {
                    setOtpCode(receivedOtp);
                    setShowSmsBanner(false);
                  }}
                  className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors"
                >
                  Quick Fill OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center border-b border-slate-800 bg-gradient-to-b from-slate-800/60 to-slate-900">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center mx-auto text-white shadow-xl shadow-amber-900/30 text-2xl font-bold border border-amber-400/40 mb-3">
            م
          </div>
          <h2 className="text-xl font-bold text-white tracking-wide">MADAR AL-TASIS</h2>
          <p className="text-xs text-amber-400/90 font-['Tajawal'] mt-0.5">مؤسسة مدار التأسيس • تسجيل الدخول الآمن</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] text-slate-400 border border-slate-700">
            <Lock className="w-3 h-3 text-amber-400" />
            <span>Encrypted Cloud PostgreSQL • Supabase RBAC</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {step === 'mobile' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Verified Mobile Number (رقم الجوال المعتمد)
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+966 50 123 4567"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Notice: Staff accounts cannot self-register. Only numbers pre-authorized by the Owner receive access tokens.
                </p>
              </div>

              {/* Quick Demo Pre-fills */}
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Test Personas (Click to test):
                </div>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => quickSelectNumber('+966 50 111 2233')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between text-slate-200"
                  >
                    <span className="font-semibold text-amber-400">Owner: Hassan Al-Tamimi</span>
                    <span className="text-[10px] text-slate-400 font-mono">+966 50 111 2233</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSelectNumber('+966 54 888 4411')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between text-slate-200"
                  >
                    <span className="font-semibold text-cyan-400">Staff: Tariq (Senior Eng.)</span>
                    <span className="text-[10px] text-slate-400 font-mono">+966 54 888 4411</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSelectNumber('+966 56 333 1155')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-between text-slate-200"
                  >
                    <span className="font-semibold text-emerald-400">Staff: Faisal (Pending OTP)</span>
                    <span className="text-[10px] text-slate-400 font-mono">+966 56 333 1155</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    Dispatching OTP...
                  </span>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center pb-1">
                <div className="text-xs text-slate-400">Enter the 6-digit verification code sent to:</div>
                <div className="font-mono text-sm font-semibold text-amber-400 mt-0.5">{mobileNumber}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  6-Digit OTP Token (رمز التحقق)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-600 text-center tracking-[0.4em] font-mono text-lg focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('mobile');
                    setErrorMessage(null);
                  }}
                  className="text-slate-400 hover:text-slate-200 underline"
                >
                  Change Mobile Number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const res = CloudSyncService.requestLoginOTP(mobileNumber);
                    if (res.otp) {
                      setReceivedOtp(res.otp);
                      setShowSmsBanner(true);
                    }
                  }}
                  className="text-amber-400 hover:text-amber-300 font-medium"
                >
                  Resend OTP Code
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                    Authenticating Session...
                  </span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Grant Access</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
