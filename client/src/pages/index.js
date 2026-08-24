import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';
import PlatformLogo from '../components/PlatformLogo';
import { Loader2 } from 'lucide-react';

export default function IndexPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient Neon Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col items-center gap-6 z-10">
        <PlatformLogo size="xl" textClass="text-2xl sm:text-3xl font-black" />
        
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          <span>LAUNCHING SAGAR AI STUDIO...</span>
        </div>
      </div>
    </div>
  );
}
