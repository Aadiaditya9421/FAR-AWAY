import { useEffect, useMemo, useState } from 'react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { IconCheck, IconCode, IconFlame, IconPlay, Spinner } from '../../components/ui/Icons';
import { ProblemService } from '../../services';
import CodeEditor from './CodeEditor';
import VerdictPanel from './VerdictPanel';

function getStarterCode(problem, language) {
  return problem?.starterCode?.find(item => item.language === language)?.code || '';
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

export default function CodingPracticeView({ isLoggedIn, onRequireAuth }) {
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

  useEffect(() => {
    if (!isLoggedIn) return;
    let active = true;

    async function loadProblems() {
      setLoadingProblems(true);
      setError('');
      try {
        const data = await ProblemService.list();
        if (!active) return;
        setProblems(data);
        const first = data[0];
        if (first) {
          const firstLanguage = first.supportedLanguages?.[0] || 'javascript';
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

    loadProblems();
    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return undefined;

    let active = true;
    async function refreshProblems() {
      try {
        const data = await ProblemService.list();
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

    window.addEventListener('faraway:data-changed', handleDataChanged);
    return () => {
      active = false;
      window.removeEventListener('faraway:data-changed', handleDataChanged);
    };
  }, [isLoggedIn]);

  const activeProblem = useMemo(
    () => problems.find(problem => (problem._id || problem.id) === activeProblemId),
    [problems, activeProblemId],
  );

  const handleSelectProblem = (problem) => {
    const nextLanguage = problem.supportedLanguages?.[0] || 'javascript';
    setActiveProblemId(problem._id || problem.id);
    setLanguage(nextLanguage);
    setSourceCode(getStarterCode(problem, nextLanguage));
    setResult(null);
    setReview(null);
    setError('');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-display font-bold text-2xl text-textPrimary tracking-tight">
            Coding Practice Arena
          </h3>
          <p className="text-sm text-textMuted mt-1">
            Run sample tests, submit hidden cases, and prepare for code-grading challenges.
          </p>
        </div>
        <Badge variant="live">Phase 5 Foundation</Badge>
      </div>

      {error && (
        <div className="card p-4 border-accentRose/25 bg-accentRose/5 text-sm text-accentRose font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <aside className="lg:col-span-1 card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <IconCode size={15} className="text-accentIndigo" />
            <h4 className="font-display font-semibold text-sm text-textPrimary">Problems</h4>
          </div>

          {loadingProblems ? (
            <p className="text-xs text-textMuted animate-pulse">Loading problems...</p>
          ) : (
            <div className="space-y-2">
              {problems.map(problem => {
                const id = problem._id || problem.id;
                const selected = id === activeProblemId;
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
                  </button>
                );
              })}
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
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <select
                  value={language}
                  onChange={e => {
                    setLanguage(e.target.value);
                    setSourceCode(getStarterCode(activeProblem, e.target.value));
                    setResult(null);
                    setReview(null);
                    setReviewError('');
                  }}
                  className="input sm:max-w-xs"
                >
                  {(activeProblem.supportedLanguages || ['javascript']).map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    onClick={() => execute('run')}
                    disabled={loading}
                    icon={loading ? <Spinner size={13} /> : <IconPlay size={13} />}
                    className="w-full sm:w-auto"
                  >
                    Run Samples
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => execute('submit')}
                    disabled={loading}
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

              <CodeEditor value={sourceCode} language={language} onChange={handleCodeChange} />
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
