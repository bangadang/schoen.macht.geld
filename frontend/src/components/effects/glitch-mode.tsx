'use client';

import { useEffect, useState } from 'react';
import { useEffects } from '@/contexts/effects-context';

/**
 * Glitch/Static effect - VHS tracking errors and chromatic aberration
 * Creates random glitch lines and color separation
 */
export function GlitchMode() {
  const { isEffectEnabled } = useEffects();
  const [glitchLine, setGlitchLine] = useState({ top: 0, height: 0, visible: false });

  // Random glitch line effect
  useEffect(() => {
    if (!isEffectEnabled('glitch')) return;

    const triggerGlitch = () => {
      // Random chance to show glitch
      if (Math.random() > 0.7) {
        setGlitchLine({
          top: Math.random() * 100,
          height: 2 + Math.random() * 20,
          visible: true,
        });

        // Hide after short duration
        setTimeout(() => {
          setGlitchLine((prev) => ({ ...prev, visible: false }));
        }, 50 + Math.random() * 100);
      }
    };

    const interval = setInterval(triggerGlitch, 200 + Math.random() * 500);
    return () => clearInterval(interval);
  }, [isEffectEnabled]);

  if (!isEffectEnabled('glitch')) {
    return null;
  }

  return (
    <>
      {/* Random glitch line */}
      {glitchLine.visible && (
        <div
          className="fixed left-0 right-0 pointer-events-none z-[91] bg-white/20"
          style={{
            top: `${glitchLine.top}%`,
            height: `${glitchLine.height}px`,
            transform: `translateX(${(Math.random() - 0.5) * 20}px)`,
            mixBlendMode: 'difference',
          }}
        />
      )}

      {/* Static noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[90] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          animation: 'glitch-noise 0.2s steps(10) infinite',
        }}
      />

      <style jsx global>{`
        @keyframes glitch-noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-2px, 2px); }
          20% { transform: translate(2px, -2px); }
          30% { transform: translate(-2px, -2px); }
          40% { transform: translate(2px, 2px); }
          50% { transform: translate(-2px, 2px); }
          60% { transform: translate(2px, -2px); }
          70% { transform: translate(-2px, -2px); }
          80% { transform: translate(2px, 2px); }
          90% { transform: translate(-2px, 2px); }
        }

        body.effect-glitch {
          animation: glitch-shake 5s infinite;
        }

        @keyframes glitch-shake {
          0%, 95%, 100% { transform: translate(0, 0); }
          96% { transform: translate(-2px, 0); }
          97% { transform: translate(2px, 0); }
          98% { transform: translate(-1px, 0); }
          99% { transform: translate(1px, 0); }
        }

        /* Chromatic aberration on text */
        body.effect-glitch *:not([data-effects-settings] *) {
          animation: glitch-chromatic 8s infinite;
        }

        @keyframes glitch-chromatic {
          0%, 90%, 100% {
            text-shadow: none;
          }
          91% {
            text-shadow:
              2px 0 0 rgba(255, 0, 0, 0.7),
              -2px 0 0 rgba(0, 255, 255, 0.7);
          }
          92% {
            text-shadow:
              -2px 0 0 rgba(255, 0, 0, 0.7),
              2px 0 0 rgba(0, 255, 255, 0.7);
          }
          93% {
            text-shadow: none;
          }
          94% {
            text-shadow:
              1px 0 0 rgba(255, 0, 0, 0.5),
              -1px 0 0 rgba(0, 255, 255, 0.5);
          }
        }
      `}</style>
    </>
  );
}