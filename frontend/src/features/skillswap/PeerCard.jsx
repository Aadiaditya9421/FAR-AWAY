// src/features/skillswap/PeerCard.jsx
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import { IconCheck, IconArrowsSwap, IconClock } from '../../components/ui/Icons';

export default function PeerCard({ peer, onRequest }) {
  const isDisabled = peer.matched || peer.requested;

  return (
    <div className={`card p-5 transition-all duration-200 ${peer.matched ? 'border-accentEmerald/30 bg-accentEmerald/3' : 'card-interactive'}`}>
      {/* Avatar + Name */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar initials={peer.avatar} size="lg" ring={peer.matched} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-display font-semibold text-sm text-textPrimary">{peer.name}</h4>
            {peer.recommended && (
              <span className="text-[9px] font-bold text-accentAmber bg-accentAmber/10 border border-accentAmber/20 px-2 py-0.5 rounded-full">
                {peer.score}% match
              </span>
            )}
          </div>
          {peer.matched ? (
            <div className="flex items-center gap-1 mt-0.5">
              <span className="live-dot" />
              <span className="text-[10px] font-bold text-accentEmerald">Connected</span>
            </div>
          ) : peer.requested ? (
            <p className="text-[10px] text-accentAmber mt-0.5">
              Request pending
            </p>
          ) : peer.recommended ? (
            <p className="text-[10px] text-accentAmber mt-0.5">
              Recommended for {peer.targetTopic} mastery
            </p>
          ) : (
            <p className="text-[10px] text-textMuted mt-0.5">Available for swap</p>
          )}
        </div>
      </div>

      {/* Skill Trade */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
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

      {peer.recommended && peer.reasons?.length > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-accentAmber/5 border border-accentAmber/15">
          <p className="text-[9px] label-caps text-accentAmber mb-1">Why this match</p>
          <ul className="space-y-1">
            {peer.reasons.slice(0, 2).map(reason => (
              <li key={reason} className="text-[10px] text-textSecondary leading-relaxed">
                - {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action */}
      <Button
        variant={peer.matched ? 'success' : peer.requested ? 'secondary' : 'primary'}
        fullWidth
        onClick={() => onRequest(peer.id)}
        disabled={isDisabled}
      >
        {peer.matched ? (
          <span className="flex items-center justify-center gap-1.5">
            <IconCheck size={14} />
            Swap Connected
          </span>
        ) : peer.requested ? (
          <span className="flex items-center justify-center gap-1.5">
            <IconClock size={14} />
            Request Sent
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
