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
      <div className="flex h-80 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
        No photos uploaded
      </div>
    );
  }

  const active = media[activeIndex];

  return (
    <div>
      <div className="mb-3 flex h-80 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
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
        <div className="flex gap-2 overflow-x-auto">
          {media.map((item, index) => (
            <button
              key={item.fileKey || index}
              onClick={() => setActiveIndex(index)}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                index === activeIndex ? 'border-emerald-600' : 'border-transparent'
              }`}
            >
              {item.type === 'video' ? (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs">▶</div>
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
