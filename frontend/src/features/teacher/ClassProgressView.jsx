// src/features/teacher/ClassProgressView.jsx
// ─── Far Away — Teacher Class Progress View ───
// Enables faculty to inspect students' test submissions, see correct/incorrect answers,
// and write/generate personalized AI study notes.

import { useState, useMemo } from 'react';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import {
  IconCheck, IconX, IconUser, IconBook,
  IconTrophy, IconClock, IconFlame, Spinner,
} from '../../components/ui/Icons';

function buildLocalStudyNote(selectedAttempt) {
  const wrongQs = selectedAttempt.questions.filter(q => !q.isCorrect);

  if (wrongQs.length === 0) {
    return `Hi ${selectedAttempt.studentName.split(' ')[0]},

Fantastic job on completing the ${selectedAttempt.testTitle}! You achieved a perfect score of 100%. Your understanding of these concepts is exemplary. For next steps, I recommend exploring advanced topics or acting as a peer mentor in SkillSwap to help others solidify their understanding.

Keep up the great work!`;
  }

  const topicsToReview = wrongQs.map((q, idx) => `${idx + 1}. ${q.text.slice(0, 40)}...`).join('\n');
  return `Hi ${selectedAttempt.studentName.split(' ')[0]},

Good effort on completing the ${selectedAttempt.testTitle}. Your overall score is ${selectedAttempt.score}%.

I reviewed your responses and noticed we can improve on a couple of points:
${topicsToReview}

Study Tips:
- Review our textbook section regarding these specific issues.
- Try booking a 30-minute mentoring session in the SkillSwap panel with classmates who excel in this area.

Let me know if you want to schedule a brief call during office hours to go over the solutions together. You are close to mastering this!`;
}

