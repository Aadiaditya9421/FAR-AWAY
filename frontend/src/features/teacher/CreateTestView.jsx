// src/features/teacher/CreateTestView.jsx
// ─── Far Away — Syllabus-Based Adaptive Test Creator ───
// Enables faculty to select syllabus topics, specify constraints,
// and generate adaptive, personalized student tests with a simulated AI pipeline.

import React, { useState, useMemo } from 'react';
import Button from '../../components/ui/Button';
import {
  IconPlus, IconBook, IconCode, IconDatabase,
  IconGlobe, IconServer, IconAtom, IconCheck, Spinner,
} from '../../components/ui/Icons';

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

const SUBJECT_ICONS = {
  code:     IconCode,
  database: IconDatabase,
  globe:    IconGlobe,
  server:   IconServer,
  atom:     IconAtom,
};

export default function CreateTestView({ subjects, onCreateTest }) {
  const [selectedSubId, setSelectedSubId] = useState(subjects[0]?.id || '');
  const [testTitle, setTestTitle] = useState('');
  const [testDuration, setTestDuration] = useState('30');
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [adaptiveMode, setAdaptiveMode] = useState('ai-adaptive');
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState('');

  const currentTopics = useMemo(() => {
    return SYLLABUS_TOPICS[selectedSubId] || [];
  }, [selectedSubId]);

  const handleToggleTopic = (topicId) => {
    setSelectedTopics(prev =>
      prev.includes(topicId) ? prev.filter(id => id !== topicId) : [...prev, topicId]
    );
  };

  const handleSubjectChange = (subId) => {
    setSelectedSubId(subId);
    setSelectedTopics([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!testTitle.trim() || selectedTopics.length === 0) return;

    setGenerating(true);

    const steps = [
      'Mining previous class response histories...',
      'Mapping topic item response parameters...',
      'Synthesizing adaptive student question paths...',
      'Deploying personalized assessment structure...',
    ];

    let currentStep = 0;
    setGenStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setGenStep(steps[currentStep]);
      } else {
        clearInterval(interval);

        // Generate mock question variants based on selected topics
        const selectedTopicObjects = currentTopics.filter(t => selectedTopics.includes(t.id));
        const questions = selectedTopicObjects.map((t, idx) => ({
          id: `gen-q-${Date.now()}-${idx}`,
          type: 'mcq',
          text: `Adaptive Diagnostic variant for ${t.name}: Which statement describes this concept best in standard application development?`,
          options: [
            `It represents the primary definition of ${t.name}`,
            `It describes secondary side behaviors of ${t.name}`,
            `It details legacy implementations of ${t.name}`,
            `It represents a performance bug in ${t.name}`,
          ],
          correct: `It represents the primary definition of ${t.name}`,
        }));

        const newTest = {
          id: `gen-test-${Date.now()}`,
          title: testTitle.trim(),
          desc: `AI-synthesized diagnostic lab evaluation covering: ${selectedTopicObjects.map(t => t.name).join(', ')}.`,
          difficulty: adaptiveMode === 'ai-adaptive' ? 'medium' : 'hard',
          topic: subjects.find(s => s.id === selectedSubId)?.shortName.split(' ')[0] || 'Lab',
          duration: parseInt(testDuration) || 30,
          coinsReward: questions.length * 10,
          questions,
        };

        onCreateTest(newTest, selectedSubId);
        
        // Clear state
        setTestTitle('');
        setSelectedTopics([]);
        setGenerating(false);
        setGenStep('');
      }
    }, 800);
  };

  return (
    <div className="animate-fadeIn space-y-6 max-w-3xl mx-auto">
      {/* ── Page Header ── */}
      <div>
        <h2 className="font-sans font-bold text-[26px] text-textPrimary tracking-tight leading-tight mb-1">
          Create Adaptive Lab Test
        </h2>
        <p className="text-[14px] text-textMuted">
          Select syllabus topics to build a customized, adaptive test that matches each student's current learning level.
        </p>
      </div>

      <div className="card p-6 border-borderColor bg-bgCard">
        {generating ? (
          <div className="py-16 text-center space-y-4 flex flex-col items-center justify-center">
            <Spinner size={36} className="text-accentIndigo" />
            <h4 className="font-display font-semibold text-[15px] text-textPrimary animate-pulse">
              Synthesizing Adaptive Test
            </h4>
            <div className="max-w-xs p-3 bg-accentIndigo/4 border border-accentIndigo/15 rounded-lg text-center">
              <p className="text-[11px] text-accentIndigo font-semibold">
                {genStep}
              </p>
            </div>
            <p className="text-[10px] text-textMuted max-w-sm">
              Our simulated system compiles optimal diagnostic question paths from student accuracy data...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject Selection Grid */}
            <div className="space-y-3">
              <label className="label-caps">1. Select Lab Subject</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {subjects.map(sub => {
                  const Icon = SUBJECT_ICONS[sub.icon] || IconBook;
                  const isSelected = sub.id === selectedSubId;

                  return (
                    <div
                      key={sub.id}
                      onClick={() => handleSubjectChange(sub.id)}
                      className={[
                        'p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-150',
                        isSelected
                          ? 'border-accentIndigo bg-accentIndigo/[0.02] shadow-sm'
                          : 'bg-bgSecondary/20 border-borderColor hover:border-borderHover',
                      ].join(' ')}
                    >
                      <span className={isSelected ? 'text-accentIndigo' : 'text-textMuted'}>
                        <Icon size={18} />
                      </span>
                      <span className="text-[11px] font-semibold text-textPrimary font-display text-center leading-tight">
                        {sub.shortName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Topics Checkbox Grid */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="label-caps">2. Select Syllabus Topics</label>
                <span className="text-[11px] text-textMuted">
                  {selectedTopics.length} selected
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {currentTopics.map(topic => {
                  const isChecked = selectedTopics.includes(topic.id);

                  return (
                    <div
                      key={topic.id}
                      onClick={() => handleToggleTopic(topic.id)}
                      className={[
                        'px-4 py-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all duration-150 select-none',
                        isChecked
                          ? 'border-accentIndigo bg-accentIndigo/[0.01]'
                          : 'bg-bgCard border-borderColor hover:border-borderHover',
                      ].join(' ')}
                    >
                      <span className="text-xs font-semibold text-textPrimary font-display">
                        {topic.name}
                      </span>
                      <div className={[
                        'w-4 h-4 rounded border flex items-center justify-center transition-all',
                        isChecked
                          ? 'bg-accentIndigo border-accentIndigo text-white'
                          : 'border-borderColor bg-bgSecondary',
                      ].join(' ')}>
                        {isChecked && <IconCheck size={11} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Title & Timing Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="label-caps">3. Test Title</label>
                <input
                  type="text"
                  placeholder="e.g. OOPs Lab — Inheritance Special Test"
                  value={testTitle}
                  onChange={e => setTestTitle(e.target.value)}
                  className="input h-[42px]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="label-caps">4. Duration (min)</label>
                <select
                  value={testDuration}
                  onChange={e => setTestDuration(e.target.value)}
                  className="input h-[42px]"
                  style={{ appearance: 'none' }}
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                </select>
              </div>
            </div>

            {/* Mode selection */}
            <div className="space-y-2.5">
              <label className="label-caps">5. Gating & Adaptation Mode</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setAdaptiveMode('ai-adaptive')}
                  className={[
                    'p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col gap-1',
                    adaptiveMode === 'ai-adaptive'
                      ? 'border-accentIndigo bg-accentIndigo/[0.01]'
                      : 'bg-bgCard border-borderColor hover:border-borderHover',
                  ].join(' ')}
                >
                  <h5 className="text-[12px] font-bold text-textPrimary font-display">
                    AI Personalized Adaptive
                  </h5>
                  <p className="text-[10px] text-textMuted leading-relaxed">
                    Test adapts dynamically to each student's accuracy level and performance profile.
                  </p>
                </div>

                <div
                  onClick={() => setAdaptiveMode('static')}
                  className={[
                    'p-4 rounded-xl border cursor-pointer transition-all duration-150 flex flex-col gap-1',
                    adaptiveMode === 'static'
                      ? 'border-accentIndigo bg-accentIndigo/[0.01]'
                      : 'bg-bgCard border-borderColor hover:border-borderHover',
                  ].join(' ')}
                >
                  <h5 className="text-[12px] font-bold text-textPrimary font-display">
                    Standard Static Test
                  </h5>
                  <p className="text-[10px] text-textMuted leading-relaxed">
                    Standard diagnostic configuration. Every student receives the identical test question set.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-borderColor">
              <Button
                variant="primary"
                type="submit"
                fullWidth
                disabled={!testTitle.trim() || selectedTopics.length === 0}
              >
                <IconPlus size={14} />
                Generate and Publish Adaptive Test
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
