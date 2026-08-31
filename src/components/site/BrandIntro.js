'use client';

/**
 * BrandIntro — HEAVY BAZAAR ka first-load cinematic intro.
 * ---------------------------------------------------------------------------
 * FLASH KYUN NAHI HOTA:
 * Overlay ka markup hamesha render hota hai, par uski visibility CSS se
 * control hoti hai — `<html class="hb-intro">` (root layout ke inline script
 * se, hydration se PEHLE set). Isliye:
 *   pehli visit  -> class lagti hai -> overlay turant dikhta hai
 *   dobara visit -> class nahi lagti -> overlay kabhi paint hi nahi hota
 * State se decide karte to ya to repeat visit pe flash hota, ya first
 * visit pe homepage ek frame ke liye dikh jaata.
 *
 * PROGRESS ASLI HAI, fake timer nahi. Teen real milestones track hote hain:
 *   1. Fonts ready              (document.fonts.ready)
 *   2. App data ready           (homepage `hb:app-ready` event, ya window load)
 *   3. Window load              (hero + initial assets) — accelerator only
 * Har milestone target badhata hai, aur bar rAF se us target tak smoothly
 * ease karti hai — isse number kabhi jhatke se nahi kudta.
 *
 * FAILSAFE: kuch bhi atak jaaye to MAX_WAIT_MS pe overlay chala jaata hai.
 * Infinite loader kabhi nahi.
 * ---------------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react';

const SESSION_KEY = 'hb:intro-seen';
const MAX_WAIT_MS = 4000; // is se zyada user ko kabhi nahi rokte
const HOLD_MS = 380; // 100% pe brand thoda der visible rahe
const EXIT_MS = 620; // fade-out (spec: 500-800ms)

export default function BrandIntro() {
  // Repeat visits pe bhi mount hota hai, par CSS use dikhne nahi deta —
  // aur pehle effect me hi unmount ho jaata hai.
  const [mounted, setMounted] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(0);

  const barRef = useRef(null);
  const percentRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;

    // Intro sirf pehli visit pe — warna turant hata do (koi paint nahi hua).
    if (!root.classList.contains('hb-intro')) {
      setMounted(false);
      return;
    }

    let raf = 0;
    let finished = false;
    const timers = [];

    // ---- Real loading milestones ------------------------------------
    // Har entry ka apna weight hai; jaise-jaise poore hote hain target badhta hai.
    let target = 8; // shuru me hi thoda movement, dead bar na lage
    const bump = (amount) => {
      target = Math.min(100, target + amount);
    };

    // 1. Fonts — text ka FOUT intro ke peeche hi nikal jaaye
    const fontsDone = (document.fonts?.ready || Promise.resolve()).then(() => bump(25));

    // 2. App data — homepage ka `hb:app-ready`. Kisi aur page pe land kare
    //    to window load fallback hai. Yahan koi apni fetch NAHI hoti.
    const appDone = new Promise((resolve) => {
      const done = () => {
        bump(45);
        resolve();
      };
      window.addEventListener('hb:app-ready', done, { once: true });
      if (document.readyState === 'complete') {
        timers.push(setTimeout(done, 0));
      } else {
        window.addEventListener('load', done, { once: true });
      }
    });

    // 3. Window load (hero image + baaki initial assets) — sirf ACCELERATOR
    //    hai, blocker nahi. Non-critical images ke liye rukna nahi hai, isliye
    //    ye Promise.all me nahi jaata.
    if (document.readyState === 'complete') {
      bump(22);
    } else {
      window.addEventListener('load', () => bump(22), { once: true });
    }

    // ---- Smooth progress: target tak ease karo, seedha jump nahi ----
    let current = 0;
    const tick = () => {
      current += (target - current) * 0.08;
      const shown = Math.min(100, Math.round(current));
      // DOM seedha update — har frame pe React re-render nahi chahiye
      if (barRef.current) barRef.current.style.transform = `scaleX(${shown / 100})`;
      if (percentRef.current) percentRef.current.textContent = String(shown).padStart(2, '0');
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // ---- Exit sequence ---------------------------------------------
    const finish = () => {
      if (finished) return;
      finished = true;

      target = 100;
      current = Math.max(current, 96); // last stretch snappy rahe

      timers.push(
        setTimeout(() => {
          cancelAnimationFrame(raf);
          if (barRef.current) barRef.current.style.transform = 'scaleX(1)';
          if (percentRef.current) percentRef.current.textContent = '100';
          setProgress(100);

          // 100% pe brand thoda hold, phir fade-out
          timers.push(
            setTimeout(() => {
              setExiting(true);
              try {
                sessionStorage.setItem(SESSION_KEY, '1');
              } catch {
                // private mode — intro dobara dikh sakta hai, koi crash nahi
              }
              // `.hb-intro` class SIRF unmount ke waqt hatti hai — warna
              // overlay ka display:flex chala jaata aur fade dikhta hi nahi.
              timers.push(
                setTimeout(() => {
                  root.classList.remove('hb-intro');
                  setMounted(false);
                }, EXIT_MS)
              );
            }, HOLD_MS)
          );
        }, 260)
      );
    };

    Promise.all([fontsDone, appDone]).then(finish);
    timers.push(setTimeout(finish, MAX_WAIT_MS)); // failsafe

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`hb-intro-overlay ${exiting ? 'hb-intro-overlay--exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Heavy Bazar"
    >
      {/* Industrial depth: hazard-stripe texture + dheere chalti work light */}
      <div className="hb-intro-stripes" aria-hidden="true" />
      <div className="hb-intro-sweep" aria-hidden="true" />
      <div className="hb-intro-vignette" aria-hidden="true" />

      <div className="hb-intro-stage">
        {/* eslint-disable-next-line @next/next/no-img-element -- intro se pehle koi optimizer round-trip nahi chahiye */}
        <img src="/logo-dark.png" alt="Heavy Bazar" className="hb-intro-logo" width={827} height={70} />

        <p className="hb-intro-caption">Loading</p>

        <div className="hb-intro-meter">
          <div className="hb-intro-track">
            <div ref={barRef} className="hb-intro-fill" />
          </div>
          <span className="hb-intro-percent">
            <span ref={percentRef}>00</span>
            <span className="hb-intro-percent-sign">%</span>
          </span>
        </div>
      </div>

      <span className="sr-only">{progress}% loaded</span>
    </div>
  );
}
