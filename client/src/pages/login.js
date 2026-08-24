import { useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import PlatformLogo from '../components/PlatformLogo';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { Sparkles, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, adminDemoLogin, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      const redirectUrl = router.query.redirect ? decodeURIComponent(router.query.redirect) : '/dashboard';
      router.push(redirectUrl);
    }
  };

  const handleDemoLogin = async () => {
    setLocalError('');
    clearError();
    const res = await demoLogin();
    if (res.success) {
      const redirectUrl = router.query.redirect ? decodeURIComponent(router.query.redirect) : '/dashboard';
      router.push(redirectUrl);
    } else {
      setLocalError(res.error || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Top Floating Controls: Back to Hub & Theme Switcher */}
      <div className="absolute top-6 left-6 z-20">
        <NextLink
          href="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-bold font-mono transition shadow-lg group"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Hub</span>
        </NextLink>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeSwitcher />
      </div>

      {/* Glow Orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl -z-10" />

      {/* Header Logo */}
      <div className="mb-8 text-center space-y-2 flex flex-col items-center">
        <div className="inline-flex items-center gap-3">
          <PlatformLogo size="lg" textClass="text-2xl font-black" />
        </div>
        <p className="text-xs text-slate-400 font-mono">Generative AI Super App Authentication</p>
      </div>

      {/* Login Card */}
      <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight">Sign In</h2>
          <p className="text-xs text-slate-400">Enter your credentials or use 1-click authentication below.</p>
        </div>

        {(localError || error) && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="name@example.com"
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
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
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
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Fast Demo Operator Login */}
        <div className="pt-2 border-t border-slate-800 space-y-2.5">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-xs font-mono font-medium transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>⚡ 1-Click Demo Operator Sign In</span>
          </button>
        </div>

        <div className="text-center text-xs text-slate-400">
          Don't have an operator account?{' '}
          <NextLink href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold underline">
            Register Account
          </NextLink>
        </div>
      </div>
    </div>
  );
}
