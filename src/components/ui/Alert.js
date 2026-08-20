import { AlertTriangleIcon, CheckCircleIcon } from './Icons';

const TONES = {
  error: {
    wrap: 'border-red-200 bg-red-50 text-red-700',
    icon: 'text-red-500',
  },
  success: {
    wrap: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    icon: 'text-emerald-500',
  },
  info: {
    wrap: 'border-brand-200 bg-brand-50 text-brand-800',
    icon: 'text-brand-600',
  },
  warning: {
    wrap: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: 'text-amber-500',
  },
};

export default function Alert({ tone = 'error', children, className = '' }) {
  if (!children) return null;
  const styles = TONES[tone] || TONES.info;
  const Icon = tone === 'success' ? CheckCircleIcon : AlertTriangleIcon;

  return (
    <div
      className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${styles.wrap} ${className}`}
    >
      <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${styles.icon}`} />
      <div>{children}</div>
    </div>
  );
}
