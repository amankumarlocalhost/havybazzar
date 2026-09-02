'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDownIcon, CheckIcon } from './Icons';

/**
 * SelectMenu — custom dropdown (native <select> ka replacement).
 * ---------------------------------------------------------------------------
 * Native `<select>` ka popup OS render karta hai; usme CSS bilkul nahi lagti —
 * na radius, na brand colour, na spacing. Marketplace ke premium panel ke beech
 * wo OS-grey list bilkul begaani lagti thi. Isliye ye component listbox khud
 * render karta hai.
 *
 * Native select ki jo cheezein zaroori hain, wo yahan HAATH SE laayi gayi hain:
 *   • Keyboard: Up/Down/Home/End se navigate, Enter/Space se select, Esc se band
 *   • Type-ahead: "ra" type karne pe Rajasthan pe pahunch jaata hai
 *   • Screen reader: ARIA 1.2 combobox pattern — trigger role=combobox +
 *     aria-controls, popup role=listbox, options role=option
 *   • Bahar click karne pe band, aur active option apne aap scroll me aata hai
 *
 * Focus HAMESHA trigger button pe rehta hai (options pe move nahi karta) —
 * `aria-activedescendant` se assistive tech ko active option bataya jaata hai.
 * Isse focus-restore ka poora jhanjhat khatam ho jaata hai.
 *
 * Koi nayi dependency nahi — sirf React.
 * ---------------------------------------------------------------------------
 */
export default function SelectMenu({ label, value, onChange, options, className = '' }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const typeaheadRef = useRef({ query: '', at: 0 });
  const id = useId();

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  const selected = options[selectedIndex];

  // Bahar click / tab-out pe band karo
  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  // Active option ko scroll me laao (lambi list — jaise 23 states — ke liye)
  useEffect(() => {
    if (!open) return;
    listRef.current?.children[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIndex]);

  function openMenu(index = selectedIndex) {
    setActiveIndex(index);
    setOpen(true);
  }

  function commit(index) {
    onChange(options[index].value);
    setOpen(false);
  }

  function handleKeyDown(e) {
    const last = options.length - 1;

    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        return;
      case 'Tab':
        setOpen(false);
        return;
      case 'Enter':
      case ' ':
        e.preventDefault();
        commit(activeIndex);
        return;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, last));
        return;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        return;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        return;
      case 'End':
        e.preventDefault();
        setActiveIndex(last);
        return;
      default:
        break;
    }

    // Type-ahead — ek second ke andar tezi se type kiye letters ek query bante hain
    if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const now = Date.now();
      const ta = typeaheadRef.current;
      ta.query = now - ta.at > 1000 ? e.key : ta.query + e.key;
      ta.at = now;
      const q = ta.query.toLowerCase();
      const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(q));
      if (hit >= 0) setActiveIndex(hit);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-labelledby={`${id}-label`}
        aria-activedescendant={open ? `${id}-opt-${activeIndex}` : undefined}
        className={`relative flex w-full min-w-0 flex-col items-start justify-center rounded-xl border px-3.5 py-3 text-left transition-colors ${
          open
            ? 'border-brand-500 ring-2 ring-brand-500/25'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span
          id={`${id}-label`}
          className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-medium text-slate-500"
        >
          {label}
        </span>
        <span className="flex w-full min-w-0 items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-slate-900">{selected?.label}</span>
          <ChevronDownIcon
            className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-150 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={`${id}-list`}
          role="listbox"
          aria-labelledby={`${id}-label`}
          tabIndex={-1}
          className="hb-menu absolute left-0 right-0 top-[calc(100%+0.375rem)] z-30 max-h-64 min-w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_18px_44px_-12px_rgba(15,23,42,0.28)]"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isActive = i === activeIndex;
            return (
              <li
                key={opt.value || 'any'}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => commit(i)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-800' : 'text-slate-700'
                } ${isSelected ? 'font-semibold' : ''}`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <CheckIcon className="h-3.5 w-3.5 flex-shrink-0 text-brand-600" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
