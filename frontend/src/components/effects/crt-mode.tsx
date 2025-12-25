'use client';

import { useEffects } from '@/contexts/effects-context';

/**
 * CRT Scanlines effect - adds retro CRT monitor aesthetics
 * Includes horizontal scanlines, slight screen curvature, and subtle flicker
 */
export function CrtMode() {
  const { isEffectEnabled } = useEffects();

  if (!isEffectEnabled('crt')) {
    return null;
  }

  return (
    <>
      {/* Scanlines overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[90]"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.15) 0px,
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
          )`,
        }}
      />
      {/* Screen curvature vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-[89]"
        style={{
          background: `radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 60%,
            rgba(0, 0, 0, 0.3) 100%
          )`,
        }}
      />
      {/* Subtle RGB shift on edges */}
      <style jsx global>{`
        body.effect-crt > *:not([data-effects-settings]) {
          text-shadow:
            0.5px 0 0 rgba(255, 0, 0, 0.3),
            -0.5px 0 0 rgba(0, 255, 255, 0.3);
        }
        body.effect-crt {
          animation: crt-flicker 0.15s infinite;
        }
        @keyframes crt-flicker {
          0% { opacity: 1; }
          50% { opacity: 0.98; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
}