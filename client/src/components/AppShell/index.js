import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../store/authStore';
import { useWorkflowStore } from '../../store/workflowStore';
import { useReviewStore } from '../../store/reviewStore';
import { getSocket, joinUserRoom } from '../../services/socket';
import PlatformLogo from '../PlatformLogo';
import ThemeSwitcher from '../ThemeSwitcher';
import AiAssistant from '../AiAssistant';
import {
  LayoutDashboard,
  Sparkles,
  Settings,
  Bell,
  LogOut,
  User,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Check,
  Trash2,
  ChevronRight,
  Menu,
  X,
  Radio,
  ArrowLeft,
  Star,
  Clock,
  Image as ImageIcon,
  PenTool,
  Bot,
  Wrench
} from 'lucide-react';

export default function AppShell({ children, pageTitle = 'Operations' }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const {
    notifications,
    unreadCount,
    isNotificationDrawerOpen,
    toggleNotificationDrawer,
    fetchNotifications,
    addNotification,
    markNotificationAsRead,
    clearAllNotifications
  } = useWorkflowStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    fetchNotifications();

    const s = getSocket();
    if (s) {
      setSocketConnected(s.connected);

      s.on('connect', () => setSocketConnected(true));
      s.on('disconnect', () => setSocketConnected(false));

      if (user?.id || user?._id) {
        joinUserRoom(user.id || user._id);
      }

      s.on('notification:new', (notif) => {
        addNotification(notif);
      });
    }

    return () => {
      if (s) {
        s.off('notification:new');
      }
    };
  }, [user, fetchNotifications, addNotification]);

  const navItems = [
    { name: 'AI Studio Hub', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Copilot', href: '/chat', icon: Bot, highlight: true },
    { name: 'AI Image Studio', href: '/images', icon: ImageIcon },
    { name: 'AI Prompt Studio', href: '/prompts', icon: PenTool },
    { name: 'AI Tools Hub', href: '/tools', icon: Wrench },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const { openReviewModal, stats } = useReviewStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-6 flex items-center justify-between">
        {/* Left: Brand, Back Button & Mobile Toggle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Universal Back Button across features */}
          {router.pathname !== '/dashboard' && (
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/dashboard');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 hover:border-cyan-500/50 text-xs font-bold font-mono transition shadow-sm group"
              title="Return to Previous Screen / Dashboard"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-cyan-400" />
              <span>Back</span>
            </button>
          )}

          <NextLink href="/dashboard" className="transition-transform hover:scale-[1.02]">
            <PlatformLogo size="sm" showBadge={true} textClass="text-sm sm:text-base" />
          </NextLink>
        </div>

        {/* Center: Live Status Indicator & Ticker */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/70 border border-slate-800 text-xs">
            <Radio className={`w-3.5 h-3.5 ${socketConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-slate-400">Agent Network:</span>
            <span className={`font-mono font-medium ${socketConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
              {socketConnected ? 'LIVE / STREAMING' : 'CONNECTING...'}
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-300">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="font-mono">Google Gemini & Flux</span>
          </div>
        </div>

        {/* Right: Actions, Notifications & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Review & Rate Platform Trigger Button */}
          <button
            onClick={() => openReviewModal('write')}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold font-mono transition shadow-[0_0_15px_rgba(251,191,36,0.15)] group"
            title="Give Operator Review & Rating"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 transition-transform group-hover:rotate-12 group-hover:scale-110" />
            <span className="hidden sm:inline">Review</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200">
              {stats?.avgRating || '4.9'}★
            </span>
          </button>

          <NextLink
            href="/chat"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-bold shadow-glow-indigo transition"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </NextLink>

          {/* Multi-Color Theme Studio Switcher */}
          <ThemeSwitcher />

          {/* Notifications Trigger */}
          <button
            onClick={() => toggleNotificationDrawer()}
            className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold font-mono text-white flex items-center justify-center animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition border border-slate-800"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </div>
              <span className="hidden sm:inline text-xs font-medium text-slate-300 max-w-[100px] truncate">
                {user?.name || 'Operator'}
              </span>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-panel rounded-xl shadow-2xl py-2 z-50 border border-slate-700 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || 'Operator'}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email || 'operator@agentflow.io'}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                    <Shield className="w-2.5 h-2.5" />
                    <span>{(user?.role || 'operator').toUpperCase()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    openReviewModal('write');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-amber-300 hover:bg-slate-800 transition font-medium"
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Rate Platform Experience</span>
                </button>

                {user?.role !== 'admin' ? (
                  <button
                    onClick={async () => {
                      setIsUserMenuOpen(false);
                      const { adminDemoLogin } = useAuthStore.getState();
                      await adminDemoLogin();
                      router.push('/settings');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-purple-300 hover:bg-purple-500/15 transition font-bold"
                  >
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>👑 Switch to Master Admin</span>
                  </button>
                ) : (
                  <div className="px-3 py-1.5 bg-purple-500/10 text-purple-300 text-[10px] font-mono font-bold flex items-center gap-1.5 border-y border-purple-500/20">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>MASTER ADMIN ACTIVE</span>
                  </div>
                )}

                <NextLink
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-white transition"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings & Directory</span>
                </NextLink>

                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md transition-all duration-300 ${
            isSidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Navigation Links */}
          <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href || (item.href !== '/dashboard' && router.pathname.startsWith(item.href));
              return (
                <NextLink
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-inner'
                      : item.highlight
                      ? 'text-cyan-300 bg-cyan-950/30 border border-cyan-500/20 hover:bg-cyan-900/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.name}</span>}
                  {!isSidebarCollapsed && item.highlight && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      AI
                    </span>
                  )}
                </NextLink>
              );
            })}

            {/* LAST ITEM: Operator Review & Rating */}
            <button
              onClick={() => openReviewModal('write')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 ${
                isSidebarCollapsed ? 'justify-center px-2' : ''
              }`}
              title={isSidebarCollapsed ? 'Rate & Review' : undefined}
            >
              <Star className="w-4 h-4 shrink-0 text-amber-400 fill-amber-400" />
              {!isSidebarCollapsed && <span className="truncate">Rate & Reviews</span>}
              {!isSidebarCollapsed && (
                <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 font-mono font-bold">
                  {stats?.avgRating || '4.9'}★
                </span>
              )}
            </button>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition text-xs font-mono"
              title="Toggle Sidebar"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${isSidebarCollapsed ? '' : 'rotate-180'}`} />
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="relative w-64 bg-slate-900 border-r border-slate-800 p-4 flex flex-col z-10">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-bold text-white font-mono text-sm">SAGAR AI</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 py-4 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = router.pathname === item.href;
                  return (
                    <NextLink
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </NextLink>
                  );
                })}

                {/* LAST Mobile Nav Item: Rate Platform */}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openReviewModal('write');
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20"
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Rate Platform Experience</span>
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-200 font-mono">
                    {stats?.avgRating || '4.9'}★
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {children}
        </main>
      </div>

      {/* Slide-over Notifications Drawer */}
      {isNotificationDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => toggleNotificationDrawer(false)} />
          <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col z-10 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Notifications & Activity</h3>
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markNotificationAsRead('all')}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 transition px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20"
                    title="Mark all notifications as read"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark Read</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition px-1.5 py-0.5 rounded hover:bg-slate-800"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
                <button
                  onClick={() => toggleNotificationDrawer(false)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                  <p className="text-xs font-mono">No new alerts or escalations.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isEscalation = notif.type === 'escalation' || notif.type === 'error';
                  const isSuccess = notif.type === 'success';

                  return (
                    <div
                      key={notif._id || notif.id}
                      className={`p-3.5 rounded-xl border text-xs transition ${
                        notif.isRead ? 'bg-slate-950/40 border-slate-800/60 opacity-75' : 'bg-slate-950 border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {isEscalation ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        ) : isSuccess ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Activity className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-slate-200">{notif.title}</h4>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            </span>
                          </div>
                          <p className="text-slate-400 leading-relaxed text-[11px]">{notif.message}</p>
                          {notif.executionId && (
                            <NextLink
                              href={`/executions/${notif.executionId}`}
                              onClick={() => toggleNotificationDrawer(false)}
                              className="inline-block pt-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono underline"
                            >
                              Inspect Execution Stream →
                            </NextLink>
                          )}
                        </div>
                        {!notif.isRead && (
                          <button
                            onClick={() => markNotificationAsRead(notif._id || notif.id)}
                            className="text-slate-500 hover:text-slate-300"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Copilot Assistant (Authenticated Sessions Only) */}
      <AiAssistant />
    </div>
  );
}
