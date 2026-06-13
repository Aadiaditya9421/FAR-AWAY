// src/features/teacher/CreateTestView.jsx
// Teacher/admin scheduled assessment creator with classroom targeting.

import { useEffect, useMemo, useState } from 'react';
import Button from '../../components/ui/Button';
import {
  IconPlus, IconBook, IconCode, IconDatabase,
  IconGlobe, IconServer, IconAtom, IconCheck, IconClock, IconUser,
} from '../../components/ui/Icons';
import { AssessmentService } from '../../services';

const SYLLABUS_TOPICS = {
  'sub-oops': [
    { id: 't-cl', name: 'Classes & Objects' },
    { id: 't-en', name: 'Encapsulation' },
    { id: 't-in', name: 'Inheritance' },
    { id: 't-po', name: 'Polymorphism' },
    { id: 't-ab', name: 'Abstract Classes' },
    { id: 't-if', name: 'Interfaces' },
  ],
  'sub-dsa': [
    { id: 't-ar', name: 'Arrays & Vectors' },
    { id: 't-ll', name: 'Linked Lists' },
    { id: 't-sq', name: 'Stacks & Queues' },
    { id: 't-so', name: 'Sorting Algorithms' },
    { id: 't-st', name: 'Search Trees' },
    { id: 't-gr', name: 'Graph Traversals' },
  ],
  'sub-webdev': [
    { id: 't-hs', name: 'HTML5 Semantics' },
    { id: 't-cg', name: 'CSS Grid Layout' },
    { id: 't-fx', name: 'Flexbox & Spacing' },
    { id: 't-dm', name: 'DOM Manipulations' },
    { id: 't-wa', name: 'Web APIs' },
  ],
  'sub-backend': [
    { id: 't-ra', name: 'REST Architectures' },
    { id: 't-em', name: 'Express Middlewares' },
    { id: 't-ps', name: 'PostgreSQL schemas' },
    { id: 't-au', name: 'Authentication tokens' },
    { id: 't-co', name: 'CORS controllers' },
  ],
};

const FALLBACK_SUBJECTS = [
  { id: 'sub-oops', shortName: 'OOPs Lab', name: 'Object Oriented Programming', icon: 'code' },
  { id: 'sub-dsa', shortName: 'DSA Lab', name: 'Data Structures & Algorithms', icon: 'database' },
  { id: 'sub-webdev', shortName: 'WebDev Lab', name: 'Web Development', icon: 'globe' },
  { id: 'sub-backend', shortName: 'Backend Lab', name: 'Backend Development', icon: 'server' },
];

const SUBJECT_ICONS = {
  code: IconCode,
  database: IconDatabase,
  globe: IconGlobe,
  server: IconServer,
  atom: IconAtom,
};

function toLocalDateTimeValue(date) {
  const pad = value => String(value).padStart(2, '0');
  return [
    date.getFullYear(),
    '-',
    pad(date.getMonth() + 1),
    '-',
    pad(date.getDate()),
    'T',
    pad(date.getHours()),
    ':',
    pad(date.getMinutes()),
  ].join('');
}

function getDefaultStart() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 30);
  date.setSeconds(0, 0);
  return toLocalDateTimeValue(date);
}

function getDefaultEnd() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 90);
  date.setSeconds(0, 0);
  return toLocalDateTimeValue(date);
}

function normalizeSubjectOptions(subjects = []) {
  const fromLive = subjects.map(subject => ({
    id: subject.id,
    shortName: subject.shortName,
    name: subject.name,
    icon: subject.icon,
  }));
  const byId = new Map([...FALLBACK_SUBJECTS, ...fromLive].map(subject => [subject.id, subject]));
  return [...byId.values()];
}

function topicFromSubject(subject = {}) {
  return String(subject.shortName || subject.name || 'OOPs').split(' ')[0];
}

