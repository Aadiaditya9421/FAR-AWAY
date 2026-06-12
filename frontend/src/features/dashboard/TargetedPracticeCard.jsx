import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { IconBook, IconCode, IconTarget } from '../../components/ui/Icons';

function DifficultyPill({ value }) {
  if (!value) return null;
  return <Badge variant={value}>{value}</Badge>;
}

export default function TargetedPracticeCard({
  practiceSet,
  loading = false,
  error = '',
  isLiveData = false,
  onStartAssessment,
  onGoToAssessments,
  onGoToCoding,
}) {
  if (loading && !practiceSet) {
    return (
      <div className="card p-5 text-sm text-textMuted">
        Loading live practice recommendations...
      </div>
    );
  }

  if (error && !practiceSet) {
    return (
      <div className="card p-5 space-y-3 text-sm">
        <p className="text-textMuted">Targeted practice is unavailable until live analytics reconnect.</p>
        <Button variant="secondary" onClick={onGoToAssessments}>
          View Assessments
        </Button>
      </div>
    );
  }

  if (!practiceSet) {
    return (
      <div className="card p-5 text-sm text-textMuted">
        {isLiveData
          ? 'Complete an assessment to unlock targeted practice from your live mastery profile.'
          : 'Sign in to unlock targeted practice from real assessment attempts.'}
      </div>
    );
  }

  const {
    targetTopic,
    reason,
    focusTopics = [],
    questionDrills = [],
    assessmentRecommendations = [],
    codingProblems = [],
    nextActions = [],
    isStarter = false,
  } = practiceSet;

  const primaryAssessment = assessmentRecommendations[0];
  const primaryMastery = focusTopics[0]?.masteryPercent;
  const title = isStarter ? `Start with ${targetTopic}` : `Focus on ${targetTopic}`;

  return (
    <div className="card p-5 space-y-4 relative overflow-hidden">
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-accentAmber via-accentIndigo to-accentEmerald" />

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accentAmber/10 text-accentAmber border border-accentAmber/20">
            <IconTarget size={18} />
          </div>
          <div>
            <span className="label-caps">{isStarter ? 'Starter Practice Set' : 'Targeted Practice Set'}</span>
            <h4 className="font-display font-bold text-base text-textPrimary mt-1">
              {title}
            </h4>
            <p className="text-xs text-textMuted mt-1 leading-relaxed">
              {reason}
            </p>
          </div>
        </div>

        {primaryMastery !== undefined && !isStarter && (
          <div className="text-left sm:text-right">
            <p className="font-display font-bold text-lg text-accentAmber">{primaryMastery}%</p>
            <p className="text-[10px] text-textMuted uppercase font-semibold tracking-wider">Mastery</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <IconBook size={14} className="text-accentIndigo" />
            <span className="label-caps">Drill Questions</span>
          </div>
          <div className="space-y-2">
            {questionDrills.slice(0, 3).map(question => (
              <div key={question.id} className="p-2.5 rounded-lg bg-bgSecondary/50 border border-borderColor">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-accentIndigo">L{question.difficulty}</span>
                  {question.subtopic && <span className="text-[10px] text-textMuted">{question.subtopic}</span>}
                </div>
                <p className="text-xs text-textPrimary leading-snug">{question.title}</p>
              </div>
            ))}
            {questionDrills.length === 0 && (
              <p className="text-xs text-textMuted">No question drills are available for this topic yet.</p>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IconTarget size={14} className="text-accentAmber" />
              <span className="label-caps">Recommended Quizzes</span>
            </div>
            {assessmentRecommendations.slice(0, 2).map(assessment => (
              <div key={assessment.id} className="p-2.5 rounded-lg bg-bgSecondary/50 border border-borderColor">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <DifficultyPill value={assessment.difficulty} />
                  {assessment.isAdaptive && (
                    <Badge className="bg-accentIndigo/10 text-accentIndigo border border-accentIndigo/20 font-semibold">
                      Adaptive
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-display font-semibold text-textPrimary">{assessment.title}</p>
              </div>
            ))}
            {assessmentRecommendations.length === 0 && (
              <p className="text-xs text-textMuted">No quiz recommendation is available for this topic yet.</p>
            )}
          </div>

          {codingProblems.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconCode size={14} className="text-accentEmerald" />
                <span className="label-caps">Coding Practice</span>
              </div>
              {codingProblems.slice(0, 2).map(problem => (
                <div key={problem.id} className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-bgSecondary/50 border border-borderColor">
                  <p className="text-xs font-display font-semibold text-textPrimary">{problem.title}</p>
                  <DifficultyPill value={problem.difficulty} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {nextActions.length > 0 && (
        <div className="p-3 rounded-lg bg-accentIndigo/5 border border-accentIndigo/10">
          <span className="label-caps text-accentIndigo">Tutor Plan</span>
          <ul className="mt-2 space-y-1 text-xs text-textPrimary">
            {nextActions.slice(0, 3).map(action => (
              <li key={action}>- {action}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        {primaryAssessment ? (
          <Button variant="primary" onClick={() => onStartAssessment(primaryAssessment)}>
            Start Focus Quiz
          </Button>
        ) : (
          <Button variant="secondary" onClick={onGoToAssessments}>
            View Assessments
          </Button>
        )}
        {codingProblems.length > 0 && (
          <Button variant="ghost" onClick={onGoToCoding}>
            Open Coding Practice
          </Button>
        )}
      </div>
    </div>
  );
}
