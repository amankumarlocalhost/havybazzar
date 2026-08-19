const COLOR_MAP = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  live: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  verified: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  won: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',

  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  under_review: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  submitted: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  scheduled: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  processing: 'bg-amber-50 text-amber-700 ring-amber-600/20',

  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
  failed: 'bg-red-50 text-red-700 ring-red-600/20',
  lost: 'bg-red-50 text-red-700 ring-red-600/20',
  suspended: 'bg-red-50 text-red-700 ring-red-600/20',

  draft: 'bg-slate-100 text-slate-600 ring-slate-500/15',
  closed: 'bg-slate-100 text-slate-600 ring-slate-500/15',
};

const DOT_MAP = {
  active: 'bg-emerald-500',
  live: 'bg-emerald-500',
  approved: 'bg-emerald-500',
  verified: 'bg-emerald-500',
  paid: 'bg-emerald-500',
  won: 'bg-emerald-500',
  pending: 'bg-amber-500',
  under_review: 'bg-amber-500',
  submitted: 'bg-amber-500',
  scheduled: 'bg-amber-500',
  processing: 'bg-amber-500',
  rejected: 'bg-red-500',
  cancelled: 'bg-red-500',
  failed: 'bg-red-500',
  lost: 'bg-red-500',
  suspended: 'bg-red-500',
  draft: 'bg-slate-400',
  closed: 'bg-slate-400',
};

export default function Badge({ status, children, dot = true }) {
  const classes = COLOR_MAP[status] || 'bg-slate-100 text-slate-600 ring-slate-500/15';
  const dotColor = DOT_MAP[status] || 'bg-slate-400';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ring-1 ring-inset ${classes}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />}
      {children || status}
    </span>
  );
}
