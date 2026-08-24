import { useState, useEffect } from 'react';
import { useReviewStore } from '../../store/reviewStore';
import { useAuthStore } from '../../store/authStore';
import {
  Star,
  Sparkles,
  Clock,
  Send,
  X,
  CheckCircle2,
  ThumbsUp,
  MessageSquare,
  Users,
  Shield,
  Layers,
  Zap,
  Award,
  Calendar
} from 'lucide-react';

const CATEGORIES = [
  { id: 'overall', label: '🌟 Overall Experience' },
  { id: 'ai_workflows', label: '🧠 AI Workflow Studio' },
  { id: 'multi_agent', label: '🤖 Multi-Agent Pipelines' },
  { id: 'speed_performance', label: '⚡ Speed & Performance' },
  { id: 'ui_design', label: '🎨 UI & Aesthetics' },
  { id: 'integrations', label: '🔌 Tool Integrations' }
];

const PRESET_TAGS = [
  '⚡ Ultra Fast Execution',
  '🤖 Intelligent Agent Chains',
  '🎨 Sleek Futuristic UI',
  '🧠 Accurate AI Prompts',
  '🔒 Solid AES-256 Vault',
  '🔌 Seamless Slack & Sheets',
  '📈 Real-Time DAG Telemetry',
  '💡 Great UX'
];

const RATING_EMOJIS = {
  1: { emoji: '😡', label: 'Needs Improvement', color: 'text-rose-400' },
  2: { emoji: '😕', label: 'Fair / Could Be Better', color: 'text-amber-400' },
  3: { emoji: '😊', label: 'Good & Functional', color: 'text-cyan-400' },
  4: { emoji: '🚀', label: 'Superb & Powerful', color: 'text-indigo-400' },
  5: { emoji: '🌟', label: 'Phenomenal Masterpiece!', color: 'text-amber-300' }
};

export default function ReviewModal() {
  const {
    isReviewModalOpen,
    closeReviewModal,
    dismissForNow,
    activeTab,
    openReviewModal,
    lastCloseTime,
    timeSinceLastClose,
    submitReview,
    isSubmitting,
    reviews,
    stats
  } = useReviewStore();

  const { user } = useAuthStore();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('overall');
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['⚡ Ultra Fast Execution', '🧠 Accurate AI Prompts']);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setUserName(user.name || '');
      setUserEmail(user.email || '');
    }
  }, [user]);

  if (!isReviewModalOpen) return null;

  const currentActiveRating = hoverRating || rating;
  const ratingDetails = RATING_EMOJIS[currentActiveRating] || RATING_EMOJIS[5];

  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!rating) {
      setErrorMessage('Please select a star rating.');
      return;
    }

    const res = await submitReview({
      rating,
      category,
      comment,
      tags: selectedTags,
      userName: userName || user?.name || 'Operator',
      userEmail: userEmail || user?.email || ''
    });

    if (res.success) {
      setSubmittedSuccess(true);
      setTimeout(() => {
        setSubmittedSuccess(false);
      }, 4000);
    } else {
      setErrorMessage(res.error || 'Failed to submit review');
    }
  };

  // Format the last close time nicely
  const formattedLastClose = lastCloseTime
    ? new Date(lastCloseTime).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Earlier today';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[92vh] font-sans">
        {/* Glow Substrate */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-indigo-600 p-0.5 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">Operator Experience Review</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono border border-amber-400/40">
                  FEEDBACK LOOP
                </span>
              </div>
              <p className="text-xs text-slate-400">Share your thoughts on SAGAR AI performance</p>
            </div>
          </div>

          <button
            onClick={closeReviewModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Last Session Close Time Notice Banner */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/60 border-b border-indigo-500/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Last App Session Closed:</span>
            <span className="text-cyan-300 font-bold">{formattedLastClose}</span>
            {timeSinceLastClose && (
              <span className="text-slate-400">({timeSinceLastClose})</span>
            )}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Welcome Back!</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-5">
          <button
            onClick={() => openReviewModal('write')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'write'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Leave a Review</span>
          </button>
          <button
            onClick={() => openReviewModal('community')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'community'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Community Wall ({stats?.total || 187}+ Reviews)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
              ⭐ {stats?.avgRating || 4.9}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'write' ? (
            submittedSuccess ? (
              <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white">Review Submitted Successfully!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Thank you for rating your experience after returning from your last session. Your feedback directly powers autonomous agent model optimizations.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => openReviewModal('community')}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-glow-indigo transition"
                  >
                    View Community Feedback Wall →
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMessage && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Interactive Star Rating Selector */}
                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-3">
                  <p className="text-xs font-medium text-slate-300">
                    How was your experience during your recent operations session?
                  </p>

                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = starVal <= (hoverRating || rating);
                      return (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setRating(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-2 transition-transform hover:scale-125 focus:outline-none"
                          title={`${starVal} Star${starVal > 1 ? 's' : ''}`}
                        >
                          <Star
                            className={`w-8 h-8 transition-colors ${
                              isFilled
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                                : 'text-slate-700 hover:text-slate-500'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>

                  <div className="text-xs font-mono font-bold flex items-center justify-center gap-2">
                    <span className="text-lg">{ratingDetails.emoji}</span>
                    <span className={ratingDetails.color}>{ratingDetails.label}</span>
                  </div>
                </div>

                {/* Category Pill Selectors */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Feedback Category</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`p-2.5 rounded-xl border text-xs font-medium transition text-left ${
                          category === cat.id
                            ? 'bg-indigo-600/25 border-indigo-500/60 text-white shadow-sm'
                            : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/50'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Compliment Tags */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Quick Highlights (Tap to add)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_TAGS.map((tag) => {
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-[11px] font-medium transition border ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                              : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback Comment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Detailed Feedback & Suggestions</label>
                  <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what you loved, any suggestions for new agents or tools..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                  />
                </div>

                {/* Operator Name / Email (if not logged in) */}
                {!user && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Your Name (Optional)</label>
                      <input
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        placeholder="Operator Name"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400">Email (Optional)</label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        placeholder="operator@sagar.ai"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={dismissForNow}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition"
                  >
                    Remind Me Later ⏰
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-indigo-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 text-white font-bold text-xs shadow-glow-indigo transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Recording Feedback...' : 'Submit Operator Review'}</span>
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Community Wall of Love */
            <div className="space-y-5">
              {/* Aggregated Score Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-950 to-amber-950/20 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-black text-amber-300 font-mono flex items-center gap-1">
                    <span>{stats?.avgRating || '4.9'}</span>
                    <Star className="w-6 h-6 fill-amber-400 text-amber-400 inline" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Platform Operational Score</h4>
                    <p className="text-[11px] text-slate-400">Based on {stats?.total || 187} operator evaluations</p>
                  </div>
                </div>

                <button
                  onClick={() => openReviewModal('write')}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold font-mono transition flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Add Your Rating</span>
                </button>
              </div>

              {/* Reviews Feed */}
              <div className="space-y-3">
                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs font-mono">
                    No community reviews recorded yet. Be the first operator to review!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev._id || rev.id}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center font-mono">
                            {rev.userName ? rev.userName.charAt(0).toUpperCase() : 'O'}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-slate-200">{rev.userName}</span>
                            <span className="text-[10px] text-slate-500 font-mono ml-2">
                              {rev.lastSessionCloseTime ? `Session: ${new Date(rev.lastSessionCloseTime).toLocaleDateString()}` : 'Verified Operator'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.comment && (
                        <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.comment}"</p>
                      )}

                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {rev.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
