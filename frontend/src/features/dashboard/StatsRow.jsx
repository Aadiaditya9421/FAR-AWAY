// src/features/dashboard/StatsRow.jsx
import StatCard from '../../components/ui/StatCard';
import { IconFlame, IconCoin, IconGlobe, IconZap } from '../../components/ui/Icons';

export default function StatsRow({ user, onCoinClick, isPreview = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Daily Streak"
        value={`${user.streak} Days`}
        icon={<IconFlame size={18} className="text-textSecondary" />}
        accent="default"
      />
      <StatCard
        label="Coins Balance"
        value={`${user.coins}`}
        icon={<IconCoin size={18} className="text-accentAmber" />}
        accent="amber"
        onClick={onCoinClick}
        sublabel="Daily claim"
      />
      <StatCard
        label="Global Rank"
        value={isPreview ? 'Hidden' : `#${user.rank || 0}`}
        icon={<IconGlobe size={18} className="text-accentIndigo" />}
        accent="indigo"
        sublabel={isPreview ? 'Sign in' : 'Live rank'}
      />
      <StatCard
        label="Total XP"
        value={isPreview ? 'Hidden' : `${user.xp || 0} XP`}
        icon={<IconZap size={18} className="text-accentViolet" />}
        accent="violet"
        sublabel={isPreview ? 'Sign in' : `Level ${user.level || 1}`}
      />
    </div>
  );
}
