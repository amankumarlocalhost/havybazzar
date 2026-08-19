import { ChevronDownIcon } from './Icons';

export default function Select({ label, error, hint, required, className = '', id, children, ...rest }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-700">
          {label} {required && <span className="text-amber-600">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          required={required}
          className={`w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-9 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 ${
            error ? 'border-red-400' : 'border-slate-300'
          } ${className}`}
          {...rest}
        >
          {children}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
