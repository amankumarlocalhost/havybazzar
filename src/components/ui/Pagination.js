import { ChevronRightIcon } from './Icons';

export default function Pagination({ page, totalPages, onChange, className = '' }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className={`flex items-center justify-center gap-1.5 ${className}`} aria-label="Pagination">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronRightIcon className="h-4 w-4 rotate-180" />
      </button>

      {start > 1 && (
        <>
          <PageButton num={1} active={page === 1} onClick={onChange} />
          {start > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}

      {pages.map((num) => (
        <PageButton key={num} num={num} active={num === page} onClick={onChange} />
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <PageButton num={totalPages} active={page === totalPages} onClick={onChange} />
        </>
      )}

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-brand-300 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}

function PageButton({ num, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(num)}
      aria-current={active ? 'page' : undefined}
      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-brand-500 text-ink-900 shadow-sm'
          : 'text-slate-600 hover:bg-slate-100'
      }`}
    >
      {num}
    </button>
  );
}
