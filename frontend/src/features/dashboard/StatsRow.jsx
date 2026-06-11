// src/features/dashboard/StatsRow.jsx
import React from 'react';
import StatCard from '../../components/ui/StatCard';
import { IconFlame, IconCoin, IconGlobe, IconZap } from '../../components/ui/Icons';

export default function StatsRow({ user, onCoinClick }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
        sublabel="Click for a bonus!"
      />
      <StatCard
        label="Global Rank"
        value={`#${user.rank}`}
        icon={<IconGlobe size={18} className="text-accentIndigo" />}
        accent="indigo"
      />
      <StatCard
        label="Total XP"
        value={`${user.xp} XP`}
        icon={<IconZap size={18} className="text-accentViolet" />}
        accent="violet"
        sublabel={`Level ${user.level}`}
      />
    </div>
  );
}
