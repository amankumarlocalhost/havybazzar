/**
 * Badge — industrial status system (koi green nahi).
 * ---------------------------------------------------------------------------
 *   DONE / positive   -> white text on charcoal, silver ring  (kaam ho gaya)
 *   IN PROGRESS       -> JCB yellow                            (dhyan chahiye)
 *   FAILED / negative -> red                                   (semantic, zaroori)
 *   INACTIVE          -> muted silver
 * Green ko success ke liye wapas mat laayein — theme black + yellow hai.
 * ---------------------------------------------------------------------------
 */

const DONE = 'bg-slate-100 text-slate-900 ring-slate-300/70';
const ACTIVE = 'bg-brand-50 text-brand-700 ring-brand-500/40';
const FAILED = 'bg-red-50 text-red-700 ring-red-400/30';
const MUTED = 'bg-slate-100 text-slate-500 ring-slate-300/50';

const COLOR_MAP = {
  active: ACTIVE,
  live: ACTIVE,
  approved: DONE,
  verified: DONE,
  paid: DONE,
  won: DONE,

  pending: ACTIVE,
  under_review: ACTIVE,
  submitted: ACTIVE,
  scheduled: ACTIVE,
  processing: ACTIVE,

  rejected: FAILED,
  cancelled: FAILED,
  failed: FAILED,
  lost: FAILED,
  suspended: FAILED,

  draft: MUTED,
  closed: MUTED,
};

const DOT_DONE = 'bg-slate-500';
const DOT_ACTIVE = 'bg-brand-500';
const DOT_FAILED = 'bg-red-500';
const DOT_MUTED = 'bg-slate-400';

const DOT_MAP = {
  active: DOT_ACTIVE,
  live: DOT_ACTIVE,
  approved: DOT_DONE,
  verified: DOT_DONE,
  paid: DOT_DONE,
  won: DOT_DONE,
  pending: DOT_ACTIVE,
  under_review: DOT_ACTIVE,
  submitted: DOT_ACTIVE,
  scheduled: DOT_ACTIVE,
  processing: DOT_ACTIVE,
  rejected: DOT_FAILED,
  cancelled: DOT_FAILED,
  failed: DOT_FAILED,
  lost: DOT_FAILED,
  suspended: DOT_FAILED,
  draft: DOT_MUTED,
  closed: DOT_MUTED,
};

export default function Badge({ status, children, dot = true }) {
  const classes = COLOR_MAP[status] || MUTED;
  const dotColor = DOT_MAP[status] || DOT_MUTED;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${classes}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      {children || status}
    </span>
  );
}
