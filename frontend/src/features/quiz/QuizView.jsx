// src/features/quiz/QuizView.jsx
import React from 'react';
import TimerPill from './TimerPill';
import QuizNav from './QuizNav';
import ProgressBar from '../../components/ui/ProgressBar';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import {
  IconBook, IconCode, IconFlag, IconCheck,
  IconArrowLeft, IconChevronRight,
} from '../../components/ui/Icons';

export default function QuizView({ quiz, onSelectOption, onCodeChange, onToggleFlag, onPrev, onNext, onSubmit }) {
  const { assessment, currentQuestionIndex, answers, flagged, timeRemaining } = quiz;
  if (!assessment) return null;

  const question = assessment.questions[currentQuestionIndex];
  const isLast   = currentQuestionIndex === assessment.questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / assessment.questions.length) * 100;
  const answered = Object.keys(answers).length;
  const isFlagged = !!flagged[question.id];
  const isSelected = (opt) => answers[question.id] === opt;

  return (
    <div className="animate-fadeIn flex gap-6">
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
      <div className="w-52 flex-shrink-0">
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
