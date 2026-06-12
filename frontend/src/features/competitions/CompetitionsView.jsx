// src/features/competitions/CompetitionsView.jsx
import CompetitionCard from './CompetitionCard';
import { IconCoin, IconClock, IconCheck, IconSearch } from '../../components/ui/Icons';

export default function CompetitionsView({ competitions, onRegister, userCoins, searchQuery }) {
  const filtered = competitions.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q);
  });

  const live      = filtered.filter(c => c.status === 'live');
  const upcoming  = filtered.filter(c => c.status === 'upcoming');
  const completed = filtered.filter(c => c.status === 'completed');

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-display font-bold text-2xl text-textPrimary tracking-tight">
          Weekly Arena Challenges
        </h3>
        <p className="text-sm text-textMuted mt-1">
          Compete against peers for real coin prizes. Entry fees go into the prize pool.
        </p>
      </div>

      {/* Coin balance reminder */}
      <div className="card p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-accentAmber/10 flex items-center justify-center flex-shrink-0 text-accentAmber">
            <IconCoin size={20} />
          </div>
          <div>
            <p className="text-xs text-textMuted font-display">Available balance</p>
            <p className="font-display font-bold text-accentAmber">{userCoins} coins</p>
          </div>
        </div>
        <p className="text-[11px] text-textMuted max-w-xs text-right hidden sm:block">
          Earn coins by completing assessments and scoring above 80%.
        </p>
      </div>

      {/* Live */}
      {live.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="live-dot" />
            <h4 className="font-display font-semibold text-sm text-textPrimary uppercase tracking-wider">
              Live Now
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {live.map(c => (
              <CompetitionCard key={c.id} comp={c} onRegister={onRegister} userCoins={userCoins} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <IconClock size={15} className="text-accentCyan" />
            <h4 className="font-display font-semibold text-sm text-textPrimary uppercase tracking-wider">
              Upcoming
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.map(c => (
              <CompetitionCard key={c.id} comp={c} onRegister={onRegister} userCoins={userCoins} />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <IconCheck size={15} className="text-textMuted" />
            <h4 className="font-display font-semibold text-sm text-textPrimary uppercase tracking-wider">
              Completed
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {completed.map(c => (
              <CompetitionCard key={c.id} comp={c} onRegister={onRegister} userCoins={userCoins} />
            ))}
          </div>
        </section>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center justify-center">
          <IconSearch size={28} className="text-textMuted mb-2 opacity-40" />
          <p className="text-sm text-textMuted">No competitions match your search.</p>
        </div>
      )}
    </div>
  );
}
