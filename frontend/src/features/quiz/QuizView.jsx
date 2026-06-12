// src/features/quiz/QuizView.jsx
import { useState } from 'react';
import TimerPill from './TimerPill';
import QuizNav from './QuizNav';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  IconBook, IconCode, IconFlag, IconCheck,
  IconArrowLeft, IconChevronRight, IconZap, Spinner,
} from '../../components/ui/Icons';

export default function QuizView({
  quiz,
  onSelectOption,
  onCodeChange,
  onToggleFlag,
  onPrev,
  onNext,
  onSubmit,
  onRequestHint,
}) {
  const [hintState, setHintState] = useState({
    questionId: null,
    hint: '',
    hintLevel: 0,
    hintLoading: false,
    hintError: '',
  });

  const { assessment, currentQuestionIndex, answers, flagged, timeRemaining } = quiz;
  const question = assessment?.questions[currentQuestionIndex];

  if (!assessment || !question) return null;

  const currentHintState = hintState.questionId === question.id
    ? hintState
    : { questionId: question.id, hint: '', hintLevel: 0, hintLoading: false, hintError: '' };

  const isLast   = currentQuestionIndex === assessment.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const answered = Object.keys(answers).length;
  const isFlagged = !!flagged[question.id];
  const isSelected = (opt) => answers[question.id] === opt;
  const { hint, hintLevel, hintLoading, hintError } = currentHintState;

  const handleRequestHint = async () => {
    if (!onRequestHint || hintLoading) return;

    const nextLevel = Math.min(hintLevel + 1, 3);
    setHintState({
      ...currentHintState,
      questionId: question.id,
      hintLoading: true,
      hintError: '',
    });

    try {
      const data = await onRequestHint({
        questionId: question.id,
        studentAnswer: answers[question.id] || '',
        hintLevel: nextLevel,
      });

      setHintState({
        questionId: question.id,
        hint: data?.hint || 'Try restating the question, then eliminate options that do not match the exact concept.',
        hintLevel: data?.hintLevel || nextLevel,
        hintLoading: false,
        hintError: '',
      });
    } catch (err) {
      console.error('Failed to fetch quiz hint:', err);
      setHintState({
        ...currentHintState,
        questionId: question.id,
        hintLoading: false,
        hintError: 'The AI tutor could not fetch a hint right now. Try the next clue after checking your connection.',
      });
    }
  };

  return (
    <div className="animate-fadeIn flex flex-col-reverse lg:flex-row gap-6">
      {/* ── Main Quiz Pane ── */}
      <div className="flex-1 min-w-0">
        {/* Quiz Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="font-display font-semibold text-lg text-textPrimary leading-tight tracking-tight">
              {assessment.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant={assessment.difficulty}>{assessment.difficulty}</Badge>
              <span className="text-[11px] text-textMuted">
                Question <strong className="text-textSecondary">{currentQuestionIndex + 1}</strong>
                {' '}of{' '}
                <strong className="text-textSecondary">{assessment.questions.length}</strong>
              </span>
              <span className="text-[11px] text-textMuted">
                {answered} answered
              </span>
            </div>
          </div>
          <TimerPill seconds={timeRemaining} />
        </div>

        {/* Progress */}
        <ProgressBar value={progress} className="mb-6" />

        {/* Question Card */}
        <div className="card p-6 mb-5">
          {/* Question type label */}
          <div className="flex items-center justify-between mb-4">
            <span className="label-caps flex items-center gap-1.5">
              {question.type === 'mcq' ? (
                <>
                  <IconBook size={13} className="text-textMuted" />
                  Multiple Choice
                </>
              ) : (
                <>
                  <IconCode size={13} className="text-textMuted" />
                  Code Question
                </>
              )}
            </span>
            {isFlagged && (
              <span className="text-[10px] font-bold text-accentAmber bg-accentAmber/10
                               border border-accentAmber/20 px-2 py-0.5 rounded-full font-display flex items-center gap-1">
                <IconFlag size={10} className="text-accentAmber" />
                Flagged
              </span>
            )}
          </div>

          {/* Adaptive Indicator */}
          {assessment.isAdaptive && (
            <div className="mb-4 px-3 py-2 bg-accentIndigo/5 border border-accentIndigo/10 rounded-md text-[11px] text-accentIndigo flex items-center gap-1.5 animate-pulse">
              <span>⚡ <strong>Adaptive Level:</strong> This question is adapted to your level.</span>
            </div>
          )}

          {/* AI Tutor Hint */}
          <div className="mb-4 rounded-lg border border-accentIndigo/15 bg-accentIndigo/[0.03] p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="label-caps flex items-center gap-1.5 text-accentIndigo">
                <IconZap size={12} />
                AI Tutor Hint
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRequestHint}
                disabled={!onRequestHint || hintLoading || hintLevel >= 3}
                icon={hintLoading ? <Spinner size={12} /> : <IconZap size={12} />}
              >
                {hintLoading ? 'Thinking...' : hintLevel >= 3 ? 'Max Hints' : hintLevel ? 'Next Hint' : 'Get Hint'}
              </Button>
            </div>

            {hint ? (
              <p className="mt-2 text-[12px] leading-relaxed text-textSecondary">
                <span className="font-semibold text-accentIndigo">Hint {hintLevel}:</span> {hint}
              </p>
            ) : (
              <p className="mt-2 text-[11px] leading-relaxed text-textMuted">
                Stuck? Ask for a nudge. Hints get more specific, but they will not reveal the answer.
              </p>
            )}

            {hintError && (
              <p className="mt-2 text-[11px] text-accentCrimson font-medium">
                {hintError}
              </p>
            )}
          </div>

          {/* Question Text */}
          <p className="text-sm font-medium text-textPrimary leading-relaxed mb-6">
            {question.text}
          </p>

          {/* MCQ Options */}
          {question.type === 'mcq' ? (
            <div className="flex flex-col gap-2.5">
              {question.options.map((opt, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectOption(question.id, opt)}
                  className={isSelected(opt) ? 'quiz-option-selected' : 'quiz-option-idle'}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                      ${isSelected(opt) ? 'border-accentIndigo' : 'border-borderHover'}`}
                  >
                    {isSelected(opt) && (
                      <div className="w-2 h-2 rounded-full bg-accentIndigo" />
                    )}
                  </div>
                  <span className="text-sm text-textPrimary font-medium">{opt}</span>
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-textMuted mb-2 font-display">
                Write your CSS / code answer below:
              </p>
              <textarea
                value={answers[question.id] || ''}
                onChange={e => onCodeChange(question.id, e.target.value)}
                rows={8}
                placeholder="// Write your code here..."
                className="w-full bg-bgSecondary border border-borderColor rounded-lg
                           text-textPrimary font-mono text-xs p-4 outline-none
                           focus:border-accentIndigo focus:ring-2 focus:ring-accentIndigo/15
                           transition-all resize-none placeholder:text-textFaint"
              />
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={onPrev}
            disabled={currentQuestionIndex === 0}
            icon={<IconArrowLeft size={13} />}
          >
            Previous
          </Button>

          <Button
            variant={isFlagged ? 'amber' : 'ghost'}
            onClick={onToggleFlag}
            icon={<IconFlag size={13} />}
          >
            {isFlagged ? 'Unflag' : 'Flag for Review'}
          </Button>

          {isLast ? (
            <Button variant="success" onClick={onSubmit} icon={<IconCheck size={13} />}>
              Submit Quiz
            </Button>
          ) : (
            <Button variant="primary" onClick={onNext} iconRight={<IconChevronRight size={13} />}>
              Next
            </Button>
          )}
        </div>
      </div>

      {/* ── Right Navigator Sidebar ── */}
      <div className="w-full lg:w-52 flex-shrink-0">
        <QuizNav
          questions={assessment.questions}
          currentIndex={currentQuestionIndex}
          answers={answers}
          flagged={flagged}
          onJump={(idx) => {
            onNext(idx);
          }}
        />
      </div>
    </div>
  );
}
