// src/features/quiz/ResultsModal.jsx
import { useState } from 'react';
import Button from '../../components/ui/Button';
import { IconCoin, IconZap, IconCheck, IconTrophy, Spinner } from '../../components/ui/Icons';
import { AnalyticsService } from '../../services';

function ScoreRing({ percentage }) {
  const color = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
  const label = percentage >= 80 ? 'Excellent!' : percentage >= 60 ? 'Good Job!' : 'Keep Practicing';

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center border-4 relative"
        style={{ borderColor: color }}
      >
        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-md"
          style={{ background: color }}
        />
        <div className="relative text-center">
          <div className="font-display font-bold text-3xl text-textPrimary leading-none">
            {percentage}%
          </div>
          <div className="text-[10px] text-textMuted mt-0.5">Score</div>
        </div>
      </div>
      <span
        className="font-display font-semibold text-sm"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}

export default function ResultsModal({ result, onClose }) {
  const [explanations, setExplanations] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  if (!result) return null;
  const {
    percentage,
    correct,
    total,
    coinsEarned,
    xpEarned,
    submissionId,
    questions = [],
    answers = []
  } = result;

  const handleAskAI = async (questionId) => {
    if (!submissionId || !questionId) {
      const key = questionId || 'missing-question';
      setError(prev => ({
        ...prev,
        [key]: 'AI Tutor needs a saved live submission before it can explain this answer.',
      }));
      return;
    }

    if (explanations[questionId]) return;
    setLoading(prev => ({ ...prev, [questionId]: true }));
    setError(prev => ({ ...prev, [questionId]: null }));
    try {
      const data = await AnalyticsService.explain(submissionId, questionId);
      setExplanations(prev => ({
        ...prev,
        [questionId]: data?.explanation || 'AI Tutor could not find enough saved context to explain this answer yet.',
      }));
    } catch (err) {
      console.error("Failed to fetch AI explanation:", err);
      setError(prev => ({
        ...prev,
        [questionId]: err.message || 'AI Tutor could not explain this saved answer yet.',
      }));
    } finally {
      setLoading(prev => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-overlay-in"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
    >
      <div className="bg-bgCard border border-borderColor rounded-xl p-6 sm:p-8 w-full max-w-2xl
                      max-h-[90vh] overflow-y-auto shadow-glass animate-modal-in flex flex-col gap-6">
        
        {/* Top Summary Section */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between pb-4 border-b border-borderColor/60">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <IconTrophy size={28} className="text-accentAmber" />
              <h2 className="font-display font-bold text-xl text-textPrimary tracking-tight">
                Assessment Complete!
              </h2>
            </div>
            <p className="text-sm text-textMuted">You did a great job challenging yourself today.</p>
            
            {/* Stats Row */}
            <div className="flex flex-wrap gap-2.5 mt-4 justify-center md:justify-start">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bgSecondary border border-borderColor text-xs font-semibold text-accentEmerald">
                <IconCheck size={14} />
                <span>{correct} / {total} Correct</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bgSecondary border border-borderColor text-xs font-semibold text-accentAmber">
                <IconCoin size={14} />
                <span>+{coinsEarned} Coins</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bgSecondary border border-borderColor text-xs font-semibold text-accentIndigo">
                <IconZap size={14} />
                <span>+{xpEarned} XP</span>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <ScoreRing percentage={percentage} />
          </div>
        </div>

        {/* Bonus message */}
        {percentage >= 80 && (
          <div className="p-3.5 rounded-lg bg-accentEmerald/8 border border-accentEmerald/20 text-center">
            <p className="text-xs text-accentEmerald font-display font-semibold flex items-center justify-center gap-1.5">
              <IconCheck size={13} />
              Full reward unlocked! Maximum coins earned.
            </p>
          </div>
        )}

        {/* Detailed Question Review (If questions provided) */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-display font-bold text-sm text-textPrimary uppercase tracking-wider">
              Question Review
            </h3>
            <div className="space-y-3">
              {questions.map((q, idx) => {
                const qId = q.id || q._id;
                const userAns = answers.find(a => (a.questionId?.toString() || a.id?.toString()) === qId?.toString());
                const isCorrect = userAns ? userAns.isCorrect : false;

                return (
                  <div
                    key={qId || idx}
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      isCorrect
                        ? 'bg-accentEmerald/4 border-accentEmerald/15 hover:border-accentEmerald/30'
                        : 'bg-accentRose/4 border-accentRose/15 hover:border-accentRose/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-textMuted tracking-wider">
                          Question {idx + 1}
                        </span>
                        <p className="text-sm font-semibold text-textPrimary leading-relaxed">
                          {q.text}
                        </p>
                      </div>
                      
                      {/* Badge indicator */}
                      <span className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border ${
                        isCorrect
                          ? 'bg-accentEmerald/10 border-accentEmerald/20 text-accentEmerald'
                          : 'bg-accentRose/10 border-accentRose/20 text-accentRose'
                      }`}>
                        {isCorrect ? (
                          <IconCheck size={12} />
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        )}
                      </span>
                    </div>

                    {/* Answer Comparison */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 rounded-lg bg-bgCard/60 border border-borderColor/50">
                        <span className="text-textMuted block font-semibold text-[10px] uppercase">Your Answer</span>
                        <span className={`font-semibold ${isCorrect ? 'text-accentEmerald' : 'text-accentRose'}`}>
                          {userAns?.userAnswer || "(No Answer)"}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div className="p-2 rounded-lg bg-bgCard/60 border border-borderColor/50">
                          <span className="text-textMuted block font-semibold text-[10px] uppercase">Correct Answer</span>
                          <span className="text-accentEmerald font-semibold">
                            {userAns?.correctAnswer || "(Not available)"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ask AI Tutor for Incorrect Answers */}
                    {!isCorrect && (
                      <div className="mt-3.5 pt-3 border-t border-borderColor/50">
                        {!explanations[qId] ? (
                          <button
                            onClick={() => handleAskAI(qId)}
                            disabled={loading[qId] || !qId}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accentIndigo/10 text-accentIndigo hover:bg-accentIndigo/20 border border-accentIndigo/20 text-xs font-bold transition-all disabled:opacity-50"
                          >
                            {loading[qId] ? (
                              <>
                                <Spinner size={12} />
                                <span>Analyzing misconception...</span>
                              </>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                <span>Ask AI Tutor</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="p-3.5 rounded-lg bg-accentIndigo/5 border border-accentIndigo/15 relative overflow-hidden animate-fadeIn">
                            <div className="absolute top-0 right-0 p-1.5 text-accentIndigo opacity-25">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                              </svg>
                            </div>
                            <div className="flex gap-2 items-start">
                              <span className="text-xs uppercase font-bold text-accentIndigo tracking-wider block mt-0.5">AI Tutor:</span>
                              <p className="text-xs text-textPrimary leading-relaxed flex-grow">
                                {explanations[qId]}
                              </p>
                            </div>
                          </div>
                        )}

                        {error[qId] && (
                          <p className="text-xs text-accentRose font-semibold mt-1">{error[qId]}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action */}
        <div className="pt-2 border-t border-borderColor/60 mt-2">
          <Button variant="primary" fullWidth onClick={onClose}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
