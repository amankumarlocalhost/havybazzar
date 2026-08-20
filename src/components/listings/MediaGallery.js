'use client';

import { useState } from 'react';

function cloudinaryUrl(fileKey, resourceType = 'image') {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${fileKey}`;
}

export default function MediaGallery({ media = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (media.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-400">
        No photos uploaded
      </div>
    );
  }

  const active = media[activeIndex];

  return (
    <div>
      <div className="mb-3 flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 sm:h-[26rem]">
        {active.type === 'video' ? (
          <video src={cloudinaryUrl(active.fileKey, 'video')} controls className="h-full w-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cloudinaryUrl(active.fileKey)}
            alt="Equipment"
            className="h-full w-full object-contain"
          />
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((item, index) => (
            <button
              key={item.fileKey || index}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                index === activeIndex ? 'border-brand-600' : 'border-transparent hover:border-slate-300'
              }`}
            >
              {item.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs text-slate-600">▶</div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cloudinaryUrl(item.fileKey)} alt="" className="h-full w-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
