'use client';

import Link from 'next/link';

export default function Tabs({ items, value, onChange, className = '' }) {
  return (
    <div
      role="tablist"
      className={`flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 ${className}`}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={`flex-shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-ink-700 text-brand-700 shadow-sm ring-1 ring-slate-300/50'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {item.label}
            {typeof item.count === 'number' && (
              <span
                className={`ml-1.5 text-xs ${active ? 'text-brand-600' : 'text-slate-400'}`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function TabLinks({ items, activeHref, className = '' }) {
  return (
    <div
      className={`flex gap-1 overflow-x-auto border-b border-slate-200 ${className}`}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${
            item.href === activeHref
              ? 'border-brand-700 text-brand-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
