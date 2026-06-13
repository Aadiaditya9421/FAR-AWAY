import React, { useState } from 'react';
import TopicPillGroup from './TopicPillGroup';
import LeaderboardTable from './LeaderboardTable';
import Badge from '../../components/ui/Badge';
import { IconTarget } from '../../components/ui/Icons';

export default function LeaderboardView({ leaderboards, currentUserName = 'John Doe' }) {
  const [topic, setTopic] = useState('DSA');
  const entries = leaderboards[topic] || [];
  const myEntry = entries.find(e => e.name === currentUserName);
  const myRank  = entries.indexOf(myEntry) + 1;

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-2xl text-textPrimary tracking-tight">
            Global Leaderboards
          </h3>
          <p className="text-sm text-textMuted mt-1">
            Rankings updated after every assessment submission.
          </p>
        </div>
        <TopicPillGroup active={topic} onChange={setTopic} />
      </div>

      {/* My rank summary */}
      {myEntry && (
        <div className="card p-4 mb-5 border-accentIndigo/20 bg-accentIndigo/4
                        flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accentIndigo/10 flex items-center justify-center flex-shrink-0">
              <IconTarget className="text-accentIndigo" size={20} />
            </div>
            <div>
              <p className="text-xs text-textMuted font-display">Your position in {topic}</p>
              <p className="font-display font-bold text-textPrimary">
                Rank <span className="text-accentIndigo">#{myRank}</span>
                {' '}— {myEntry.score}% score
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={myEntry.badge.toLowerCase()}>{myEntry.badge}</Badge>
            <span className="text-xs font-display font-bold text-accentViolet">
              {myEntry.xp} XP
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <LeaderboardTable entries={entries} currentUserName={currentUserName} />

      {/* Footer note */}
      <p className="text-[10px] text-textMuted mt-4 text-center">
        Rankings are computed from assessment accuracy across all {topic} tests.
        Complete more assessments to climb the board.
      </p>
    </div>
  );
}
