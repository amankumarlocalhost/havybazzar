import { AlertTriangleIcon, CheckCircleIcon } from './Icons';

/**
 * Alert tones — industrial theme. Success ab green nahi, JCB yellow +
 * white text hai; error ke liye red semantic rakha hai.
 */
const TONES = {
  error: {
    wrap: 'border-red-200 bg-red-50 text-red-700',
    icon: 'text-red-400',
  },
  success: {
    wrap: 'border-brand-300 bg-brand-50 text-slate-900',
    icon: 'text-brand-500',
  },
  info: {
    wrap: 'border-slate-300 bg-slate-100 text-slate-700',
    icon: 'text-slate-500',
  },
  warning: {
    wrap: 'border-brand-300 bg-brand-50 text-brand-800',
    icon: 'text-brand-500',
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
