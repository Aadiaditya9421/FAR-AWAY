// src/features/skillswap/PostSwapModal.jsx
// ─── SkillPath — Post a Skill Swap Request ───
// A focused modal for the user to advertise what they can teach + want to learn.

import { useState } from 'react';
import { IconArrowsSwap, IconX } from '../../components/ui/Icons';
import { buildVerificationProof, proofTypeLabel, validateProofFile } from './proofUtils';

const SKILL_SUGGESTIONS = [
  'React', 'Vue', 'Angular', 'TypeScript', 'JavaScript',
  'Node.js', 'Python', 'Django', 'SQL / PostgreSQL', 'MongoDB',
  'DSA Basics', 'System Design', 'CSS / Tailwind', 'Docker',
  'Machine Learning', 'Data Analysis', 'GraphQL', 'Redis',
];

function SuggestionPills({ onPick }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {SKILL_SUGGESTIONS.map(s => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="text-[10px] px-2 py-1 rounded-full border border-borderColor text-textMuted
                     hover:border-accentIndigo/50 hover:text-accentIndigo hover:bg-accentIndigo/5
                     transition-all duration-150 font-display font-semibold"
        >
          {s}
        </button>
      ))}
    </div>
  );
}

export default function PostSwapModal({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ teach: '', learn: '', msg: '', proofType: 'resume', proofFile: null });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const set = (key) => (e) => {
    setForm(p => ({ ...p, [key]: e.target.value }));
    setErrors(p => ({ ...p, [key]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.teach.trim()) e.teach = 'Required';
    if (!form.learn.trim()) e.learn = 'Required';
    if (!form.msg.trim())   e.msg   = 'Add a short message for potential matches';
    const proofError = validateProofFile(form.proofFile);
    if (proofError) e.proofFile = proofError;
    return e;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm(p => ({ ...p, proofFile: file }));
    setErrors(p => ({ ...p, proofFile: validateProofFile(file) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const verificationProof = await buildVerificationProof({
        file: form.proofFile,
        proofType: form.proofType,
      });
      await onSubmit({
        teach: form.teach.trim(),
        learn: form.learn.trim(),
        msg: form.msg.trim(),
        verificationProof,
      });
      setForm({ teach: '', learn: '', msg: '', proofType: 'resume', proofFile: null });
      setErrors({});
      onClose();
    } catch (err) {
      setErrors(p => ({ ...p, proofFile: err.message || 'Could not attach proof.' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center animate-overlay-in"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      onClick={handleOverlayClick}
    >
      <div
        className="relative w-full max-w-lg mx-4 bg-bgCard border border-borderColor rounded-xl animate-modal-in max-h-[90vh] overflow-y-auto shadow-glass"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-borderColor">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.14)', border: '1px solid rgba(99,102,241,0.28)' }}
            >
              <IconArrowsSwap size={16} className="text-accentIndigo" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-textPrimary leading-none">
                Post a Skill Swap
              </h2>
              <p className="text-[11px] text-textMuted mt-0.5">
                Tell peers what you can teach and what you want to learn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-textMuted
                       hover:text-textPrimary hover:bg-bgSecondary transition-all duration-150"
          >
            <IconX size={14} />
          </button>
        </div>

        {/* ── Body ── */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">

          {/* Skill pair display (live preview) */}
          {(form.teach || form.learn) && (
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-bgSecondary/60 border border-borderColor">
              <div className="p-2.5 rounded-md bg-accentEmerald/8 border border-accentEmerald/20">
                <p className="label-caps text-accentEmerald mb-1">You Teach</p>
                <p className="text-xs font-display font-semibold text-textPrimary truncate">
                  {form.teach || '—'}
                </p>
              </div>
              <div className="p-2.5 rounded-md bg-accentIndigo/8 border border-accentIndigo/20">
                <p className="label-caps text-accentIndigo mb-1">You Learn</p>
                <p className="text-xs font-display font-semibold text-textPrimary truncate">
                  {form.learn || '—'}
                </p>
              </div>
            </div>
          )}

          {/* Teach field */}
          <div className="flex flex-col gap-1.5">
            <label className="label-caps">
              What can you teach?
              <span className="text-accentCrimson ml-0.5">*</span>
            </label>
            <input
              className={`input ${errors.teach ? 'border-accentCrimson/60 focus:border-accentCrimson' : ''}`}
              placeholder="e.g. React, DSA Basics, SQL…"
              value={form.teach}
              onChange={set('teach')}
              maxLength={60}
            />
            {errors.teach
              ? <p className="text-[10px] text-accentCrimson font-medium">{errors.teach}</p>
              : <SuggestionPills onPick={(s) => { setForm(p => ({ ...p, teach: s })); setErrors(p => ({ ...p, teach: '' })); }} />
            }
          </div>

          {/* Learn field */}
          <div className="flex flex-col gap-1.5">
            <label className="label-caps">
              What do you want to learn?
              <span className="text-accentCrimson ml-0.5">*</span>
            </label>
            <input
              className={`input ${errors.learn ? 'border-accentCrimson/60 focus:border-accentCrimson' : ''}`}
              placeholder="e.g. Python, System Design…"
              value={form.learn}
              onChange={set('learn')}
              maxLength={60}
            />
            {errors.learn
              ? <p className="text-[10px] text-accentCrimson font-medium">{errors.learn}</p>
              : <SuggestionPills onPick={(s) => { setForm(p => ({ ...p, learn: s })); setErrors(p => ({ ...p, learn: '' })); }} />
            }
          </div>

          {/* Message */}
          <div className="flex flex-col gap-1.5">
            <label className="label-caps">
              Short pitch message
              <span className="text-accentCrimson ml-0.5">*</span>
            </label>
            <textarea
              className={`input resize-none ${errors.msg ? 'border-accentCrimson/60 focus:border-accentCrimson' : ''}`}
              rows={3}
              placeholder="Tell potential matches about yourself and your availability…"
              value={form.msg}
              onChange={set('msg')}
              maxLength={200}
            />
            <div className="flex items-center justify-between">
              {errors.msg
                ? <p className="text-[10px] text-accentCrimson font-medium">{errors.msg}</p>
                : <span />
              }
              <p className="text-[10px] text-textFaint ml-auto">{form.msg.length}/200</p>
            </div>
          </div>

          {/* Verification proof */}
          <div className="rounded-lg border border-borderColor bg-bgSecondary/60 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <label className="label-caps">
                  Skill verification
                  <span className="text-accentCrimson ml-0.5">*</span>
                </label>
                <p className="mt-1 text-[11px] text-textMuted leading-relaxed">
                  Upload a resume PDF or certificate that supports the skill you can teach.
                </p>
              </div>
              <select
                className="input max-w-[150px] text-xs"
                value={form.proofType}
                onChange={e => setForm(p => ({ ...p, proofType: e.target.value }))}
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
            {form.proofFile && (
              <p className="mt-2 text-[11px] font-semibold text-textSecondary">
                {proofTypeLabel(form.proofType)} selected: {form.proofFile.name}
              </p>
            )}
            {errors.proofFile && (
              <p className="mt-2 text-[10px] text-accentCrimson font-medium">{errors.proofFile}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 border-t border-borderColor">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 justify-center disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting…
                </span>
              ) : 'Post Swap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
