import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DEMO_EMAIL } from '../data/mockSeed';
import { Zap, ArrowRight, ShieldCheck, Mail, Lock, User, AtSign, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { PrimeProfileLogo } from './PrimeProfileLogo';

interface AuthModalProps {
  initialMode: 'login' | 'signup' | 'forgot';
  onNavigate: (route: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onNavigate }) => {
  const { login, signup, resetPassword, loginWithDemo, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  
  // State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fillDemoCreds = () => {
    setEmail(DEMO_EMAIL);
    setPassword('Demo@123');
    setError(null);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      onNavigate('dashboard');
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled: The Google popup was closed before completing.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Popup blocked: Please allow popups in your browser to sign in with Google.');
      } else if (err?.code === 'auth/cancelled-popup-request') {
        setError('Google sign-in was cancelled.');
      } else {
        setError(err?.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        onNavigate('dashboard');
      } else if (mode === 'signup') {
        if (!username) {
          setError('Please provide a unique creator username.');
          setLoading(false);
          return;
        }
        await signup(email.trim(), password, username.trim(), name.trim());
        onNavigate('dashboard');
      } else if (mode === 'forgot') {
        await resetPassword(email.trim());
        setSuccessMessage('Password reset link sent to your email.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithDemo();
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err?.message || 'Failed to login with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] relative overflow-hidden flex flex-col justify-center py-10 sm:py-14 px-4 sm:px-6 lg:px-8 selection:bg-indigo-500 selection:text-white">
      {/* Ambient background curves matching Image 1 */}
      <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-100/50 via-purple-50/30 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-200/40 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        {/* Top Centered Logo (Vertical Stack matching Image 1) */}
        <div
          onClick={() => onNavigate('landing')}
          className="inline-flex justify-center mb-6 cursor-pointer hover:opacity-90 transition"
        >
          <PrimeProfileLogo variant="light" size="xl" layout="vertical" />
        </div>

        {/* Heading & Subtitle matching Image 1 */}
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Login / Sign Up'}
        </h2>
        <p className="mt-2.5 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
          Access your profile, opportunities and personalized recommendations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 shadow-xl shadow-indigo-100/50 rounded-3xl sm:px-8 border border-slate-100">
          {/* Quick Demo Login Banner */}
          <div className="mb-5 p-3.5 bg-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Preconfigured Demo Account
              </div>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                demo@primeprofile.com • Demo@123
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleInstantDemoLogin}
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-xs cursor-pointer whitespace-nowrap"
              >
                1-Click Demo
              </button>
              <button
                type="button"
                onClick={fillDemoCreds}
                className="text-[10px] text-indigo-600 hover:underline font-semibold cursor-pointer px-1"
              >
                Auto-fill
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <div className="relative">
                    <User className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name / Brand Name"
                      className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <AtSign className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                      placeholder="Claim Username (e.g. rohanstyle)"
                      className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none font-mono transition"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Address with Envelope Icon */}
            <div>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition text-slate-900"
                />
              </div>
            </div>

            {/* Password with Lock Icon & Eye toggle */}
            {mode !== 'forgot' && (
              <div>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-11 pr-11 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {mode === 'login' && (
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Primary Action Button (Purple Gradient matching Image 1) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 px-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 active:scale-[0.99]"
            >
              {loading ? (
                <span>Processing...</span>
              ) : (
                <>
                  <span>
                    {mode === 'login' && 'Login / Sign Up'}
                    {mode === 'signup' && 'Create Account'}
                    {mode === 'forgot' && 'Send Reset Link'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* OR Divider matching Image 1 */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
              OR
            </span>
            <div className="border-t border-slate-200 w-full" />
          </div>

          {/* Continue with Google Button matching Image 1 */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm border border-slate-200 hover:border-slate-300 rounded-2xl shadow-2xs transition flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60 active:scale-[0.99]"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Bottom Switcher matching Image 1 */}
          <div className="mt-8 text-center text-xs text-slate-600">
            {mode === 'login' ? (
              <p>
                New to PrimeProfile?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-[#6366F1] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Create an account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-[#6366F1] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Sign in</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </p>
            )}

            <p className="mt-4">
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer transition text-[11px]"
              >
                ← Back to PrimeProfile Home
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
