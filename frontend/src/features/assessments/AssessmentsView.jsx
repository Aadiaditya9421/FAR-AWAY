// src/features/assessments/AssessmentsView.jsx
// ─── Subject-Grouped Assessment View ───
// Shows labs grouped by teacher/subject, each with a time window gate.

import React, { useMemo } from 'react';
import {
  IconClock, IconCheck, IconBook, IconCode,
  IconDatabase, IconGlobe, IconServer, IconAtom,
  IconTarget, IconChevronRight, IconCoin,
} from '../../components/ui/Icons';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

// ── Time window utilities ──────────────────────────────────────
function parseTime(str) {
  const [h, m] = str.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function getWindowStatus(from, to) {
  const now = new Date();
  const start = parseTime(from);
  const end   = parseTime(to);
  if (now >= start && now <= end) return 'open';
  if (now < start) return 'upcoming';
  return 'closed';
}

function formatTimeLeft(targetTimeStr) {
  const now    = new Date();
  const target = parseTime(targetTimeStr);
  const diffMs = target - now;
  if (diffMs <= 0) return null;
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  if (h > 0) return `Opens in ${h}h ${m}m`;
  return `Opens in ${m}m`;
}

// ── Subject icon map ───────────────────────────────────────────
const SUBJECT_ICONS = {
  code:     IconCode,
  database: IconDatabase,
  globe:    IconGlobe,
  server:   IconServer,
  atom:     IconAtom,
};

// ── Difficulty map → Badge variant ────────────────────────────
const DIFF_BADGE = { easy: 'easy', medium: 'medium', hard: 'hard' };

// ── Single assessment row card ─────────────────────────────────
function AssessmentRow({ assessment, windowStatus, onStart, subjectColor }) {
  const isLocked  = windowStatus !== 'open';
  const isClosed  = windowStatus === 'closed';

  return (
    <div
      onClick={() => !isLocked && onStart(assessment)}
      className={[
        'flex items-center justify-between gap-4 px-5 py-4 rounded-xl border transition-all duration-150',
        isLocked
          ? 'bg-bgPrimary border-borderColor opacity-70 cursor-not-allowed'
          : 'bg-bgCard border-borderColor hover:border-borderHover hover:shadow-card cursor-pointer group',
      ].join(' ')}
    >
      {/* Left: icon + info */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Colored index circle */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: isLocked ? '#f5f5f5' : `${subjectColor}14`, border: `1px solid ${isLocked ? '#e5e7eb' : `${subjectColor}30`}` }}
        >
          <IconTarget size={16} style={{ color: isLocked ? '#c7c7c7' : subjectColor }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <h4 className="font-sans font-semibold text-[14px] text-textPrimary truncate group-hover:text-accentIndigo transition-colors">
              {assessment.title}
            </h4>
            <Badge variant={DIFF_BADGE[assessment.difficulty]}>
              {assessment.difficulty}
            </Badge>
          </div>
          <p className="text-[12px] text-textMuted leading-snug line-clamp-1">
            {assessment.desc}
          </p>
        </div>
      </div>

      {/* Right: meta + action */}
      <div className="flex items-center gap-5 flex-shrink-0">
        {/* Meta */}
        <div className="hidden sm:flex items-center gap-4 text-[12px] text-textMuted">
          <span className="flex items-center gap-1.5">
            <IconClock size={12} />
            {assessment.duration} min
          </span>
          <span className="flex items-center gap-1.5">
            <IconBook size={12} />
            {assessment.questions.length} Qs
          </span>
          <span className="flex items-center gap-1.5 text-accentAmber font-semibold">
            <IconCoin size={12} />
            +{assessment.coinsReward}
          </span>
        </div>

        {/* Action */}
        {isClosed ? (
          <span className="badge-closed text-[11px]">Closed</span>
        ) : isLocked ? (
          <span className="badge-upcoming text-[11px] flex items-center gap-1.5">
            <IconClock size={11} />
            Upcoming
          </span>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onStart(assessment); }}
            className="btn-primary btn-sm gap-1.5"
            style={{ background: subjectColor, borderColor: subjectColor }}
          >
            Start Test
            <IconChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Subject section ────────────────────────────────────────────
function SubjectSection({ subject, onStart, searchQuery }) {
  const windowStatus = getWindowStatus(subject.availableFrom, subject.availableTo);
  const timeLeft     = windowStatus === 'upcoming' ? formatTimeLeft(subject.availableFrom) : null;

  const SubjectIcon = SUBJECT_ICONS[subject.icon] || IconBook;

  const filtered = subject.assessments.filter(a => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q);
  });

  if (filtered.length === 0 && searchQuery) return null;

  return (
    <section className="mb-8">
      {/* ── Subject header ── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Subject icon badge */}
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${subject.accentColor}14`, border: `1.5px solid ${subject.accentColor}28` }}
          >
            <SubjectIcon size={20} style={{ color: subject.accentColor }} />
          </div>

          <div>
            {/* Course code */}
            <p className="label-caps" style={{ color: subject.accentColor }}>{subject.code}</p>
            {/* Subject name */}
            <h3 className="font-sans font-bold text-[17px] text-textPrimary leading-tight mt-0.5">
              {subject.shortName}
              <span className="ml-2 text-textMuted font-normal text-[14px]">—</span>
              <span className="ml-1 text-textMuted font-normal text-[14px]">{subject.name}</span>
            </h3>
          </div>
        </div>

        {/* Window status badge + time */}
        <div className="flex flex-col items-end gap-1.5">
          {windowStatus === 'open' && (
            <span className="badge-open flex items-center gap-1.5">
              <span className="live-dot w-1.5 h-1.5" />
              Window Open
            </span>
          )}
          {windowStatus === 'upcoming' && (
            <span className="badge-upcoming flex items-center gap-1.5">
              <IconClock size={11} />
              {timeLeft || 'Upcoming'}
            </span>
          )}
          {windowStatus === 'closed' && (
            <span className="badge-closed">Closed</span>
          )}
          <span className="text-[11px] text-textMuted flex items-center gap-1.5">
            <IconClock size={11} />
            {subject.scheduleLabel}
          </span>
        </div>
      </div>

      {/* ── Teacher row ── */}
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

      {/* ── Assessments list ── */}
      <div className="flex flex-col gap-2.5">
        {filtered.map(assessment => (
          <AssessmentRow
            key={assessment.id}
            assessment={assessment}
            windowStatus={windowStatus}
            onStart={onStart}
            subjectColor={subject.accentColor}
          />
        ))}
      </div>

      {/* ── Divider ── */}
      <div className="mt-8 divider" />
    </section>
  );
}

// ── Main View ─────────────────────────────────────────────────
export default function AssessmentsView({ subjects, onStart, searchQuery }) {
  const openCount = useMemo(() =>
    subjects.filter(s => getWindowStatus(s.availableFrom, s.availableTo) === 'open').length,
  [subjects]);

  const totalAssessments = useMemo(() =>
    subjects.reduce((acc, s) => acc + s.assessments.length, 0),
  [subjects]);

  return (
    <div className="animate-fadeIn">

      {/* ── Page header ── */}
      <div className="mb-8">
        <h2 className="font-sans font-bold text-[26px] text-textPrimary tracking-tight leading-tight mb-1">
          Today's Assessments
        </h2>
        <p className="text-[14px] text-textMuted">
          {totalAssessments} tests across {subjects.length} subjects
          {openCount > 0 && (
            <span className="ml-2 inline-flex items-center gap-1.5 text-accentEmerald font-semibold">
              <span className="live-dot w-1.5 h-1.5" />
              {openCount} window{openCount > 1 ? 's' : ''} open now
            </span>
          )}
        </p>
      </div>

      {/* ── Info callout ── */}
      <div
        className="flex items-start gap-3 px-5 py-4 rounded-xl mb-8"
        style={{ background: '#fff8e0', border: '1px solid #e6d5a8' }}
      >
        <IconClock size={18} className="text-accentAmber flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-semibold text-textPrimary mb-0.5">Time-Windowed Tests</p>
          <p className="text-[12px] text-textMuted leading-relaxed">
            Each test is only available during its assigned time window. Tests outside the window are locked and cannot be started.
            Check your schedule and be ready before the window opens.
          </p>
        </div>
      </div>

      {/* ── Subject sections ── */}
      {subjects.map(subject => (
        <SubjectSection
          key={subject.id}
          subject={subject}
          onStart={onStart}
          searchQuery={searchQuery}
        />
      ))}

      {/* ── Empty state ── */}
      {subjects.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-bgPrimary border border-borderColor flex items-center justify-center mx-auto mb-4">
            <IconBook size={28} className="text-textMuted" />
          </div>
          <h3 className="font-sans font-semibold text-textPrimary text-[16px] mb-2">No assessments today</h3>
          <p className="text-[13px] text-textMuted">Your teachers haven't assigned any tests yet.</p>
        </div>
      )}
    </div>
  );
}
