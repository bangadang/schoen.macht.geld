'use client';

import { useEffects } from '@/contexts/effects-context';

/**
 * Aurora Waves effect - slow-moving color gradients in background
 * Creates a mesmerizing northern lights effect
 */
export function AuroraMode() {
  const { isEffectEnabled } = useEffects();

  if (!isEffectEnabled('aurora')) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[83] overflow-hidden">
        {/* Aurora wave 1 */}
        <div
          className="absolute w-[200%] h-[50%] opacity-30"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(0, 255, 128, 0.3), rgba(0, 128, 255, 0.3), transparent)',
            animation: 'aurora-wave1 15s ease-in-out infinite',
            filter: 'blur(40px)',
            top: '10%',
            left: '-50%',
          }}
        />
        {/* Aurora wave 2 */}
        <div
          className="absolute w-[200%] h-[40%] opacity-25"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(128, 0, 255, 0.3), rgba(255, 0, 128, 0.3), transparent)',
            animation: 'aurora-wave2 20s ease-in-out infinite',
            filter: 'blur(50px)',
            top: '20%',
            left: '-50%',
          }}
        />
        {/* Aurora wave 3 */}
        <div
          className="absolute w-[200%] h-[30%] opacity-20"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(0, 200, 255, 0.4), rgba(0, 255, 200, 0.3), transparent)',
            animation: 'aurora-wave3 12s ease-in-out infinite',
            filter: 'blur(30px)',
            top: '30%',
            left: '-50%',
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes aurora-wave1 {
          0%, 100% {
            transform: translateX(0) rotate(-5deg) scaleY(1);
          }
          50% {
            transform: translateX(20%) rotate(5deg) scaleY(1.2);
          }
        }

        @keyframes aurora-wave2 {
          0%, 100% {
            transform: translateX(10%) rotate(3deg) scaleY(1.1);
          }
          50% {
            transform: translateX(-10%) rotate(-3deg) scaleY(0.9);
          }
        }

        @keyframes aurora-wave3 {
          0%, 100% {
            transform: translateX(-5%) rotate(-2deg) scaleY(1);
          }
          33% {
            transform: translateX(15%) rotate(4deg) scaleY(1.3);
          }
          66% {
            transform: translateX(5%) rotate(-1deg) scaleY(0.8);
          }
        }
      `}</style>
    </>
  );
}