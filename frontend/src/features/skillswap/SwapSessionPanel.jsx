import { useState } from 'react';
import { IconCalendar, IconSend, IconX } from '../../components/ui/Icons';

const GOOGLE_MEET_NEW_URL = 'https://meet.google.com/new';

function formatMessageTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export default function SwapSessionPanel({
  session,
  onClose,
  onSendMessage,
  onSaveMeeting,
}) {
  const [message, setMessage] = useState('');
  const [meetingUrl, setMeetingUrl] = useState(session?.meetingUrl || '');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  if (!session) return null;

  const messages = session.messages || [];

  const handleSend = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;

    setBusy('message');
    setError('');
    try {
      await onSendMessage(session.id, message.trim());
      setMessage('');
    } catch (err) {
      setError(err.message || 'Could not send message.');
    } finally {
      setBusy('');
    }
  };

  const handleSaveMeeting = async () => {
    if (!meetingUrl.trim()) {
      setError('Paste a Google Meet link first.');
      return;
    }

    setBusy('meeting');
    setError('');
    try {
      await onSaveMeeting(session.id, meetingUrl.trim());
    } catch (err) {
      setError(err.message || 'Could not save meeting link.');
    } finally {
      setBusy('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center animate-overlay-in"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl mx-4 bg-bgCard border border-borderColor rounded-xl animate-modal-in max-h-[90vh] overflow-hidden shadow-glass flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-borderColor">
          <div>
            <h2 className="font-display font-bold text-base text-textPrimary leading-none">
              SkillSwap Session
            </h2>
            <p className="text-[11px] text-textMuted mt-1">
              Chat with {session.peerName} and coordinate your Google Meet.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-textMuted hover:text-textPrimary hover:bg-bgSecondary transition-colors"
          >
            <IconX size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] min-h-0">
          <div className="flex min-h-[420px] flex-col border-b border-borderColor lg:border-b-0 lg:border-r">
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-bgSecondary/40">
              {messages.length > 0 ? messages.map(item => (
                <div
                  key={item.id || `${item.senderName}-${item.createdAt}`}
                  className={`flex ${item.mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[78%] rounded-lg border px-3 py-2 ${item.mine ? 'bg-accentIndigo text-white border-accentIndigo' : 'bg-bgCard text-textPrimary border-borderColor'}`}>
                    {!item.mine && (
                      <p className="text-[10px] font-bold opacity-70 mb-1">{item.senderName}</p>
                    )}
                    <p className="text-sm leading-relaxed">{item.body}</p>
                    <p className={`mt-1 text-[10px] ${item.mine ? 'text-white/70' : 'text-textMuted'}`}>
                      {formatMessageTime(item.createdAt)}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center px-8">
                  <IconSend size={26} className="text-textMuted opacity-40 mb-3" />
                  <p className="text-sm font-semibold text-textPrimary">No messages yet</p>
                  <p className="mt-1 text-xs text-textMuted">
                    Start with timing, topic scope, and what each student should bring.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-borderColor">
              <input
                className="input"
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder="Write a SkillSwap message..."
                maxLength={1000}
              />
              <button type="submit" disabled={busy === 'message' || !message.trim()} className="btn-primary px-4 disabled:opacity-50">
                <IconSend size={15} />
                <span className="hidden sm:inline">{busy === 'message' ? 'Sending' : 'Send'}</span>
              </button>
            </form>
          </div>

          <aside className="p-4 flex flex-col gap-4">
            <div>
              <p className="label-caps">Swap</p>
              <p className="mt-2 text-sm font-bold text-textPrimary">{session.skill}</p>
              <p className="mt-2 text-xs leading-relaxed text-textMuted">{session.msg}</p>
            </div>

            <div className="rounded-lg border border-borderColor bg-bgSecondary/60 p-4">
              <div className="flex items-center gap-2">
                <IconCalendar size={16} className="text-accentIndigo" />
                <p className="text-xs font-bold text-textPrimary">Google Meet</p>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-textMuted">
                Create a Meet room, paste the shared link here, then both students can join from this session.
              </p>
              <a
                href={GOOGLE_MEET_NEW_URL}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary mt-3 w-full justify-center text-xs"
              >
                Create Google Meet
              </a>
              <input
                className="input mt-3 text-xs"
                value={meetingUrl}
                onChange={event => setMeetingUrl(event.target.value)}
                placeholder="https://meet.google.com/..."
              />
              <button
                type="button"
                onClick={handleSaveMeeting}
                disabled={busy === 'meeting'}
                className="btn-primary mt-2 w-full justify-center text-xs disabled:opacity-50"
              >
                {busy === 'meeting' ? 'Saving...' : 'Save Meet Link'}
              </button>
              {session.meetingUrl && (
                <a
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-accentEmerald/30 bg-accentEmerald/10 px-3 py-2 text-xs font-semibold text-accentEmerald hover:bg-accentEmerald/15"
                >
                  Join Saved Meet
                </a>
              )}
            </div>

            {session.proof?.fileName && (
              <div className="rounded-lg border border-accentEmerald/20 bg-accentEmerald/8 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-accentEmerald">Verified skill proof</p>
                <p className="mt-1 text-xs font-semibold text-textPrimary">{session.proof.fileName}</p>
                <p className="mt-1 text-[11px] text-textMuted">
                  {session.proof.proofType === 'certificate' ? 'Certificate' : 'Resume'} submitted before request.
                </p>
              </div>
            )}

            {error && <p className="text-[11px] font-semibold text-accentCrimson">{error}</p>}
          </aside>
        </div>
      </div>
    </div>
  );
}
