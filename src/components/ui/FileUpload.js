'use client';

import { useId, useState } from 'react';
import { UploadIcon } from './Icons';

export default function FileUpload({
  label = 'Click to upload',
  hint,
  accept,
  multiple = false,
  disabled = false,
  onFiles,
  className = '',
}) {
  const id = useId();
  const [dragActive, setDragActive] = useState(false);

  function handleFiles(fileList) {
    if (disabled) return;
    const files = Array.from(fileList || []);
    if (files.length > 0) onFiles?.(files);
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
        disabled
          ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
          : `cursor-pointer ${
              dragActive
                ? 'border-brand-400 bg-brand-50'
                : 'border-slate-300 bg-slate-50/60 hover:border-brand-300 hover:bg-brand-50/30'
            }`
      } ${className}`}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-brand-700 shadow-sm ring-1 ring-slate-200">
        <UploadIcon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      {hint && <span className="text-xs text-slate-500">{hint}</span>}
      <input
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = '';
        }}
      />
    </label>
  );
}
