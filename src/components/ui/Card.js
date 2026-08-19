export default function Card({ children, className = '', hover = false, padding = 'p-6', ...rest }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white ${padding} shadow-sm ${
        hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md' : ''
      } ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
