import { useCallback, useEffect, useMemo, useState } from 'react';
import { CoinService } from '../../services';
import { IconClock, IconCoin, IconX, Spinner } from '../../components/ui/Icons';

function formatDate(value) {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function transactionTone(type) {
  return type === 'debit'
    ? {
      sign: '-',
      amount: 'text-accentCrimson',
      badge: 'bg-accentCrimson/8 border-accentCrimson/20 text-accentCrimson',
    }
    : {
      sign: '+',
      amount: 'text-accentEmerald',
      badge: 'bg-accentEmerald/8 border-accentEmerald/20 text-accentEmerald',
    };
}

export default function CoinHistoryModal({ isOpen, onClose, currentBalance = 0 }) {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [balanceData, transactionData] = await Promise.all([
        CoinService.balance(),
        CoinService.transactions('?page=1&limit=25'),
      ]);
      setBalance(balanceData);
      setTransactions(Array.isArray(transactionData) ? transactionData : []);
    } catch (err) {
      setError(err.message || 'Could not load coin history.');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = window.setTimeout(loadHistory, 0);
    return () => window.clearTimeout(timer);
  }, [isOpen, loadHistory]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleDataChanged = (event) => {
      const scope = event.detail?.scope || 'all';
      if (scope === 'all' || scope === 'account') {
        loadHistory();
      }
    };

    window.addEventListener('faraway:data-changed', handleDataChanged);
    return () => window.removeEventListener('faraway:data-changed', handleDataChanged);
  }, [isOpen, loadHistory]);

  const totals = useMemo(() => ({
    current: balance?.coinsBalance ?? currentBalance,
    earned: balance?.totalCoinsEarned ?? 0,
  }), [balance, currentBalance]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center animate-overlay-in p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-bgCard border border-borderColor rounded-xl animate-modal-in max-h-[90vh] overflow-hidden shadow-glass flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 sm:px-6 py-5 border-b border-borderColor">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-accentAmber/10 border border-accentAmber/20 text-accentAmber">
              <IconCoin size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="font-display font-bold text-base text-textPrimary leading-none">
                Coin Balance History
              </h2>
              <p className="text-[11px] text-textMuted mt-1">
                Latest rewards, spends, and running balance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-textMuted hover:text-textPrimary hover:bg-bgSecondary transition-all"
            aria-label="Close coin history"
          >
            <IconX size={15} />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            <div className="rounded-lg bg-bgSecondary border border-borderColor p-4">
              <p className="label-caps">Current Balance</p>
              <p className="mt-2 text-3xl font-display font-bold text-accentAmber tabular-nums">
                {totals.current}
              </p>
            </div>
            <div className="rounded-lg bg-bgSecondary border border-borderColor p-4">
              <p className="label-caps">Total Earned</p>
              <p className="mt-2 text-3xl font-display font-bold text-textPrimary tabular-nums">
                {totals.earned}
              </p>
            </div>
          </div>

          {loading && (
            <div className="rounded-lg border border-borderColor bg-bgSecondary/70 p-8 flex items-center justify-center gap-2 text-sm text-textMuted">
              <Spinner size={16} />
              Loading coin history...
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-accentCrimson/25 bg-accentCrimson/5 p-4 text-sm text-accentCrimson font-medium">
              {error}
            </div>
          )}

          {!loading && !error && transactions.length === 0 && (
            <div className="rounded-lg border border-borderColor bg-bgSecondary/70 p-8 text-center">
              <IconClock size={22} className="text-textMuted mx-auto mb-2" />
              <p className="text-sm font-display font-semibold text-textPrimary">No coin activity yet</p>
              <p className="text-xs text-textMuted mt-1">Complete assessments or claim your daily bonus to start building history.</p>
            </div>
          )}

          {!loading && !error && transactions.length > 0 && (
            <div className="rounded-lg border border-borderColor overflow-hidden">
              <div className="hidden sm:grid grid-cols-[1fr_92px_92px] gap-3 px-4 py-3 bg-bgSecondary border-b border-borderColor">
                <span className="label-caps">Activity</span>
                <span className="label-caps text-right">Amount</span>
                <span className="label-caps text-right">Balance</span>
              </div>

              <div className="divide-y divide-borderColor">
                {transactions.map((transaction) => {
                  const tone = transactionTone(transaction.type);
                  return (
                    <div
                      key={transaction._id || `${transaction.reason}-${transaction.createdAt}`}
                      className="grid grid-cols-1 sm:grid-cols-[1fr_92px_92px] gap-3 px-4 py-3 bg-bgCard"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[10px] font-bold uppercase tracking-wide rounded-full border px-2 py-0.5 ${tone.badge}`}>
                            {transaction.type || 'credit'}
                          </span>
                          <span className="text-[11px] text-textMuted">{formatDate(transaction.createdAt)}</span>
                        </div>
                        <p className="mt-1 text-sm font-semibold text-textPrimary truncate">
                          {transaction.reason || 'Coin transaction'}
                        </p>
                        {transaction.referenceType && (
                          <p className="text-[11px] text-textMuted mt-0.5 capitalize">
                            {transaction.referenceType.replace(/_/g, ' ')}
                          </p>
                        )}
                      </div>

                      <div className={`sm:text-right text-sm font-display font-bold tabular-nums ${tone.amount}`}>
                        {tone.sign}{transaction.amount || 0}
                      </div>

                      <div className="sm:text-right text-sm font-semibold text-textSecondary tabular-nums">
                        {transaction.balanceAfter ?? '-'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
