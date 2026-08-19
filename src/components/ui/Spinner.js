export default function Spinner({ className = '', size = 'h-8 w-8' }) {
  return (
    <div className={`flex items-center justify-center py-10 ${className}`}>
      <span className={`${size} animate-spin rounded-full border-2 border-slate-200 border-t-amber-500`} />
    </div>
  );
}
