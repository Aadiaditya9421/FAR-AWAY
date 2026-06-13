// src/features/skillswap/SkillSwapView.jsx
import { useState } from 'react';
import PeerCard from './PeerCard';
import RequestCard from './RequestCard';
import PostSwapModal from './PostSwapModal';
import {
  IconPlus, IconArrowsSwap, IconGlobe,
  IconSearch, IconBell, IconUser,
} from '../../components/ui/Icons';

export default function SkillSwapView({
  skillSwap,
  onRequestSwap,
  onAccept,
  onIgnore,
  onCancel,
  onComplete,
  onPostSwap,
  searchQuery,
}) {
  const [showPostModal, setShowPostModal] = useState(false);

  const filteredMatches = (skillSwap.matches || []).filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) ||
           m.give.toLowerCase().includes(q) ||
           m.take.toLowerCase().includes(q);
  });
  const filteredRecommended = (skillSwap.recommended || []).filter(m => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return m.name.toLowerCase().includes(q) ||
           m.give.toLowerCase().includes(q) ||
           m.take.toLowerCase().includes(q) ||
           m.targetTopic?.toLowerCase().includes(q);
  });
  const suggestedMatches = filteredMatches;

  const pendingRequests = (skillSwap.requests || []).filter(r => r.status === 'pending').length;
  const myPostings = skillSwap.myPostings || [];
  const history = skillSwap.history || [];

  const statusClass = status => ({
    pending: 'bg-accentAmber/10 text-accentAmber border-accentAmber/20',
    accepted: 'bg-accentEmerald/10 text-accentEmerald border-accentEmerald/20',
    declined: 'bg-accentCrimson/10 text-accentCrimson border-accentCrimson/20',
    cancelled: 'bg-textMuted/10 text-textMuted border-borderColor',
    completed: 'bg-accentIndigo/10 text-accentIndigo border-accentIndigo/20',
  }[status] || 'bg-bgSecondary text-textMuted border-borderColor');

  const statusLabel = status => ({
    pending: 'Pending',
    accepted: 'Accepted',
    declined: 'Declined',
    cancelled: 'Cancelled',
    completed: 'Completed',
  }[status] || status);

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-display font-bold text-2xl text-textPrimary tracking-tight">
            SkillSwap Peer Network
          </h3>
          <p className="text-sm text-textMuted mt-1">
            Trade knowledge with friends, classmates, and other students.
          </p>
        </div>
        <button
          onClick={() => setShowPostModal(true)}
          className="btn-primary w-full sm:w-auto flex-shrink-0 gap-1.5"
          style={{ height: '38px', padding: '0 16px', borderRadius: '8px' }}
        >
          <IconPlus size={14} />
          <span>Post a Swap</span>
        </button>
      </div>

      <div className="card p-4 mb-6 bg-accentIndigo/4 border-accentIndigo/20">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-accentIndigo/10 flex items-center justify-center flex-shrink-0 text-accentIndigo">
            <IconArrowsSwap size={15} />
          </div>
          <div>
            <p className="text-xs font-display font-semibold text-textPrimary mb-1">How SkillSwap Works</p>
            <p className="text-[11px] text-textMuted leading-relaxed">
              Each peer offers a skill they can teach and one they want to learn.
              When you match, both students commit to short peer sessions. No coins required, just knowledge.
            </p>
          </div>
        </div>
      </div>

      {myPostings.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <IconUser size={15} className="text-accentViolet" />
            <h4 className="font-display font-semibold text-sm text-textPrimary">
              My Posted Swaps
              <span className="text-[10px] font-normal text-textMuted ml-1.5">({myPostings.length})</span>
            </h4>
          </div>
          <div className="flex flex-col gap-3">
            {myPostings.map(post => (
              <div
                key={post.id}
                className="card p-4 border-accentViolet/20 bg-accentViolet/4 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-accentEmerald/12 text-accentEmerald border border-accentEmerald/20">
                      Teach: {post.teach}
                    </span>
                    <span className="text-textFaint text-xs">to</span>
                    <span className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full bg-accentIndigo/12 text-accentIndigo border border-accentIndigo/20">
                      Learn: {post.learn}
                    </span>
                    <span className="ml-auto text-[10px] text-textMuted font-display font-semibold flex items-center gap-1">
                      <span className="live-dot w-1.5 h-1.5" /> Active
                    </span>
                  </div>
                  <p className="text-[11px] text-textMuted leading-relaxed">{post.msg}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {filteredRecommended.length > 0 && (
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-3">
                <IconUser size={15} className="text-accentAmber" />
                <h4 className="font-display font-semibold text-sm text-textPrimary">
                  Recommended Students
                  <span className="text-[10px] font-normal text-textMuted ml-1.5">
                    ranked by your weak topics
                  </span>
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRecommended.map(peer => (
                  <PeerCard key={peer.id} peer={peer} onRequest={onRequestSwap} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <IconSearch size={15} className="text-textSecondary" />
            <h4 className="font-display font-semibold text-sm text-textPrimary">
              Suggested Matches
              <span className="text-[10px] font-normal text-textMuted ml-1.5">
                ({suggestedMatches.length} available)
              </span>
            </h4>
          </div>

          {suggestedMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestedMatches.map(peer => (
                <PeerCard key={peer.id} peer={peer} onRequest={onRequestSwap} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card flex flex-col items-center justify-center">
              <IconGlobe size={28} className="text-textMuted mb-2 opacity-40" />
              <p className="text-sm text-textMuted">No peers match your search.</p>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <IconBell size={15} className="text-accentIndigo" />
            <h4 className="font-display font-semibold text-sm text-textPrimary">
              Incoming Requests
              {pendingRequests > 0 && (
                <span className="text-[10px] font-bold text-white bg-accentIndigo px-2 py-0.5 rounded-full ml-1.5">
                  {pendingRequests} new
                </span>
              )}
            </h4>
          </div>

          {(skillSwap.requests || []).length > 0 ? (
            <div className="flex flex-col gap-3">
              {(skillSwap.requests || []).map(req => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onAccept={onAccept}
                  onIgnore={onIgnore}
                />
              ))}
            </div>
          ) : (
            <div className="card p-6 text-center flex flex-col items-center justify-center">
              <IconBell size={24} className="text-textMuted mb-2 opacity-40" />
              <p className="text-xs text-textMuted">No incoming requests yet.</p>
            </div>
          )}

          {history.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <IconArrowsSwap size={15} className="text-accentEmerald" />
                <h4 className="font-display font-semibold text-sm text-textPrimary">
                  Swap History
                  <span className="text-[10px] font-normal text-textMuted ml-1.5">({history.length})</span>
                </h4>
              </div>
              <div className="flex flex-col gap-3">
                {history.map(item => (
                  <div key={item.id} className="card p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-bgSecondary border border-borderColor flex items-center justify-center text-[11px] font-bold text-textPrimary flex-shrink-0">
                        {item.avatar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] font-display font-semibold text-textPrimary truncate">
                            {item.peerName}
                          </p>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${statusClass(item.status)}`}>
                            {statusLabel(item.status)}
                          </span>
                        </div>
                        <p className="text-[10px] text-textMuted mt-0.5">
                          {item.direction} - {item.skill}
                        </p>
                        <p className="text-[11px] text-textMuted leading-relaxed mt-2">{item.msg}</p>
                      </div>
                    </div>

                    {(item.canCancel || item.canComplete) && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-borderColor">
                        {item.canComplete && (
                          <button
                            type="button"
                            onClick={() => onComplete?.(item.id)}
                            className="btn btn-primary text-xs px-3 py-1.5 rounded flex-1"
                          >
                            Mark Done
                          </button>
                        )}
                        {item.canCancel && (
                          <button
                            type="button"
                            onClick={() => onCancel?.(item.id)}
                            className="btn btn-secondary text-xs px-3 py-1.5 rounded flex-1"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {myPostings.length === 0 && (
            <div
              className="mt-4 card p-4 border-dashed border-accentViolet/25 bg-accentViolet/4 text-center cursor-pointer hover:border-accentViolet/50 hover:bg-accentViolet/8 transition-all duration-200 flex flex-col items-center"
              onClick={() => setShowPostModal(true)}
            >
              <IconArrowsSwap size={24} className="text-accentViolet mb-2 opacity-50" />
              <p className="text-xs font-display font-semibold text-textPrimary mb-1">
                Advertise Your Skills
              </p>
              <p className="text-[10px] text-textMuted leading-relaxed mb-3">
                Post what you can teach and what you want to learn to get matched faster.
              </p>
              <span className="text-[10px] text-accentViolet font-display font-bold">
                Post a Swap
              </span>
            </div>
          )}
        </div>
      </div>

      <PostSwapModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSubmit={onPostSwap}
      />
    </div>
  );
}
