import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { IconCheck, IconCode, IconFilter, IconFlame, IconPlay, IconPlus, Spinner } from '../../components/ui/Icons';
import { ProblemService } from '../../services';
import CodeEditor from './CodeEditor';
import VerdictPanel from './VerdictPanel';

const LANGUAGE_OPTIONS = [
  {
    id: 'javascript',
    label: 'JavaScript',
    monaco: 'javascript',
    starter: "const values = input.trim().split(/\\s+/).map(Number);\nconst [a, b] = values;\nconsole.log(a + b);",
  },
  {
    id: 'python',
    label: 'Python',
    monaco: 'python',
    starter: "import sys\n\nvalues = list(map(int, sys.stdin.read().strip().split()))\na, b = values\nprint(a + b)",
  },
  {
    id: 'cpp',
    label: 'C++',
    monaco: 'cpp',
    starter: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    long long a, b;\n    cin >> a >> b;\n    cout << a + b;\n    return 0;\n}",
  },
  {
    id: 'java',
    label: 'Java',
    monaco: 'java',
    starter: "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        long a = sc.nextLong();\n        long b = sc.nextLong();\n        System.out.println(a + b);\n    }\n}",
  },
];

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];

function languageLabel(id) {
  return LANGUAGE_OPTIONS.find(item => item.id === id)?.label || id;
}

function compilerLabel(provider) {
  if (provider === 'judge0') return 'Judge0';
  if (provider === 'piston') return 'Piston';
  if (provider === 'local-compiler') return 'Inbuilt';
  return 'Local JS';
}

function getStarterCode(problem, language) {
  const fromProblem = problem?.starterCode?.find(item => item.language === language)?.code;
  if (fromProblem) return fromProblem;
  return LANGUAGE_OPTIONS.find(item => item.id === language)?.starter || '';
}

function getEnabledLanguages(problem) {
  const supported = problem?.supportedLanguages?.length ? problem.supportedLanguages : ['javascript'];
  const runtime = problem?.runtimeLanguages?.length ? problem.runtimeLanguages : supported;
  return supported.filter(language => runtime.includes(language));
}

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ReviewSection({ title, items }) {
  if (!items?.length) return null;

  return (
    <div>
      <span className="label-caps">{title}</span>
      <ul className="mt-2 space-y-1.5 text-xs text-textSecondary">
        {items.map(item => (
          <li key={item} className="leading-relaxed">- {item}</li>
        ))}
      </ul>
    </div>
  );
}

