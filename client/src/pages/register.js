import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import PlatformLogo from '../components/PlatformLogo';
import { Sparkles, Lock, Mail, User, Shield, ArrowRight, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('operator');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!name || !email || !password) {
      setLocalError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    const res = await register({ name, email, password, role });
    if (res.success) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Top Floating Controls: Back to Hub */}
      <div className="absolute top-6 left-6 z-20">
        <NextLink
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-bold font-mono transition shadow-lg group"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Hub</span>
        </NextLink>
      </div>

      {/* Glow Orbs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl -z-10" />

      {/* Header Logo */}
      <div className="mb-8 text-center space-y-2 flex flex-col items-center">
        <NextLink href="/" className="inline-flex items-center gap-3 group transition-transform hover:scale-105">
          <PlatformLogo size="lg" textClass="text-2xl font-black" />
        </NextLink>
        <p className="text-xs text-slate-400 font-mono">Create Operator Account</p>
      </div>

      {/* Registration Card */}
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Create Operator Account</h2>
          <p className="text-xs text-slate-400">Join the SAGAR AI Generative Super App as an Operator.</p>
        </div>

        {(localError || error) && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col gap-1.5 text-rose-400 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{localError || error}</span>
            </div>
            {(localError || error)?.toLowerCase().includes('already exists') && (
              <div className="pl-6.5 text-[11px] text-slate-300">
                <span>Already registered with this email? </span>
                <NextLink href="/login" className="text-cyan-400 font-semibold underline hover:text-cyan-300">
                  Click here to Sign In ➔
                </NextLink>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Operator Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                placeholder="Alex Morgan"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (localError || error) {
                    setLocalError('');
                    clearError();
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="operator@sagar.ai"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (localError || error) {
                    setLocalError('');
                    clearError();
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="•••••••••••• (min 6 characters)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (localError || error) {
                    setLocalError('');
                    clearError();
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-glow-indigo transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <NextLink href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Sign In
          </NextLink>
        </div>
      </div>
    </div>
  );
}
