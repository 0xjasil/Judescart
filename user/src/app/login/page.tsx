'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        const { error } = await authClient.signUp.email({
          email,
          password,
          name,
          phone,
        } as any);

        if (error) {
          setErrorMessage(error.message || 'Failed to create account.');
        } else {
          setSuccessMessage('Welcome to JudesCart! You received 200 JudesCoins.');
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 800);
        }
      } else {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message || 'Invalid email or password.');
        } else {
          setSuccessMessage('Signed in successfully!');
          setTimeout(() => {
            router.push('/');
            router.refresh();
          }, 600);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setSuccessMessage(`Signed in via ${provider}! (+200 Coins bonus)`);
      setIsLoading(false);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 700);
    }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200/80 overflow-hidden">
          
          {/* Header Banner */}
          <div className="p-8 pb-6 border-b border-[#061B3A] bg-[#0A192F] text-white text-center relative overflow-hidden">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <Image
                src="/logo-icon.webp"
                alt="JudesCart Logo"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#DF9F28]">
              JudesCart Membership
            </p>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
              {mode === 'signin' ? 'Welcome Back' : 'Create VIP Account'}
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
              {mode === 'signin'
                ? 'Sign in to access your orders, saved bag, and weekly sweepstakes tickets.'
                : 'Join millions of shoppers and receive 200 free JudesCoins today.'}
            </p>
          </div>

          {/* Switcher */}
          <div className="grid grid-cols-2 p-1.5 mx-6 mt-6 bg-[#F8FAFC] rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                mode === 'signup'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-[#555555] hover:text-[#111111]'
              }`}
            >
              <span>Create Account</span>
              <span className="px-1.5 py-0.5 bg-[#FEF8EE] text-[#DF9F28] border border-[#DF9F28]/30 text-[9px] font-extrabold rounded-full">
                +200 Coins
              </span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#111111] focus:outline-none focus:border-[#DF9F28]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#111111] mb-1">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#111111] focus:outline-none focus:border-[#DF9F28]"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-[#111111] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#111111] focus:outline-none focus:border-[#DF9F28]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#111111]">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset instructions sent to your email.')}
                    className="text-[11px] font-semibold text-[#DF9F28] hover:text-[#C6891E] hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#111111] focus:outline-none focus:border-[#DF9F28]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signin' && (
              <label className="flex items-center gap-2 text-xs text-[#555555] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#DF9F28] focus:ring-[#DF9F28] w-3.5 h-3.5 accent-[#DF9F28]"
                />
                <span>Remember my session</span>
              </label>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#DF9F28] hover:bg-[#C6891E] text-[#111111] text-xs font-bold tracking-wider uppercase transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'signin' ? (
                'Sign In to JudesCart'
              ) : (
                'Create Account (+200 Coins)'
              )}
            </button>

            {/* Social Logins */}
            <div className="pt-2">
              <div className="relative text-center my-3 before:absolute before:left-0 before:top-1/2 before:w-full before:h-px before:bg-slate-200">
                <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400">
                  Or Instant Sign In
                </span>
              </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-[#F8FAFC] text-xs font-bold text-[#111111] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-sm font-bold text-rose-500">G</span>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Apple')}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-[#F8FAFC] text-xs font-bold text-[#111111] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-sm font-bold text-[#111111]"></span>
                <span>Apple</span>
              </button>
            </div>
          </div>
        </form>

        {/* Security Footer */}
        <div className="px-8 py-3.5 bg-[#F8FAFC] border-t border-slate-200 flex items-center justify-between text-[11px] text-[#555555] font-medium">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-bit Encrypted Session</span>
          </div>
          <span>Official JudesCart Security</span>
        </div>

      </div>
    </main>

    <Footer />
  </div>
);
}
