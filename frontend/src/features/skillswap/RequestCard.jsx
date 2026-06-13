// src/features/skillswap/RequestCard.jsx
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { IconCheck, IconX } from '../../components/ui/Icons';

export default function RequestCard({ request, onAccept, onIgnore }) {
  const isAccepted = request.status === 'accepted';

  return (
    <div className={`card p-4 border transition-all ${isAccepted ? 'border-accentEmerald/25 bg-accentEmerald/4' : 'hover:border-borderHover'}`}>
      <div className="flex items-start gap-3">
        <Avatar initials={request.sender.split(' ').map(x => x[0]).join('')} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="font-display font-semibold text-sm text-textPrimary">{request.sender}</p>
            <Badge variant={isAccepted ? 'live' : 'upcoming'}>
              {isAccepted ? 'Accepted' : 'Pending'}
            </Badge>
          </div>
          <p className="text-[10px] font-display font-semibold text-accentIndigo mb-2">
            {request.skillLabel || request.skill}
          </p>
          <p className="text-[11px] text-textMuted leading-relaxed">{request.msg}</p>
          {request.proof?.fileName && (
            <p className="mt-2 text-[10px] font-bold text-accentEmerald">
              Skill proof submitted: {request.proof.proofType === 'certificate' ? 'Certificate' : 'Resume'}
            </p>
          )}
        </div>
      </div>

      {!isAccepted && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-borderColor">
          <Button variant="success" size="sm" onClick={() => onAccept(request.id)} className="flex-grow flex items-center justify-center gap-1">
            <IconCheck size={13} />
            <span>Accept</span>
          </Button>
          <Button variant="danger" size="sm" onClick={() => onIgnore(request.id)} className="flex-grow flex items-center justify-center gap-1">
            <IconX size={13} />
            <span>Decline</span>
          </Button>
        </div>
      )}
    </div>
  );
}
