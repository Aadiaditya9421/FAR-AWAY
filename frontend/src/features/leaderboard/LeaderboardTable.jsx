// src/features/leaderboard/LeaderboardTable.jsx
import React from 'react';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';

const MEDAL = ['🥇', '🥈', '🥉'];

function RankBadge({ rank }) {
  if (rank < 3) {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0">
        {MEDAL[rank]}
      </div>
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-full bg-bgSecondary border border-borderColor
                 flex items-center justify-center font-display font-bold text-xs text-textMuted flex-shrink-0"
    >
      {rank + 1}
    </div>
  );
}

export default function LeaderboardTable({ entries, currentUserName = 'John Doe' }) {
  return (
    <div className="card overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-borderColor bg-bgSecondary/50">
        <div className="col-span-1 label-caps">Rank</div>
        <div className="col-span-5 label-caps">Student</div>
        <div className="col-span-2 label-caps text-right">Score</div>
        <div className="col-span-2 label-caps text-right">XP</div>
        <div className="col-span-2 label-caps text-right">Level</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-borderColor">
        {entries.map((entry, idx) => {
          const isMe = entry.name === currentUserName;
          return (
            <div
              key={idx}
              className={`grid grid-cols-12 gap-2 px-4 py-3.5 items-center transition-all
                ${isMe    ? 'lb-row-current' :
                  idx === 0 ? 'lb-row-top1 hover:bg-accentAmber/8' :
                              'lb-row-normal'}`}
            >
              {/* Rank */}
              <div className="col-span-1">
                <RankBadge rank={idx} />
              </div>

              {/* Student */}
              <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                <Avatar initials={entry.avatar} size="sm" />
                <div className="min-w-0">
                  <p className={`text-sm font-display font-semibold truncate ${isMe ? 'text-accentIndigo' : 'text-textPrimary'}`}>
                    {entry.name}
                    {isMe && (
                      <span className="ml-2 text-[9px] font-bold text-accentIndigo bg-accentIndigo/10
                                       border border-accentIndigo/20 px-1.5 py-0.5 rounded-full">
                        YOU
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="col-span-2 text-right">
                <span className="font-display font-bold text-sm text-textPrimary">
                  {entry.score}%
                </span>
              </div>

              {/* XP */}
              <div className="col-span-2 text-right">
                <span className="text-xs text-accentViolet font-display font-semibold">
                  {entry.xp.toLocaleString()}
                </span>
              </div>

              {/* Badge */}
              <div className="col-span-2 flex justify-end">
                <Badge variant={entry.badge.toLowerCase()}>{entry.badge}</Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
