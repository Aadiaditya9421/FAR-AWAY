import { useState } from 'react';
import { IconArrowsSwap, IconX } from '../../components/ui/Icons';
import { buildVerificationProof, proofTypeLabel, validateProofFile } from './proofUtils';

export default function SwapRequestModal({ peer, onClose, onSubmit }) {
  const [message, setMessage] = useState(
    peer
      ? `I can help with ${peer.take || 'your topic'} and would like to learn ${peer.give || peer.targetTopic || 'your skill'}.`
      : '',
  );
  const [proofType, setProofType] = useState('resume');
  const [proofFile, setProofFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!peer) return null;

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;
    setProofFile(file);
    setError(validateProofFile(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const fileError = validateProofFile(proofFile);
    if (fileError) {
      setError(fileError);
      return;
    }
    if (!message.trim()) {
      setError('Add a short message for this student.');
      return;
    }

    setSubmitting(true);
    try {
      const verificationProof = await buildVerificationProof({ file: proofFile, proofType });
      await onSubmit(peer.id, { message: message.trim(), verificationProof });
      onClose();
    } catch (err) {
      setError(err.message || 'Could not send SkillSwap request.');
    } finally {
      setSubmitting(false);
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
      <div className="relative w-full max-w-lg mx-4 bg-bgCard border border-borderColor rounded-xl animate-modal-in max-h-[90vh] overflow-y-auto shadow-glass">
        <div className="flex items-center justify-between px-6 py-5 border-b border-borderColor">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-accentIndigo/10 border border-accentIndigo/20 text-accentIndigo">
              <IconArrowsSwap size={16} />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-textPrimary leading-none">
                Request SkillSwap
              </h2>
              <p className="text-[11px] text-textMuted mt-0.5">
                Verify the skill you will teach before sending
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-textMuted hover:text-textPrimary hover:bg-bgSecondary transition-all duration-150"
          >
            <IconX size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          <div className="rounded-lg border border-borderColor bg-bgSecondary/60 p-3">
            <p className="text-xs font-bold text-textPrimary">{peer.name}</p>
            <p className="mt-1 text-[11px] text-textMuted">
              You teach {peer.take || 'a peer topic'} and learn {peer.give || peer.targetTopic || 'their skill'}.
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="label-caps">Message</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={message}
              onChange={event => setMessage(event.target.value)}
              maxLength={240}
            />
            <p className="text-[10px] text-textFaint text-right">{message.length}/240</p>
          </div>

          <div className="rounded-lg border border-borderColor bg-bgSecondary/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="label-caps">Verification proof</label>
                <p className="mt-1 text-[11px] text-textMuted leading-relaxed">
                  Upload a resume PDF or certificate related to the skill you will teach.
                </p>
              </div>
              <select
                className="input max-w-[150px] text-xs"
                value={proofType}
                onChange={event => setProofType(event.target.value)}
              >
                <option value="resume">Resume</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="mt-3 block w-full text-xs text-textMuted file:mr-3 file:rounded-md file:border file:border-borderColor file:bg-bgCard file:px-3 file:py-2 file:text-xs file:font-semibold file:text-textPrimary hover:file:bg-bgSecondary"
            />
            {proofFile && (
              <p className="mt-2 text-[11px] font-semibold text-textSecondary">
                {proofTypeLabel(proofType)} selected: {proofFile.name}
              </p>
            )}
          </div>

          {error && <p className="text-[11px] font-semibold text-accentCrimson">{error}</p>}

          <div className="flex gap-3 pt-1 border-t border-borderColor">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {submitting ? 'Sending...' : 'Send Verified Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
