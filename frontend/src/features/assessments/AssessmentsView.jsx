// src/features/assessments/AssessmentsView.jsx
// Student assessment hub with learning paths and per-test schedule gates.

import { useMemo } from 'react';
import {
  IconClock, IconBook, IconCode,
  IconDatabase, IconGlobe, IconServer, IconAtom,
  IconTarget, IconChevronRight, IconCoin, IconCheck,
} from '../../components/ui/Icons';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

function parseWindowValue(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (/^\d{2}:\d{2}$/.test(String(value))) {
    const [h, m] = String(value).split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getWindowStatus(item = {}) {
  if (item.availabilityStatus) return item.availabilityStatus;
  const now = new Date();
  const start = parseWindowValue(item.availableFrom);
  const end = parseWindowValue(item.availableTo);
  if (!start || !end) return 'unscheduled';
  if (start && now < start) return 'upcoming';
  if (end && now > end) return 'closed';
  return 'open';
}

function formatClock(value) {
  const date = parseWindowValue(value);
  if (!date) return '';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatTimeLeft(value) {
  const target = parseWindowValue(value);
  if (!target) return null;
  const diffMs = target.getTime() - Date.now();
  if (diffMs <= 0) return null;
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  if (h > 0) return `Opens in ${h}h ${m}m`;
  return `Opens in ${Math.max(m, 1)}m`;
}

function formatScheduleLabel(item = {}) {
  if (item.scheduleLabel) return item.scheduleLabel;
  const start = parseWindowValue(item.availableFrom);
  const end = parseWindowValue(item.availableTo);
  if (!start || !end) return 'Not scheduled by teacher yet';
  const day = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
  }).format(start || end);
  if (start && end) return `${day} · ${formatClock(start)} - ${formatClock(end)}`;
  if (start) return `${day} · opens ${formatClock(start)}`;
  return `${day} · closes ${formatClock(end)}`;
}

const SUBJECT_ICONS = {
  code: IconCode,
  database: IconDatabase,
  globe: IconGlobe,
  server: IconServer,
  atom: IconAtom,
};

const DIFF_BADGE = { easy: 'easy', medium: 'medium', hard: 'hard' };

function AssignmentBadge({ assignment }) {
  const mode = assignment?.mode || 'all';
  if (mode === 'class') {
    return (
      <Badge className="bg-accentIndigo/10 text-accentIndigo border border-accentIndigo/20 font-semibold">
        {assignment.branch || 'Class'} {assignment.batch || ''}
      </Badge>
    );
  }
  if (mode === 'defaulters') {
    return (
      <Badge className="bg-accentAmber/10 text-accentAmber border border-accentAmber/20 font-semibold">
        Defaulter Retest
      </Badge>
    );
  }
  return (
    <Badge className="bg-bgSecondary text-textSecondary border border-borderColor font-semibold">
      All Students
    </Badge>
  );
}

function AssessmentRow({ assessment, onStart, subjectColor }) {
  const windowStatus = getWindowStatus(assessment);
  const isCompleted = assessment.hasSubmitted || assessment.submissionStatus === 'completed';
  const isLocked = isCompleted || windowStatus !== 'open';
  const isClosed = windowStatus === 'closed';
  const isUnscheduled = windowStatus === 'unscheduled';
  const timeLeft = windowStatus === 'upcoming' ? formatTimeLeft(assessment.availableFrom) : null;

  return (
    <div
      onClick={() => !isLocked && onStart(assessment)}
      className={[
        'flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 rounded-lg border transition-all duration-150',
        isLocked
          ? 'bg-bgPrimary border-borderColor opacity-75 cursor-not-allowed'
          : 'bg-bgCard border-borderColor hover:border-borderHover hover:shadow-card cursor-pointer group',
      ].join(' ')}
    >
      <div className="flex items-start gap-4 flex-1 min-w-0">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: isLocked ? '#f5f5f5' : `${subjectColor}14`, border: `1px solid ${isLocked ? '#e5e7eb' : `${subjectColor}30`}` }}
        >
          <IconTarget size={16} style={{ color: isLocked ? '#c7c7c7' : subjectColor }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-sans font-semibold text-[14px] text-textPrimary group-hover:text-accentIndigo transition-colors">
              {assessment.title}
            </h4>
            <Badge variant={DIFF_BADGE[assessment.difficulty]}>
              {assessment.difficulty}
            </Badge>
            {assessment.isAdaptive && (
              <Badge className="bg-accentIndigo/10 text-accentIndigo border border-accentIndigo/20 font-semibold">
                Personalized
              </Badge>
            )}
            <AssignmentBadge assignment={assessment.assignment} />
            {isCompleted && (
              <Badge className="bg-accentEmerald/10 text-accentEmerald border border-accentEmerald/20 font-semibold">
                Completed
              </Badge>
            )}
          </div>
          <p className="text-[12px] text-textMuted leading-snug line-clamp-2">
            {assessment.desc || 'Teacher-assigned timed assessment.'}
          </p>
          <p className="text-[11px] text-textMuted mt-1 flex items-center gap-1.5">
            <IconClock size={11} />
            {isCompleted
              ? `Submitted${assessment.lastScore !== null ? ` · Score ${assessment.lastScore}%` : ''}`
              : formatScheduleLabel(assessment)}
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 w-full sm:w-auto border-t border-borderColor/40 sm:border-0 pt-3 sm:pt-0 mt-1 sm:mt-0 flex-shrink-0">
        <div className="flex flex-wrap items-center gap-4 text-[12px] text-textMuted">
          <span className="flex items-center gap-1.5">
            <IconClock size={12} />
            {assessment.duration} min
          </span>
          <span className="flex items-center gap-1.5">
            <IconBook size={12} />
            {assessment.questionCount || assessment.questions?.length || 0} Qs
          </span>
          <span className="flex items-center gap-1.5 text-accentAmber font-semibold">
            <IconCoin size={12} />
            +{assessment.coinsReward}
          </span>
        </div>

        <div className="w-full sm:w-auto">
          {isCompleted ? (
            <span className="badge-open text-[11px] flex items-center justify-center sm:justify-start gap-1.5">
              <IconCheck size={11} />
              Completed
            </span>
          ) : isClosed ? (
            <span className="badge-closed text-[11px] block text-center sm:inline-block">Closed</span>
          ) : isUnscheduled ? (
            <span className="badge-upcoming text-[11px] flex items-center justify-center sm:justify-start gap-1.5">
              <IconClock size={11} />
              Not scheduled
            </span>
          ) : isLocked ? (
            <span className="badge-upcoming text-[11px] flex items-center justify-center sm:justify-start gap-1.5">
              <IconClock size={11} />
              {timeLeft || 'Upcoming'}
            </span>
          ) : (
            <button
              onClick={event => { event.stopPropagation(); onStart(assessment); }}
              className="btn-primary btn-sm gap-1.5 w-full sm:w-auto justify-center"
              style={{ background: subjectColor, borderColor: subjectColor }}
            >
              Start Test
              <IconChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LearningPathsPanel({ subjects, onStart }) {
  if (!subjects.length) return null;

  return (
    <section className="card p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div>
          <h3 className="font-sans font-bold text-[16px] text-textPrimary">Learning Paths</h3>
          <p className="text-[12px] text-textMuted">
            Pick any assigned subject path. Scheduled assessments still open only inside their teacher-set window.
          </p>
        </div>
        <span className="text-[11px] text-textMuted">{subjects.length} paths available</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {subjects.map(subject => {
          const SubjectIcon = SUBJECT_ICONS[subject.icon] || IconBook;
          const openAssessment = subject.assessments.find(item => getWindowStatus(item) === 'open' && !item.hasSubmitted);
          const nextAssessment = subject.assessments.find(item => getWindowStatus(item) === 'upcoming' && !item.hasSubmitted);
          const firstAssessment = openAssessment || nextAssessment || subject.assessments[0];
          const canStart = Boolean(openAssessment);
          const completedCount = subject.assessments.filter(item => item.hasSubmitted).length;

          return (
            <div key={subject.id} className="p-4 rounded-lg border border-borderColor bg-bgSecondary/25 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${subject.accentColor}14`, color: subject.accentColor }}
                >
                  <SubjectIcon size={18} />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm text-textPrimary">{subject.shortName}</p>
                  <p className="text-[11px] text-textMuted line-clamp-1">{subject.name}</p>
                  <p className="text-[10px] text-textMuted mt-1">
                    {completedCount}/{subject.assessments.length} completed
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={!canStart}
                onClick={() => openAssessment && onStart(openAssessment)}
                className={[
                  'btn btn-sm w-full justify-center',
                  canStart ? 'btn-primary' : 'btn-secondary opacity-60 cursor-not-allowed',
                ].join(' ')}
                style={canStart ? { background: subject.accentColor, borderColor: subject.accentColor } : undefined}
              >
                {canStart ? 'Start Path' : firstAssessment ? completedCount === subject.assessments.length ? 'Completed' : 'No open tests' : 'No Tests'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SubjectSection({ subject, onStart, searchQuery }) {
  const SubjectIcon = SUBJECT_ICONS[subject.icon] || IconBook;
  const filtered = subject.assessments.filter(assessment => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return assessment.title.toLowerCase().includes(q) || (assessment.desc || '').toLowerCase().includes(q);
  });

  if (filtered.length === 0 && searchQuery) return null;

  const openCount = filtered.filter(item => getWindowStatus(item) === 'open' && !item.hasSubmitted).length;
  const upcomingCount = filtered.filter(item => getWindowStatus(item) === 'upcoming').length;
  const unscheduledCount = filtered.filter(item => getWindowStatus(item) === 'unscheduled').length;
  const completedCount = filtered.filter(item => item.hasSubmitted).length;

  return (
    <section className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div
            className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: `${subject.accentColor}14`, border: `1.5px solid ${subject.accentColor}28` }}
          >
            <SubjectIcon size={20} style={{ color: subject.accentColor }} />
          </div>

          <div>
            <p className="label-caps" style={{ color: subject.accentColor }}>{subject.code}</p>
            <h3 className="font-sans font-bold text-[17px] text-textPrimary leading-tight mt-0.5">
              {subject.shortName}
              <span className="ml-2 text-textMuted font-normal text-[14px]">-</span>
              <span className="ml-1 text-textMuted font-normal text-[14px]">{subject.name}</span>
            </h3>
          </div>
        </div>

        <div className="flex sm:flex-col items-start sm:items-end gap-2 sm:gap-1.5 flex-wrap">
          {openCount > 0 && (
            <span className="badge-open flex items-center gap-1.5">
              <span className="live-dot w-1.5 h-1.5" />
              {openCount} Open
            </span>
          )}
          {completedCount > 0 && (
            <span className="badge-open flex items-center gap-1.5">
              <IconCheck size={11} />
              {completedCount} Completed
            </span>
          )}
          {upcomingCount > 0 && (
            <span className="badge-upcoming flex items-center gap-1.5">
              <IconClock size={11} />
              {upcomingCount} Upcoming
            </span>
          )}
          {unscheduledCount > 0 && (
            <span className="badge-upcoming flex items-center gap-1.5">
              <IconClock size={11} />
              {unscheduledCount} Not Scheduled
            </span>
          )}
          <span className="text-[11px] text-textMuted flex items-center gap-1.5">
            <IconClock size={11} />
            {subject.scheduleLabel}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 mb-4 px-1">
        <Avatar initials={subject.teacher.initials} size="sm" />
        <div>
          <p className="text-[12px] font-semibold text-textSecondary">{subject.teacher.name}</p>
          <p className="text-[11px] text-textMuted">{subject.teacher.department}</p>
        </div>
        <span className="ml-auto text-[11px] text-textMuted">
          {filtered.length} assessment{filtered.length !== 1 ? 's' : ''} assigned
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {filtered.map(assessment => (
          <AssessmentRow
            key={assessment.id}
            assessment={assessment}
            onStart={onStart}
            subjectColor={subject.accentColor}
          />
        ))}
      </div>

      <div className="mt-8 divider" />
    </section>
  );
}

export default function AssessmentsView({ subjects, onStart, searchQuery }) {
  const openCount = useMemo(() =>
    subjects.reduce((acc, subject) => acc + subject.assessments.filter(item => getWindowStatus(item) === 'open' && !item.hasSubmitted).length, 0),
  [subjects]);

  const totalAssessments = useMemo(() =>
    subjects.reduce((acc, subject) => acc + subject.assessments.length, 0),
  [subjects]);

  return (
    <div className="animate-fadeIn">
      <div className="mb-8">
        <h2 className="font-sans font-bold text-[26px] text-textPrimary tracking-tight leading-tight mb-1">
          Today's Assessments
        </h2>
        <p className="text-[14px] text-textMuted">
          {totalAssessments} tests across {subjects.length} learning paths
          {openCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1.5 text-accentEmerald font-semibold">
              <span className="live-dot w-1.5 h-1.5" />
              {openCount} open now
            </span>
          )}
        </p>
      </div>

      <LearningPathsPanel subjects={subjects} onStart={onStart} />

      <div
        className="flex items-start gap-3 px-5 py-4 rounded-lg mb-8"
        style={{ background: '#fff8e0', border: '1px solid #e6d5a8' }}
      >
        <IconClock size={18} className="text-accentAmber flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-textPrimary mb-0.5">Teacher Scheduled Tests</p>
          <p className="text-[12px] text-textMuted leading-relaxed">
            Assessments appear for your assigned class and only start during the teacher-set time window.
            Defaulter retests appear only for students who missed the source test.
          </p>
        </div>
      </div>

      {subjects.map(subject => (
        <SubjectSection
          key={subject.id}
          subject={subject}
          onStart={onStart}
          searchQuery={searchQuery}
        />
      ))}

      {subjects.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-bgPrimary border border-borderColor flex items-center justify-center mx-auto mb-4">
            <IconBook size={28} className="text-textMuted" />
          </div>
          <h3 className="font-sans font-semibold text-textPrimary text-[16px] mb-2">No assessments assigned</h3>
          <p className="text-[13px] text-textMuted">Your teacher has not assigned tests to your classroom yet.</p>
        </div>
      )}
    </div>
  );
}
