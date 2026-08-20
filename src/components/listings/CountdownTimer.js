'use client';

import { useEffect, useState } from 'react';

function getRemaining(endTime) {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return null;

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

export default function CountdownTimer({ endTime, onExpire }) {
  const [remaining, setRemaining] = useState(() => getRemaining(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getRemaining(endTime);
      setRemaining(next);
      if (!next) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  if (!remaining) {
    return <span className="text-sm font-medium text-red-600">Auction has ended</span>;
  }

  const { hours, minutes, seconds } = remaining;
  return (
    <span className="font-mono text-lg font-semibold text-slate-900">
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}