function buildQuestions(selectedTopicObjects = []) {
  return selectedTopicObjects.map((topic, index) => ({
    type: 'mcq',
    title: `Diagnostic check for ${topic.name}`,
    description: `Select the best answer for ${topic.name}.`,
    options: [
      `It represents the primary concept of ${topic.name}`,
      `It is only a syntax shortcut for ${topic.name}`,
      `It is unrelated to program design`,
      `It is a runtime-only debugging feature`,
    ],
    correctAnswer: `It represents the primary concept of ${topic.name}`,
    points: 1,
    timeLimit: 0,
    id: `q-${topic.id || index}`,
  }));
}

function getStudentId(student) {
  return String(student?._id || student?.id || student || '');
}

function uniqueStudentsFromClassrooms(classrooms = []) {
  const byId = new Map();
  classrooms.forEach(classroom => {
    (classroom.students || []).forEach(student => {
      const id = getStudentId(student);
      if (id && !byId.has(id)) byId.set(id, student);
    });
  });
  return [...byId.values()].sort((a, b) => {
    const aName = [a.firstName, a.lastName].filter(Boolean).join(' ') || a.email || '';
    const bName = [b.firstName, b.lastName].filter(Boolean).join(' ') || b.email || '';
    return aName.localeCompare(bName);
  });
}

