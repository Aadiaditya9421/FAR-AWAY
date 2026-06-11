// src/features/skillswap/PeerCard.jsx
import React from 'react';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { IconCheck, IconArrowsSwap } from '../../components/ui/Icons';

export default function PeerCard({ peer, onRequest }) {
  return (
    <div className={`card p-5 transition-all duration-200 ${peer.matched ? 'border-accentEmerald/30 bg-accentEmerald/3' : 'card-interactive'}`}>
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar initials={peer.avatar} size="lg" ring={peer.matched} />
        <div>
          <h4 className="font-display font-semibold text-sm text-textPrimary">{peer.name}</h4>
          {peer.matched ? (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="live-dot" />
              <span className="text-[10px] font-bold text-accentEmerald">Connected</span>
            </div>
          ) : (
            <p className="text-[10px] text-textMuted mt-0.5">Available for swap</p>
          )}
        </div>
      </div>

      {/* Skill Trade */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-md bg-accentEmerald/6 border border-accentEmerald/15">
          <p className="text-[9px] label-caps text-accentEmerald mb-1">Can Teach</p>
          <p className="text-xs font-display font-semibold text-textPrimary">{peer.give}</p>
        </div>
        <div className="p-2.5 rounded-md bg-accentIndigo/6 border border-accentIndigo/15">
          <p className="text-[9px] label-caps text-accentIndigo mb-1">Wants to Learn</p>
          <p className="text-xs font-display font-semibold text-textPrimary">{peer.take}</p>
        </div>
      </div>

      {/* Bio */}
      <p className="text-[11px] text-textMuted leading-relaxed mb-4">{peer.bio}</p>

      {/* Action */}
      <Button
        variant={peer.matched ? 'success' : 'primary'}
        fullWidth
        onClick={() => onRequest(peer.id)}
        disabled={peer.matched}
      >
        {peer.matched ? (
          <span className="flex items-center justify-center gap-1.5">
            <IconCheck size={14} />
            Swap Connected
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            <IconArrowsSwap size={14} />
            Request Swap
          </span>
        )}
      </Button>
    </div>
  );
}
