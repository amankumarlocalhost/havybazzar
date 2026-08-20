export default function Radio({ label, className = '', id, ...rest }) {
  return (
    <label htmlFor={id} className={`flex items-center gap-2.5 text-sm text-slate-700 ${className}`}>
      <input
        id={id}
        type="radio"
        className="h-4 w-4 flex-shrink-0 border-slate-300 text-brand-700 focus:ring-2 focus:ring-brand-500/30 focus:ring-offset-0"
        {...rest}
      />
      <span>{label}</span>
    </label>
  );
}