function ClassroomManagerPanel({ classrooms = [], onChanged }) {
  const [mode, setMode] = useState('create');
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    batch: '',
    branch: '',
    studentIds: [],
  });

  const allStudents = useMemo(() => uniqueStudentsFromClassrooms(classrooms), [classrooms]);
  const editableClassrooms = classrooms.filter(classroom => classroom.editable);

  const loadClassroom = (classroomId) => {
    const classroom = editableClassrooms.find(item => getStudentId(item) === classroomId || item.id === classroomId);
    if (!classroom) return;
    setMode('edit');
    setEditingId(classroom.id || classroom._id);
    setForm({
      name: classroom.name || '',
      batch: classroom.batch || '',
      branch: classroom.branch || '',
      studentIds: (classroom.students || []).map(getStudentId).filter(Boolean),
    });
    setMessage('');
  };

  const resetCreate = () => {
    setMode('create');
    setEditingId('');
    setForm({ name: '', batch: '', branch: '', studentIds: [] });
    setMessage('');
  };

  const set = key => event => {
    setForm(prev => ({ ...prev, [key]: event.target.value }));
    setMessage('');
  };

  const toggleStudent = (studentId) => {
    setForm(prev => {
      const exists = prev.studentIds.includes(studentId);
      return {
        ...prev,
        studentIds: exists
          ? prev.studentIds.filter(id => id !== studentId)
          : [...prev.studentIds, studentId],
      };
    });
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage('Classroom name is required.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const payload = {
        name: form.name.trim(),
        batch: form.batch.trim(),
        branch: form.branch.trim(),
        studentIds: form.studentIds,
      };
      if (mode === 'edit' && editingId) {
        await AssessmentService.updateClassroom(editingId, payload);
        setMessage('Classroom updated.');
      } else {
        await AssessmentService.createClassroom(payload);
        setMessage('Classroom created.');
      }
      await onChanged?.();
      if (mode === 'create') resetCreate();
    } catch (err) {
      setMessage(err.message || 'Could not save classroom.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="label-caps">Teacher/Admin</span>
          <h3 className="font-display font-semibold text-sm text-textPrimary mt-1">Classroom Groups</h3>
        </div>
        <Button variant="secondary" size="sm" onClick={resetCreate}>New</Button>
      </div>

      {editableClassrooms.length > 0 && (
        <select
          className="input h-[38px]"
          value={editingId}
          onChange={event => loadClassroom(event.target.value)}
        >
          <option value="">Edit existing custom group</option>
          {editableClassrooms.map(classroom => (
            <option key={classroom.id} value={classroom.id}>
              {classroom.name} - {classroom.studentCount} students
            </option>
          ))}
        </select>
      )}

      <form onSubmit={handleSave} className="space-y-3">
        <input className="input h-[38px]" value={form.name} onChange={set('name')} placeholder="Classroom name" />
        <div className="grid grid-cols-2 gap-2">
          <input className="input h-[38px]" value={form.branch} onChange={set('branch')} placeholder="Branch" />
          <input className="input h-[38px]" value={form.batch} onChange={set('batch')} placeholder="Batch" />
        </div>

        <div className="max-h-44 overflow-y-auto rounded-lg border border-borderColor bg-bgSecondary/30 p-2 space-y-1.5">
          {allStudents.map(student => {
            const id = getStudentId(student);
            const checked = form.studentIds.includes(id);
            const name = [student.firstName, student.lastName].filter(Boolean).join(' ') || student.email;
            return (
              <label key={id} className="flex items-center justify-between gap-2 p-2 rounded-md hover:bg-bgCard cursor-pointer">
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-textPrimary truncate">{name}</span>
                  <span className="block text-[10px] text-textMuted truncate">{student.email}</span>
                </span>
                <input type="checkbox" checked={checked} onChange={() => toggleStudent(id)} />
              </label>
            );
          })}
          {allStudents.length === 0 && (
            <p className="text-xs text-textMuted p-2">No student accounts found yet.</p>
          )}
        </div>

        {message && (
          <p className={`text-[11px] font-semibold ${message.includes('Could') || message.includes('required') ? 'text-accentCrimson' : 'text-accentEmerald'}`}>
            {message}
          </p>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={saving || !form.name.trim()}>
          {saving ? 'Saving...' : mode === 'edit' ? 'Update Classroom' : 'Create Classroom'}
        </Button>
      </form>

      <p className="text-[10px] text-textMuted leading-relaxed">
        Custom groups are editable. Profile groups from student batch/branch remain read-only.
      </p>
    </div>
  );
}

export default function CreateTestView({
  subjects = [],
  classrooms = [],
  existingAssessments = [],
  onCreateTest,
  onClassroomsChanged,
}) {
  const subjectOptions = useMemo(() => normalizeSubjectOptions(subjects), [subjects]);
  const [selectedSubId, setSelectedSubId] = useState(subjectOptions[0]?.id || 'sub-oops');
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testDuration, setTestDuration] = useState('30');
  const [difficulty, setDifficulty] = useState('medium');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [availableFrom, setAvailableFrom] = useState(getDefaultStart);
  const [availableTo, setAvailableTo] = useState(getDefaultEnd);
  const [assignmentMode, setAssignmentMode] = useState('class');
  const [selectedClassId, setSelectedClassId] = useState(classrooms[0]?.id || '');
  const [sourceAssessmentId, setSourceAssessmentId] = useState(existingAssessments[0]?.id || '');
  const [defaulterReport, setDefaulterReport] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const currentSubject = subjectOptions.find(subject => subject.id === selectedSubId) || subjectOptions[0] || FALLBACK_SUBJECTS[0];
  const currentTopics = useMemo(() => SYLLABUS_TOPICS[selectedSubId] || [], [selectedSubId]);
  const effectiveClassId = selectedClassId || classrooms[0]?.id || '';
  const effectiveSourceAssessmentId = sourceAssessmentId || existingAssessments[0]?.id || '';
  const selectedClassroom = classrooms.find(classroom => classroom.id === effectiveClassId) || classrooms[0] || null;
  const selectedTopicObjects = currentTopics.filter(topic => selectedTopics.includes(topic.id));
  const hasClassrooms = classrooms.length > 0;
  const canUseDefaulters = existingAssessments.length > 0;

  useEffect(() => {
    if (assignmentMode !== 'defaulters' || !effectiveSourceAssessmentId) return undefined;

    let active = true;
    AssessmentService.assignmentReport(effectiveSourceAssessmentId)
      .then(report => {
        if (active) setDefaulterReport(report);
      })
      .catch(() => {
        if (active) setDefaulterReport({ error: true });
      });

    return () => {
      active = false;
    };
  }, [assignmentMode, effectiveSourceAssessmentId]);

  const handleToggleTopic = (topicId) => {
    setSelectedTopics(prev =>
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId],
    );
  };

  const handleSubjectChange = (subId) => {
    setSelectedSubId(subId);
    setSelectedTopics([]);
  };

  const buildAssignment = () => {
    if (assignmentMode === 'all') return { mode: 'all' };
    if (assignmentMode === 'defaulters') {
      return {
        mode: 'defaulters',
        sourceAssessmentId: effectiveSourceAssessmentId,
      };
    }
    return {
      mode: 'class',
      batch: selectedClassroom?.batch || '',
      branch: selectedClassroom?.branch || '',
      classroomId: selectedClassroom?.source === 'custom' ? (selectedClassroom._id || selectedClassroom.id) : null,
    };
  };

  const canSubmit = Boolean(
    testTitle.trim()
    && selectedTopics.length > 0
    && availableFrom
    && availableTo
    && new Date(availableTo).getTime() > new Date(availableFrom).getTime()
    && (
      assignmentMode === 'all'
      || (assignmentMode === 'class' && selectedClassroom)
      || (assignmentMode === 'defaulters' && effectiveSourceAssessmentId)
    ),
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || publishing) return;

    setPublishing(true);
    try {
      await onCreateTest({
        title: testTitle.trim(),
        description: testDescription.trim() || `Scheduled ${currentSubject.shortName} assessment.`,
        topic: topicFromSubject(currentSubject),
        difficulty,
        duration: Number(testDuration) || 30,
        coinsReward: selectedTopics.length * 10,
        availableFrom: new Date(availableFrom).toISOString(),
        availableTo: new Date(availableTo).toISOString(),
        assignment: buildAssignment(),
        questions: buildQuestions(selectedTopicObjects),
      }, selectedSubId);

      setTestTitle('');
      setTestDescription('');
      setSelectedTopics([]);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="animate-fadeIn space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="font-sans font-bold text-[26px] text-textPrimary tracking-tight leading-tight mb-1">
          Schedule Class Assessment
        </h2>
        <p className="text-[14px] text-textMuted">
          Create a timed assessment, assign it to a classroom group, or send a follow-up only to defaulters.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        <form onSubmit={handleSubmit} className="card p-6 border-borderColor bg-bgCard space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="label-caps">Assessment Title</label>
              <input
                type="text"
                placeholder="e.g. DSA Lab - Linked List Remedial Test"
                value={testTitle}
                onChange={event => setTestTitle(event.target.value)}
                className="input h-[42px]"
                required
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="label-caps">Instructions</label>
              <textarea
                value={testDescription}
                onChange={event => setTestDescription(event.target.value)}
                placeholder="Add classroom instructions, allowed resources, or retest context."
                rows={3}
                className="input min-h-[88px] py-3 resize-none"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="label-caps">Subject</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {subjectOptions.map(subject => {
                const Icon = SUBJECT_ICONS[subject.icon] || IconBook;
                const selected = subject.id === selectedSubId;

                return (
                  <button
                    type="button"
                    key={subject.id}
                    onClick={() => handleSubjectChange(subject.id)}
                    className={[
                      'p-3.5 rounded-lg border flex flex-col items-center justify-center gap-2 transition-all duration-150 text-center',
                      selected
                        ? 'border-accentIndigo bg-accentIndigo/[0.04] text-accentIndigo'
                        : 'bg-bgSecondary/20 border-borderColor hover:border-borderHover text-textMuted',
                    ].join(' ')}
                  >
                    <Icon size={18} />
                    <span className="text-[11px] font-semibold text-textPrimary font-display leading-tight">
                      {subject.shortName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center gap-3">
              <label className="label-caps">Syllabus Topics</label>
              <span className="text-[11px] text-textMuted">{selectedTopics.length} selected</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentTopics.map(topic => {
                const selected = selectedTopics.includes(topic.id);
                return (
                  <button
                    type="button"
                    key={topic.id}
                    onClick={() => handleToggleTopic(topic.id)}
                    className={[
                      'px-4 py-3 rounded-lg border flex items-center justify-between text-left transition-all duration-150',
                      selected
                        ? 'border-accentIndigo bg-accentIndigo/[0.03]'
                        : 'bg-bgCard border-borderColor hover:border-borderHover',
                    ].join(' ')}
                  >
                    <span className="text-xs font-semibold text-textPrimary font-display">{topic.name}</span>
                    <span className={[
                      'w-4 h-4 rounded border flex items-center justify-center transition-all',
                      selected ? 'bg-accentIndigo border-accentIndigo text-white' : 'border-borderColor bg-bgSecondary',
                    ].join(' ')}>
                      {selected && <IconCheck size={11} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="label-caps">Difficulty</label>
              <select value={difficulty} onChange={event => setDifficulty(event.target.value)} className="input h-[42px]">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="label-caps">Duration</label>
              <select value={testDuration} onChange={event => setTestDuration(event.target.value)} className="input h-[42px]">
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="label-caps">Opens At</label>
              <input
                type="datetime-local"
                value={availableFrom}
                onChange={event => setAvailableFrom(event.target.value)}
                className="input h-[42px]"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="label-caps">Closes At</label>
              <input
                type="datetime-local"
                value={availableTo}
                onChange={event => setAvailableTo(event.target.value)}
                className="input h-[42px]"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="label-caps">Assign To</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'class', title: 'Whole Class', body: 'Assign to one classroom group.' },
                { value: 'defaulters', title: 'Defaulters', body: 'Only students who missed a previous assessment.' },
                { value: 'all', title: 'All Students', body: 'Publish to every student account.' },
              ].map(option => {
                const selected = assignmentMode === option.value;
                const disabled = option.value === 'class' ? !hasClassrooms : option.value === 'defaulters' ? !canUseDefaulters : false;
                return (
                  <button
                    type="button"
                    key={option.value}
                    disabled={disabled}
                    onClick={() => setAssignmentMode(option.value)}
                    className={[
                      'p-4 rounded-lg border text-left transition-all duration-150 disabled:opacity-45 disabled:cursor-not-allowed',
                      selected
                        ? 'border-accentIndigo bg-accentIndigo/[0.03]'
                        : 'border-borderColor bg-bgSecondary/30 hover:border-borderHover',
                    ].join(' ')}
                  >
                    <p className="text-xs font-bold text-textPrimary font-display">{option.title}</p>
                    <p className="text-[10px] text-textMuted mt-1 leading-relaxed">{option.body}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {assignmentMode === 'class' && (
            <div className="space-y-1.5">
              <label className="label-caps">Classroom Group</label>
              <select
                value={effectiveClassId}
                onChange={event => setSelectedClassId(event.target.value)}
                className="input h-[42px]"
                disabled={!hasClassrooms}
              >
                {!hasClassrooms && <option value="">No student classrooms found</option>}
                {classrooms.map(classroom => (
                  <option key={classroom.id} value={classroom.id}>
                    {classroom.name} - {classroom.studentCount} students
                  </option>
                ))}
              </select>
            </div>
          )}

          {assignmentMode === 'defaulters' && (
            <div className="space-y-1.5">
              <label className="label-caps">Missed Assessment Source</label>
              <select
                value={effectiveSourceAssessmentId}
                onChange={event => setSourceAssessmentId(event.target.value)}
                className="input h-[42px]"
                disabled={!canUseDefaulters}
              >
                {!canUseDefaulters && <option value="">No previous assessments found</option>}
                {existingAssessments.map(assessment => (
                  <option key={assessment.id} value={assessment.id}>
                    {assessment.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-textMuted">
                The backend resolves the defaulter list at publish time from real submissions.
              </p>
              {defaulterReport?.counts && (
                <div className="mt-3 p-3 rounded-lg border border-borderColor bg-bgSecondary/40">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-semibold text-textPrimary">Defaulter Preview</span>
                    <span className="text-[11px] text-accentAmber font-bold">
                      {defaulterReport.counts.defaulters} missed
                    </span>
                  </div>
                  <p className="text-[10px] text-textMuted mb-2">
                    {defaulterReport.counts.submitted}/{defaulterReport.counts.assigned} students have submitted the source assessment.
                  </p>
                  <div className="max-h-32 overflow-y-auto space-y-1.5">
                    {(defaulterReport.defaulters || []).slice(0, 8).map(student => (
                      <div key={student._id || student.id || student.email} className="text-[10px] text-textSecondary flex justify-between gap-2">
                        <span className="truncate">{[student.firstName, student.lastName].filter(Boolean).join(' ') || student.email}</span>
                        <span className="text-textMuted whitespace-nowrap">{student.branch || 'NA'} {student.batch || ''}</span>
                      </div>
                    ))}
                    {(defaulterReport.defaulters || []).length === 0 && (
                      <p className="text-[10px] text-textMuted">No defaulters found for this source assessment.</p>
                    )}
                  </div>
                </div>
              )}
              {defaulterReport?.error && (
                <p className="text-[10px] text-accentCrimson">
                  Could not load the defaulter preview. Publishing will still ask the backend to resolve it.
                </p>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-borderColor">
            <Button variant="primary" type="submit" fullWidth disabled={!canSubmit || publishing}>
              <IconPlus size={14} />
              {publishing ? 'Publishing...' : 'Schedule and Assign Assessment'}
            </Button>
          </div>
        </form>

        <aside className="space-y-4">
          <div className="card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <IconUser size={16} className="text-accentIndigo" />
              <h3 className="font-display font-semibold text-sm text-textPrimary">Classroom Group</h3>
            </div>

            {selectedClassroom ? (
              <>
                <div className="p-3 rounded-lg bg-bgSecondary/50 border border-borderColor">
                  <p className="font-display font-bold text-sm text-textPrimary">{selectedClassroom.name}</p>
                  <p className="text-[11px] text-textMuted mt-1">
                    {selectedClassroom.studentCount} students in this group
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                  {(selectedClassroom.students || []).map(student => (
                    <div key={student._id || student.id || student.email} className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-borderColor bg-bgSecondary/30">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-textPrimary truncate">
                          {[student.firstName, student.lastName].filter(Boolean).join(' ') || student.email}
                        </p>
                        <p className="text-[10px] text-textMuted truncate">{student.email}</p>
                      </div>
                      <span className="text-[10px] font-semibold text-textMuted whitespace-nowrap">
                        {student.branch || 'NA'} {student.batch || ''}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="p-4 rounded-lg border border-dashed border-borderColor text-center">
                <p className="text-xs text-textMuted">
                  No student classroom groups are available yet. Students need batch and branch values in their profiles.
                </p>
              </div>
            )}
          </div>

          <ClassroomManagerPanel classrooms={classrooms} onChanged={onClassroomsChanged} />

          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <IconClock size={16} className="text-accentAmber" />
              <h3 className="font-display font-semibold text-sm text-textPrimary">Publish Preview</h3>
            </div>
            <div className="space-y-2 text-xs text-textMuted">
              <p><strong className="text-textPrimary">Subject:</strong> {currentSubject.shortName}</p>
              <p><strong className="text-textPrimary">Questions:</strong> {selectedTopics.length}</p>
              <p><strong className="text-textPrimary">Mode:</strong> {assignmentMode}</p>
              <p><strong className="text-textPrimary">Reward:</strong> {selectedTopics.length * 10} coins</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
