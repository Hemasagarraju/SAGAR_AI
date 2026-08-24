import { create } from 'zustand';
import api from '../services/api';

export const useReviewStore = create((set, get) => ({
  isReviewModalOpen: false,
  activeTab: 'write', // 'write' | 'community'
  lastCloseTime: null,
  returnVisitTime: null,
  timeSinceLastClose: '',
  hasReviewedThisSession: false,
  isSubmitting: false,
  isLoadingReviews: false,
  reviews: [],
  stats: {
    total: 187,
    avgRating: 4.9,
    breakdown: { 5: 154, 4: 28, 3: 4, 2: 1, 1: 0 }
  },

  initSessionTracking: () => {
    if (typeof window === 'undefined') return;

    try {
      const now = new Date();
      set({ returnVisitTime: now.toISOString() });

      // 1. Read previous session close timestamp
      const storedLastClose = localStorage.getItem('sagaragent_last_close_time') || localStorage.getItem('sagaragent_last_active_heartbeat');
      const hasReviewed = localStorage.getItem('sagaragent_has_reviewed_v1');
      const dismissedUntil = localStorage.getItem('sagaragent_review_dismissed_until');

      if (storedLastClose) {
        const lastCloseDate = new Date(storedLastClose);
        // Only consider if close was at least 15 seconds ago (prevent immediate same-refresh popups)
        const diffMs = now.getTime() - lastCloseDate.getTime();
        
        if (diffMs > 10000) {
          const formattedRelative = formatRelativeTime(lastCloseDate);
          set({
            lastCloseTime: storedLastClose,
            timeSinceLastClose: formattedRelative
          });
        }
      }

      // 2. Set up Heartbeat & Close Event Handlers
      const recordActive = () => {
        localStorage.setItem('sagaragent_last_active_heartbeat', new Date().toISOString());
      };

      const recordClose = () => {
        const closeTimestamp = new Date().toISOString();
        localStorage.setItem('sagaragent_last_close_time', closeTimestamp);
      };

      // Heartbeat every 15s
      recordActive();
      const heartbeatInterval = setInterval(recordActive, 15000);

      // Listen for window close or tab hidden
      window.addEventListener('beforeunload', recordClose);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          recordClose();
        } else {
          recordActive();
        }
      });

      // Fetch initial community reviews
      get().fetchReviews();

      return () => {
        clearInterval(heartbeatInterval);
        window.removeEventListener('beforeunload', recordClose);
      };
    } catch (err) {
      console.warn('Session review tracking init error:', err);
    }
  },

  openReviewModal: (tab = 'write') => {
    set({ isReviewModalOpen: true, activeTab: tab });
    get().fetchReviews();
  },

  closeReviewModal: () => {
    set({ isReviewModalOpen: false });
  },

  dismissForNow: () => {
    if (typeof window !== 'undefined') {
      // Dismiss for 2 hours
      localStorage.setItem('sagaragent_review_dismissed_until', String(Date.now() + 2 * 60 * 60 * 1000));
    }
    set({ isReviewModalOpen: false });
  },

  submitReview: async (reviewPayload) => {
    set({ isSubmitting: true });
    try {
      const { lastCloseTime, returnVisitTime } = get();
      const payload = {
        ...reviewPayload,
        lastSessionCloseTime: lastCloseTime || new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        returnVisitTime: returnVisitTime || new Date().toISOString(),
        deviceInfo: typeof navigator !== 'undefined' ? `${navigator.userAgent}` : ''
      };

      const res = await api.post('/reviews', payload);
      if (res.data?.success) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('sagaragent_has_reviewed_v1', 'true');
          // Record new close baseline
          localStorage.setItem('sagaragent_last_close_time', new Date().toISOString());
        }
        set({
          hasReviewedThisSession: true,
          isSubmitting: false,
          activeTab: 'community'
        });
        await get().fetchReviews();
        return { success: true };
      }
      throw new Error(res.data?.error || 'Failed to record review');
    } catch (err) {
      set({ isSubmitting: false });
      const errorMsg = err.response?.data?.error || err.message || 'Error submitting review';
      return { success: false, error: errorMsg };
    }
  },

  fetchReviews: async () => {
    set({ isLoadingReviews: true });
    try {
      const res = await api.get('/reviews');
      if (res.data?.success && res.data?.data) {
        set({
          reviews: res.data.data.reviews || [],
          stats: res.data.data.stats || get().stats,
          isLoadingReviews: false
        });
      }
    } catch (err) {
      set({ isLoadingReviews: false });
    }
  }
}));

function formatRelativeTime(date) {
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return `${diffSec} seconds ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
}