function CodeReviewPanel({ review, loading, error }) {
  if (loading) {
    return (
      <div className="card p-5 animate-pulse text-sm text-textMuted">
        AI tutor is reviewing your code for correctness, edge cases, and judge formatting...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-5 border-accentRose/25 bg-accentRose/5 text-sm text-accentRose font-medium">
        {error}
      </div>
    );
  }

  if (!review) {
    return (
      <div className="card p-5 text-sm text-textMuted">
        Ask the AI tutor for a code review when you want feedback before submitting hidden tests.
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="label-caps">AI Code Review</span>
          <p className="text-sm text-textPrimary mt-1 leading-relaxed">{review.summary}</p>
        </div>
        <Badge variant="live">{review.source === 'gemini' ? 'Gemini' : 'Tutor'}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReviewSection title="Strengths" items={review.strengths} />
        <ReviewSection title="Issues" items={review.issues} />
        <ReviewSection title="Suggestions" items={review.suggestions} />
        <ReviewSection title="Next Steps" items={review.nextSteps} />
      </div>
    </div>
  );
}

function CreateProblemPanel({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    difficulty: 'easy',
    tags: 'arrays, warmup',
    statement: 'Read two integers from standard input and print their sum.',
    inputFormat: 'Two integers: a b',
    outputFormat: 'A single integer: a + b',
    constraints: '-10^9 <= a, b <= 10^9',
    sampleInput: '2 3',
    sampleOutput: '5',
    hiddenInput: '1000000000 -1',
    hiddenOutput: '999999999',
    languages: ['javascript', 'python', 'cpp', 'java'],
  });

  const set = key => event => {
    const value = event.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
    setError('');
  };

  const toggleLanguage = (language) => {
    setForm(prev => {
      const exists = prev.languages.includes(language);
      const next = exists
        ? prev.languages.filter(item => item !== language)
        : [...prev.languages, language];
      return { ...prev, languages: next.length ? next : ['javascript'] };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!form.statement.trim() || !form.sampleOutput.trim()) {
      setError('Statement and sample output are required.');
      return;
    }

    const slug = slugify(form.title);
    const supportedLanguages = form.languages;
    const starterCode = supportedLanguages.map(language => ({
      language,
      code: LANGUAGE_OPTIONS.find(item => item.id === language)?.starter || '',
    }));
    const testCases = [
      {
        name: 'Sample case',
        stdin: form.sampleInput,
        expectedOutput: form.sampleOutput,
        isHidden: false,
      },
    ];
    if (form.hiddenOutput.trim()) {
      testCases.push({
        name: 'Hidden case',
        stdin: form.hiddenInput,
        expectedOutput: form.hiddenOutput,
        isHidden: true,
      });
    }

    setSaving(true);
    setError('');
    try {
      await ProblemService.create({
        title: form.title.trim(),
        slug,
        statement: form.statement.trim(),
        difficulty: form.difficulty,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        inputFormat: form.inputFormat.trim(),
        outputFormat: form.outputFormat.trim(),
        constraints: form.constraints.split('\n').map(item => item.trim()).filter(Boolean),
        supportedLanguages,
        starterCode,
        testCases,
      });
      setOpen(false);
      onCreated?.();
    } catch (err) {
      setError(err.message || 'Could not create coding problem.');
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="secondary"
        size="sm"
        icon={<IconPlus size={13} />}
        onClick={() => setOpen(true)}
      >
        Add Problem
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="label-caps">Teacher/Admin Tool</span>
          <h4 className="font-display font-bold text-base text-textPrimary mt-1">Create Coding Problem</h4>
        </div>
        <button type="button" className="text-xs text-textMuted hover:text-textPrimary" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-accentRose/25 bg-accentRose/5 p-3 text-xs text-accentRose font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input className="input" value={form.title} onChange={set('title')} placeholder="Problem title" />
        <select className="input" value={form.difficulty} onChange={set('difficulty')}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <input className="input" value={form.tags} onChange={set('tags')} placeholder="Tags, comma separated" />
      <textarea className="input min-h-24 resize-y" value={form.statement} onChange={set('statement')} placeholder="Problem statement" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <textarea className="input resize-y" value={form.inputFormat} onChange={set('inputFormat')} placeholder="Input format" />
        <textarea className="input resize-y" value={form.outputFormat} onChange={set('outputFormat')} placeholder="Output format" />
      </div>

      <textarea className="input resize-y" value={form.constraints} onChange={set('constraints')} placeholder="One constraint per line" />

      <div className="flex flex-wrap gap-2">
        {LANGUAGE_OPTIONS.map(language => (
          <button
            key={language.id}
            type="button"
            onClick={() => toggleLanguage(language.id)}
            className={form.languages.includes(language.id) ? 'pill-tab-active' : 'pill-tab-idle'}
          >
            {language.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <textarea className="input resize-y" value={form.sampleInput} onChange={set('sampleInput')} placeholder="Sample stdin" />
        <textarea className="input resize-y" value={form.sampleOutput} onChange={set('sampleOutput')} placeholder="Sample expected output" />
        <textarea className="input resize-y" value={form.hiddenInput} onChange={set('hiddenInput')} placeholder="Hidden stdin" />
        <textarea className="input resize-y" value={form.hiddenOutput} onChange={set('hiddenOutput')} placeholder="Hidden expected output" />
      </div>

      <Button type="submit" variant="primary" disabled={saving} icon={saving ? <Spinner size={13} /> : <IconCheck size={13} />}>
        {saving ? 'Creating...' : 'Publish Problem'}
      </Button>
    </form>
  );
}

export default function CodingPracticeView({ isLoggedIn, onRequireAuth, userRole = 'student' }) {
  const [problems, setProblems] = useState([]);
  const [activeProblemId, setActiveProblemId] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [sourceCode, setSourceCode] = useState('');
  const [result, setResult] = useState(null);
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [error, setError] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [tagFilter, setTagFilter] = useState('');

  const canManageProblems = userRole === 'teacher' || userRole === 'admin';

  const loadProblems = async () => {
    setLoadingProblems(true);
    setError('');
    try {
      const query = difficultyFilter === 'all' ? '' : `?difficulty=${encodeURIComponent(difficultyFilter)}`;
      const data = await ProblemService.list(query);
      setProblems(data);
      const currentStillExists = data.some(problem => (problem._id || problem.id) === activeProblemId);
      const next = currentStillExists ? data.find(problem => (problem._id || problem.id) === activeProblemId) : data[0];
      if (next) {
        const enabled = getEnabledLanguages(next);
        const nextLanguage = enabled.includes(language) ? language : enabled[0] || 'javascript';
        setActiveProblemId(next._id || next.id);
        setLanguage(nextLanguage);
        setSourceCode(getStarterCode(next, nextLanguage));
      } else {
        setActiveProblemId('');
      }
    } catch (err) {
      setError(err.message || 'Could not load coding problems.');
    } finally {
      setLoadingProblems(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;

    async function load() {
      setLoadingProblems(true);
      setError('');
      try {
        const query = difficultyFilter === 'all' ? '' : `?difficulty=${encodeURIComponent(difficultyFilter)}`;
        const data = await ProblemService.list(query);
        if (!active) return;
        setProblems(data);
        const first = data[0];
        if (first) {
          const enabled = getEnabledLanguages(first);
          const firstLanguage = enabled[0] || 'javascript';
          setActiveProblemId(first._id || first.id);
          setLanguage(firstLanguage);
          setSourceCode(getStarterCode(first, firstLanguage));
        }
      } catch (err) {
        if (active) setError(err.message || 'Could not load coding problems.');
      } finally {
        if (active) setLoadingProblems(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [isLoggedIn, difficultyFilter]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let active = true;
    async function refreshProblems() {
      try {
        const query = difficultyFilter === 'all' ? '' : `?difficulty=${encodeURIComponent(difficultyFilter)}`;
        const data = await ProblemService.list(query);
        if (!active) return;
        setProblems(data);
      } catch (err) {
        if (active) setError(err.message || 'Could not refresh coding problems.');
      }
    }

    const handleDataChanged = (event) => {
      const scope = event.detail?.scope || 'all';
      if (scope === 'all' || scope === 'problems') {
        refreshProblems();
      }
    };

    window.addEventListener('skillpath:data-changed', handleDataChanged);
    return () => {
      active = false;
      window.removeEventListener('skillpath:data-changed', handleDataChanged);
    };
  }, [isLoggedIn, difficultyFilter]);

  const filteredProblems = useMemo(() => {
    const query = tagFilter.trim().toLowerCase();
    if (!query) return problems;
    return problems.filter(problem =>
      problem.title?.toLowerCase().includes(query)
      || problem.tags?.some(tag => tag.toLowerCase().includes(query))
      || problem.difficulty?.toLowerCase().includes(query),
    );
  }, [problems, tagFilter]);

  const activeProblem = useMemo(
    () => filteredProblems.find(problem => (problem._id || problem.id) === activeProblemId) || filteredProblems[0],
    [filteredProblems, activeProblemId],
  );

  const enabledLanguages = getEnabledLanguages(activeProblem);
  const visibleTestCount = activeProblem?.testCases?.length || 0;
  const hiddenTestCount = Math.max(0, (activeProblem?.totalTestCases || 0) - visibleTestCount);

  const handleSelectProblem = (problem) => {
    const enabled = getEnabledLanguages(problem);
    const nextLanguage = enabled[0] || 'javascript';
    setActiveProblemId(problem._id || problem.id);
    setLanguage(nextLanguage);
    setSourceCode(getStarterCode(problem, nextLanguage));
    setResult(null);
    setReview(null);
    setError('');
    setReviewError('');
  };

  const handleLanguageChange = (nextLanguage) => {
    if (!enabledLanguages.includes(nextLanguage)) return;
    setLanguage(nextLanguage);
    setSourceCode(getStarterCode(activeProblem, nextLanguage));
    setResult(null);
    setReview(null);
    setReviewError('');
  };

  const handleCodeChange = (value) => {
    setSourceCode(value);
    setReview(null);
    setReviewError('');
  };

  const execute = async (mode) => {
    if (!activeProblem) return;
    setLoading(true);
    setError('');
    try {
      const id = activeProblem._id || activeProblem.id;
      const data = mode === 'submit'
        ? await ProblemService.submit(id, { language, sourceCode })
        : await ProblemService.run(id, { language, sourceCode });
      setResult(data);
    } catch (err) {
      setError(err.message || 'Code execution failed.');
    } finally {
      setLoading(false);
    }
  };

  const requestReview = async () => {
    if (!activeProblem) return;
    if (!sourceCode.trim()) {
      setReviewError('Write some code before asking for a review.');
      return;
    }

    setReviewLoading(true);
    setReview(null);
    setReviewError('');

    try {
      const id = activeProblem._id || activeProblem.id;
      const data = await ProblemService.review(id, { language, sourceCode });
      setReview(data);
    } catch (err) {
      setReviewError(err.message || 'AI code review failed.');
    } finally {
      setReviewLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="animate-fadeIn card p-8 text-center flex flex-col items-center">
        <IconCode size={32} className="text-accentIndigo mb-3" />
        <h3 className="font-display font-bold text-xl text-textPrimary mb-2">Coding Practice</h3>
        <p className="text-sm text-textMuted max-w-md mb-5">
          Sign in to run code against sample tests, submit hidden cases, and build your problem-solving streak.
        </p>
        <Button variant="primary" onClick={onRequireAuth}>Sign in to code</Button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-2xl text-textPrimary tracking-tight">
            {canManageProblems ? 'Coding Problem Bank' : 'Coding Practice Arena'}
          </h3>
          <p className="text-sm text-textMuted mt-1">
            Solve curated judge problems with sample runs, hidden submissions, and AI code review.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="live">{activeProblem?.compilerProvider === 'local-js' ? 'Local JS compiler' : `${compilerLabel(activeProblem?.compilerProvider)} compiler`}</Badge>
          {canManageProblems && <CreateProblemPanel onCreated={loadProblems} />}
        </div>
      </div>

      {error && (
        <div className="card p-4 border-accentRose/25 bg-accentRose/5 text-sm text-accentRose font-medium">
          {error}
        </div>
      )}

      {canManageProblems && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {[
            { label: 'Problems', value: problems.length },
            { label: 'Runtime', value: compilerLabel(activeProblem?.compilerProvider) },
            { label: 'Visible Cases', value: visibleTestCount },
            { label: 'Hidden Cases', value: hiddenTestCount },
          ].map(item => (
            <div key={item.label} className="rounded-lg border border-borderColor bg-bgCard p-4">
              <p className="label-caps">{item.label}</p>
              <p className="mt-1 text-xl font-display font-bold text-textPrimary tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <aside className="lg:col-span-1 card p-4 space-y-4">
          <div className="flex items-center gap-2">
            <IconFilter size={15} className="text-accentIndigo" />
            <h4 className="font-display font-semibold text-sm text-textPrimary">Question Bank</h4>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DIFFICULTIES.map(item => (
              <button
                key={item}
                onClick={() => setDifficultyFilter(item)}
                className={difficultyFilter === item ? 'pill-tab-active' : 'pill-tab-idle'}
              >
                {item === 'all' ? 'All' : item}
              </button>
            ))}
          </div>

          <input
            className="input"
            value={tagFilter}
            onChange={event => setTagFilter(event.target.value)}
            placeholder="Search title, tag, level..."
          />

          {loadingProblems ? (
            <p className="text-xs text-textMuted animate-pulse">Loading problems...</p>
          ) : (
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {filteredProblems.map(problem => {
                const id = problem._id || problem.id;
                const selected = id === (activeProblem?._id || activeProblem?.id);
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectProblem(problem)}
                    className={`w-full text-left rounded-lg border p-3 transition-all ${
                      selected
                        ? 'border-accentIndigo bg-accentIndigo/5'
                        : 'border-borderColor hover:border-borderHover bg-bgCard'
                    }`}
                  >
                    <p className="text-xs font-display font-bold text-textPrimary">{problem.title}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={problem.difficulty}>{problem.difficulty}</Badge>
                      <span className="text-[10px] text-textMuted">{problem.tags?.slice(0, 2).join(', ')}</span>
                    </div>
                    <p className="mt-2 text-[10px] text-textMuted">
                      {(getEnabledLanguages(problem).map(languageLabel).join(', ')) || 'No compiler'}
                    </p>
                  </button>
                );
              })}
              {filteredProblems.length === 0 && (
                <div className="rounded-lg border border-borderColor bg-bgSecondary/70 p-4 text-xs text-textMuted">
                  No problems match the current filters.
                </div>
              )}
            </div>
          )}
        </aside>

        <section className="lg:col-span-3 space-y-5">
          {activeProblem ? (
            <>
              <div className="card p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h4 className="font-display font-bold text-lg text-textPrimary">{activeProblem.title}</h4>
                    <p className="text-sm text-textMuted mt-1 leading-relaxed">{activeProblem.statement}</p>
                  </div>
                  <Badge variant={activeProblem.difficulty}>{activeProblem.difficulty}</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-bgSecondary border border-borderColor">
                    <span className="label-caps">Input</span>
                    <p className="text-textSecondary mt-1">{activeProblem.inputFormat}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-bgSecondary border border-borderColor">
                    <span className="label-caps">Output</span>
                    <p className="text-textSecondary mt-1">{activeProblem.outputFormat}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-bgSecondary border border-borderColor">
                    <span className="label-caps">Limits</span>
                    <p className="text-textSecondary mt-1">{activeProblem.timeLimitMs}ms / {activeProblem.memoryLimitMb}MB</p>
                  </div>
                </div>

                {activeProblem.constraints?.length > 0 && (
                  <div>
                    <span className="label-caps">Constraints</span>
                    <ul className="mt-2 space-y-1 text-xs text-textMuted">
                      {activeProblem.constraints.map(item => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <span className="label-caps">Compiler Language</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LANGUAGE_OPTIONS.map(item => {
                      const enabled = enabledLanguages.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={!enabled}
                          onClick={() => handleLanguageChange(item.id)}
                          className={`${language === item.id ? 'pill-tab-active' : 'pill-tab-idle'} ${!enabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs text-textMuted">
                  {languageLabel(language)} - {activeProblem.compilerProvider === 'local-js' ? 'local sandbox' : `${compilerLabel(activeProblem.compilerProvider)} online judge`}
                </p>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    onClick={() => execute('run')}
                    disabled={loading || !enabledLanguages.includes(language)}
                    icon={loading ? <Spinner size={13} /> : <IconPlay size={13} />}
                    className="w-full sm:w-auto"
                  >
                    Run Samples
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => execute('submit')}
                    disabled={loading || !enabledLanguages.includes(language)}
                    icon={loading ? <Spinner size={13} /> : <IconCheck size={13} />}
                    className="w-full sm:w-auto"
                  >
                    Submit
                  </Button>
                  <Button
                    variant="amber"
                    onClick={requestReview}
                    disabled={loading || reviewLoading}
                    icon={reviewLoading ? <Spinner size={13} /> : <IconFlame size={13} />}
                    className="w-full sm:w-auto"
                  >
                    AI Review
                  </Button>
                </div>
              </div>

              <CodeEditor value={sourceCode} language={LANGUAGE_OPTIONS.find(item => item.id === language)?.monaco || language} onChange={handleCodeChange} />
              <VerdictPanel result={result} loading={loading} />
              <CodeReviewPanel review={review} loading={reviewLoading} error={reviewError} />
            </>
          ) : (
            <div className="card p-8 text-center text-sm text-textMuted">
              No coding problems are available yet.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
