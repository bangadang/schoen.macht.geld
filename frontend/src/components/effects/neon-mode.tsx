'use client';

import { useEffects } from '@/contexts/effects-context';

/**
 * Neon Glow effect - adds cyberpunk-style glowing edges
 * Makes UI elements glow with neon colors
 */
export function NeonMode() {
  const { isEffectEnabled } = useEffects();

  if (!isEffectEnabled('neon')) {
    return null;
  }

  return (
    <style jsx global>{`
      body.effect-neon {
        --neon-pink: #ff00ff;
        --neon-cyan: #00ffff;
        --neon-yellow: #ffff00;
      }

      body.effect-neon *:not([data-effects-settings] *) {
        transition: text-shadow 0.3s, box-shadow 0.3s;
      }

      /* Glow on text */
      body.effect-neon h1,
      body.effect-neon h2,
      body.effect-neon h3 {
        text-shadow:
          0 0 5px var(--neon-pink),
          0 0 10px var(--neon-pink),
          0 0 20px var(--neon-pink),
          0 0 40px var(--neon-pink);
      }

      /* Glow on buttons */
      body.effect-neon button:not([data-effects-settings] button),
      body.effect-neon [role="button"]:not([data-effects-settings] *) {
        box-shadow:
          0 0 5px var(--neon-cyan),
          0 0 10px var(--neon-cyan),
          inset 0 0 5px rgba(0, 255, 255, 0.1);
        border-color: var(--neon-cyan) !important;
      }

      /* Glow on cards */
      body.effect-neon [class*="card"]:not([data-effects-settings] *),
      body.effect-neon [class*="Card"]:not([data-effects-settings] *) {
        box-shadow:
          0 0 10px rgba(255, 0, 255, 0.3),
          0 0 20px rgba(255, 0, 255, 0.2),
          inset 0 0 10px rgba(255, 0, 255, 0.05);
        border-color: var(--neon-pink) !important;
      }

      /* Glow on tables */
      body.effect-neon table {
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
      }

      body.effect-neon th {
        text-shadow: 0 0 10px var(--neon-yellow);
      }

      /* Animated border glow */
      body.effect-neon::after {
        content: '';
        position: fixed;
        inset: 0;
        pointer-events: none;
        z-index: 88;
        border: 2px solid transparent;
        animation: neon-border 4s linear infinite;
        box-shadow:
          inset 0 0 20px rgba(255, 0, 255, 0.1),
          inset 0 0 40px rgba(0, 255, 255, 0.1);
      }

      @keyframes neon-border {
        0%, 100% {
          border-color: var(--neon-pink);
          box-shadow:
            inset 0 0 20px rgba(255, 0, 255, 0.2),
            0 0 20px rgba(255, 0, 255, 0.3);
        }
        33% {
          border-color: var(--neon-cyan);
          box-shadow:
            inset 0 0 20px rgba(0, 255, 255, 0.2),
            0 0 20px rgba(0, 255, 255, 0.3);
        }
        66% {
          border-color: var(--neon-yellow);
          box-shadow:
            inset 0 0 20px rgba(255, 255, 0, 0.2),
            0 0 20px rgba(255, 255, 0, 0.3);
        }
      }
    `}</style>
  );
}