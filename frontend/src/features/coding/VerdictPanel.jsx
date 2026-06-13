import Badge from '../../components/ui/Badge';

const VERDICT_LABEL = {
  AC: 'Accepted',
  WA: 'Wrong Answer',
  TLE: 'Time Limit',
  RE: 'Runtime Error',
  CE: 'Compile Error',
};

const VERDICT_CLASS = {
  AC: 'text-accentEmerald bg-accentEmerald/8 border-accentEmerald/20',
  WA: 'text-accentAmber bg-accentAmber/8 border-accentAmber/20',
  TLE: 'text-accentAmber bg-accentAmber/8 border-accentAmber/20',
  RE: 'text-accentRose bg-accentRose/8 border-accentRose/20',
  CE: 'text-accentRose bg-accentRose/8 border-accentRose/20',
};

export default function VerdictPanel({ result, loading }) {
  if (loading) {
    return (
      <div className="card p-5 animate-pulse text-sm text-textMuted">
        Running code against test cases...
      </div>
    );
  }

  if (!result) {
    return (
      <div className="card p-5 text-sm text-textMuted">
        Run sample tests or submit your solution to see verdicts here.
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="label-caps">Overall Verdict</span>
          <p className="font-display font-bold text-lg text-textPrimary">
            {VERDICT_LABEL[result.verdict] || result.verdict}
          </p>
        </div>
        <Badge className={`${VERDICT_CLASS[result.verdict] || VERDICT_CLASS.WA} font-bold`}>
          {result.passedCount}/{result.totalCount} passed
        </Badge>
      </div>

      <div className="space-y-2.5">
        {(result.results || []).map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className={`rounded-lg border p-3 ${VERDICT_CLASS[item.verdict] || VERDICT_CLASS.WA}`}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-display font-bold">
                {item.hidden ? `Hidden Case ${index + 1}` : item.name}
              </p>
              <span className="text-[10px] font-bold">{item.verdict}</span>
            </div>

            {!item.hidden && (
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                <pre className="bg-bgCard/70 rounded p-2 overflow-x-auto"><strong>Input</strong>{`\n${item.stdin || '(empty)'}`}</pre>
                <pre className="bg-bgCard/70 rounded p-2 overflow-x-auto"><strong>Expected</strong>{`\n${item.expectedOutput || ''}`}</pre>
                <pre className="bg-bgCard/70 rounded p-2 overflow-x-auto"><strong>Output</strong>{`\n${item.stdout || ''}`}</pre>
              </div>
            )}

            {item.stderr && (
              <pre className="mt-2 text-[11px] bg-bgCard/70 rounded p-2 overflow-x-auto">{item.stderr}</pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