export default function ClassProgressView({ submissions, onSaveFeedback, onGenerateStudyNote, searchQuery }) {
  const [selectedSubId, setSelectedSubId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiStep, setAiStep] = useState('');

  // Filter submissions by student name or test title
  const filtered = useMemo(() => {
    return submissions.filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return s.studentName.toLowerCase().includes(q) || s.testTitle.toLowerCase().includes(q);
    });
  }, [submissions, searchQuery]);

  const selectedAttempt = useMemo(() => {
    return submissions.find(s => s.id === selectedSubId);
  }, [submissions, selectedSubId]);

  const handleSelectAttempt = (attempt) => {
    setSelectedSubId(attempt.id);
    setFeedbackText(attempt.feedback || '');
  };

  // Generate personalized study notes with the backend tutor when available.
  const handleGenerateAINote = async () => {
    if (!selectedAttempt) return;
    setAiGenerating(true);
    setAiStep('Asking AI tutor to inspect this attempt...');

    try {
      if (onGenerateStudyNote) {
        const note = await onGenerateStudyNote(selectedAttempt.id);
        if (note) {
          setFeedbackText(note);
          return;
        }
      }

      setAiStep('Generating a local draft from the attempt data...');
      setFeedbackText(buildLocalStudyNote(selectedAttempt));
    } catch (err) {
      console.error('Failed to generate AI study note:', err);
      setAiStep('Generating a local draft from the attempt data...');
      setFeedbackText(buildLocalStudyNote(selectedAttempt));
    } finally {
      setAiGenerating(false);
      setAiStep('');
    }
  };

  const handleSendFeedback = () => {
    if (!selectedAttempt) return;
    onSaveFeedback(selectedAttempt.id, feedbackText);
    setSelectedSubId(null);
    setFeedbackText('');
  };

  // Compute analytics
  const classAvg = useMemo(() => {
    if (submissions.length === 0) return 0;
    const total = submissions.reduce((acc, s) => acc + s.score, 0);
    return Math.round(total / submissions.length);
  }, [submissions]);

  const pendingFeedbackCount = useMemo(() => {
    return submissions.filter(s => !s.feedback).length;
  }, [submissions]);

  return (
    <div className="animate-fadeIn space-y-6">
      {/* ── Page Header ── */}
      <div>
        <h2 className="font-sans font-bold text-[26px] text-textPrimary tracking-tight leading-tight mb-1">
          Class Progress & Grading
        </h2>
        <p className="text-[14px] text-textMuted">
          Review recent lab submissions, inspect answer correctness, and send personalized study guidelines.
        </p>
      </div>

      {/* ── Analytics Widgets ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center justify-between">
          <div>
            <span className="label-caps">Average Score</span>
            <p className="font-display font-bold text-2xl text-accentIndigo mt-1">{classAvg}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accentIndigo/10 flex items-center justify-center text-accentIndigo">
            <IconTrophy size={18} />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <span className="label-caps">Total Attempts</span>
            <p className="font-display font-bold text-2xl text-textPrimary mt-1">{submissions.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-bgSecondary border border-borderColor flex items-center justify-center text-textSecondary">
            <IconUser size={18} />
          </div>
        </div>

        <div className="card p-5 flex items-center justify-between">
          <div>
            <span className="label-caps">Pending Feedback</span>
            <p className={`font-display font-bold text-2xl mt-1 ${pendingFeedbackCount > 0 ? 'text-accentAmber' : 'text-accentEmerald'}`}>
              {pendingFeedbackCount}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accentAmber/10 flex items-center justify-center text-accentAmber">
            <IconClock size={18} />
          </div>
        </div>
      </div>

      {/* ── Main Layout Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Attempt Log */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b border-borderColor pb-2">
            <h3 className="font-sans font-semibold text-[14px] text-textPrimary">
              Student Attempts
            </h3>
            <span className="text-[11px] text-textMuted">
              Showing {filtered.length} records
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="card p-8 text-center flex flex-col items-center">
              <IconBook size={24} className="text-textMuted opacity-45 mb-2" />
              <p className="text-xs text-textMuted">No student submissions match your search.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filtered.map(attempt => {
                const isCorrect = attempt.score >= 80;
                const hasFeedback = !!attempt.feedback;

                return (
                  <div
                    key={attempt.id}
                    onClick={() => handleSelectAttempt(attempt)}
                    className={[
                      'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-150 cursor-pointer',
                      selectedSubId === attempt.id
                        ? 'border-accentIndigo bg-accentIndigo/[0.02] shadow-sm'
                        : 'bg-bgCard border-borderColor hover:border-borderHover hover:shadow-card',
                    ].join(' ')}
                  >
                    {/* Student identity */}
                    <div className="flex items-center gap-3">
                      <Avatar initials={attempt.studentInitials} size="md" />
                      <div>
                        <p className="text-[13px] font-semibold text-textPrimary font-display">
                          {attempt.studentName}
                        </p>
                        <p className="text-[11px] text-textMuted">
                          {attempt.subjectName} &nbsp;·&nbsp; {attempt.testTitle}
                        </p>
                      </div>
                    </div>

                    {/* Meta stats */}
                    <div className="flex items-center justify-between sm:justify-end gap-5">
                      <div className="text-left sm:text-right">
                        <span className="text-[11px] text-textMuted">{attempt.date}</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[12px] font-bold font-display ${isCorrect ? 'text-accentEmerald' : 'text-accentAmber'}`}>
                            {attempt.score}%
                          </span>
                          <span className="text-[10px] text-textMuted font-medium">
                            ({attempt.correctCount}/{attempt.totalCount} correct)
                          </span>
                        </div>
                      </div>

                      {/* Status pill */}
                      <span className={[
                        'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                        hasFeedback
                          ? 'bg-accentEmerald/8 border-accentEmerald/20 text-accentEmerald'
                          : 'bg-accentAmber/8 border-accentAmber/20 text-accentAmber',
                      ].join(' ')}>
                        {hasFeedback ? 'Feedback Sent' : 'Needs Feedback'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Feedback Detail Drawer */}
        <div className="lg:col-span-1">
          {selectedAttempt ? (
            <div className="card p-5 border-borderColor space-y-5 bg-bgCard relative lg:sticky lg:top-24">
              {/* Header info */}
              <div className="border-b border-borderColor pb-3 flex items-start justify-between">
                <div>
                  <h4 className="font-display font-semibold text-sm text-textPrimary leading-none">
                    Review Submission
                  </h4>
                  <p className="text-[11px] text-textMuted mt-1 truncate max-w-[180px]">
                    {selectedAttempt.studentName} &nbsp;·&nbsp; {selectedAttempt.score}%
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSubId(null)}
                  className="text-textMuted hover:text-textPrimary transition-colors text-xs"
                >
                  Clear Selection
                </button>
              </div>

              {/* Question list breakdown */}
              <div className="space-y-2">
                <span className="label-caps">Question Breakdown</span>
                <div className="max-h-52 overflow-y-auto pr-1 space-y-2">
                  {selectedAttempt.questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-2.5 rounded-lg border border-borderColor bg-bgSecondary/30 flex items-start gap-2.5"
                    >
                      <span className={`flex-shrink-0 mt-0.5 ${q.isCorrect ? 'text-accentEmerald' : 'text-accentCrimson'}`}>
                        {q.isCorrect ? <IconCheck size={14} /> : <IconX size={14} />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-textPrimary leading-normal line-clamp-2">
                          {idx + 1}. {q.text}
                        </p>
                        {!q.isCorrect && q.studentAns && (
                          <p className="text-[9px] text-accentCrimson font-medium mt-1">
                            Answered: "{q.studentAns}" (Correct: "{q.correct}")
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feedback composer */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="label-caps">Study Feedback Note</span>
                  <button
                    type="button"
                    onClick={handleGenerateAINote}
                    disabled={aiGenerating}
                    className="text-[10px] font-semibold text-accentIndigo hover:text-accentIndigo/80 flex items-center gap-1 disabled:opacity-50"
                  >
                    {aiGenerating ? <Spinner size={10} /> : <IconFlame size={10} />}
                    {aiGenerating ? 'AI Generating...' : 'Generate AI Note'}
                  </button>
                </div>

                {aiGenerating && (
                  <div className="p-3 bg-accentIndigo/4 border border-accentIndigo/15 rounded-lg text-center animate-pulse">
                    <p className="text-[10px] text-accentIndigo font-semibold flex items-center justify-center gap-1.5">
                      <Spinner size={12} />
                      {aiStep}
                    </p>
                  </div>
                )}

                <textarea
                  className="w-full bg-bgSecondary border border-borderColor rounded-lg text-textPrimary text-xs p-3 outline-none focus:border-accentIndigo transition-all resize-none"
                  rows={8}
                  placeholder="Compose study recommendations or tips for the student..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                />
              </div>

              {/* Actions */}
              <Button
                variant="primary"
                fullWidth
                onClick={handleSendFeedback}
                disabled={aiGenerating || !feedbackText.trim()}
              >
                Send Feedback Note
              </Button>
            </div>
          ) : (
            <div className="card p-6 border-dashed border-borderColor bg-bgSecondary/20 text-center flex flex-col items-center justify-center py-16">
              <IconUser size={32} className="text-textMuted opacity-35 mb-3" />
              <h4 className="font-display font-semibold text-xs text-textPrimary mb-1">
                No attempt selected
              </h4>
              <p className="text-[11px] text-textMuted max-w-xs leading-relaxed">
                Click on any student submission row on the left to inspect answers and send personalized study guidelines.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
