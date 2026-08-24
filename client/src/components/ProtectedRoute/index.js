import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { Cpu, ShieldCheck } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole = null }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-200">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <Cpu className="w-8 h-8 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <div className="absolute -inset-2 rounded-2xl bg-indigo-500/20 blur-lg -z-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-lg font-semibold tracking-wide text-white">SAGAR AI</h2>
          <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Authenticating Operator Session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && user?.role !== requiredRole && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-200 p-4">
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl text-center space-y-4 border-rose-500/20">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Access Restricted</h2>
          <p className="text-sm text-slate-400">
            This sector requires elevated permissions ({requiredRole.toUpperCase()} privilege).
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
