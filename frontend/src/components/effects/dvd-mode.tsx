'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useEffects } from '@/contexts/effects-context';

const LOGO_WIDTH = 180;
const LOGO_HEIGHT = 80;
const SPEED = 2;

/**
 * DVD Logo Mode - classic bouncing logo that changes color on edge hit
 */
export function DvdMode() {
  const { isEffectEnabled } = useEffects();
  const [hue, setHue] = useState(0);

  // Use refs for animation state to avoid stale closures
  const positionRef = useRef({ x: 100, y: 100 });
  const velocityRef = useRef({ x: SPEED, y: SPEED * 0.75 });
  const logoRef = useRef<HTMLDivElement>(null);

  const animate = useCallback(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const maxX = window.innerWidth - LOGO_WIDTH;
    const maxY = window.innerHeight - LOGO_HEIGHT;

    let { x, y } = positionRef.current;
    let { x: vx, y: vy } = velocityRef.current;
    let hitEdge = false;

    // Update position
    x += vx;
    y += vy;

    // Bounce off left/right edges
    if (x <= 0) {
      x = 0;
      vx = Math.abs(vx);
      hitEdge = true;
    } else if (x >= maxX) {
      x = maxX;
      vx = -Math.abs(vx);
      hitEdge = true;
    }

    // Bounce off top/bottom edges
    if (y <= 0) {
      y = 0;
      vy = Math.abs(vy);
      hitEdge = true;
    } else if (y >= maxY) {
      y = maxY;
      vy = -Math.abs(vy);
      hitEdge = true;
    }

    // Store updated values
    positionRef.current = { x, y };
    velocityRef.current = { x: vx, y: vy };

    // Apply position directly to DOM for smooth animation
    logo.style.transform = `translate(${x}px, ${y}px)`;

    // Change color on edge hit
    if (hitEdge) {
      setHue((h) => (h + 60) % 360);
    }
  }, []);

  useEffect(() => {
    if (!isEffectEnabled('dvd')) return;

    let animationId: number;

    const loop = () => {
      animate();
      animationId = requestAnimationFrame(loop);
    };

    animationId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationId);
  }, [isEffectEnabled, animate]);

  if (!isEffectEnabled('dvd')) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[85]">
      <div
        ref={logoRef}
        className="absolute top-0 left-0 flex flex-col items-center justify-center px-6 py-3 rounded-xl"
        style={{
          width: LOGO_WIDTH,
          height: LOGO_HEIGHT,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          border: `2px solid hsl(${hue}, 80%, 60%)`,
          boxShadow: `0 0 20px hsla(${hue}, 100%, 50%, 0.5)`,
        }}
      >
        <span
          className="font-bold text-4xl tracking-wider"
          style={{
            color: 'white',
            textShadow: `0 0 10px hsl(${hue}, 100%, 70%), 0 0 20px hsl(${hue}, 100%, 50%)`,
          }}
        >
          VAK
        </span>
        <span
          className="text-xs tracking-widest uppercase opacity-80"
          style={{
            color: 'white',
            textShadow: `0 0 5px hsl(${hue}, 100%, 70%)`,
          }}
        >
          Stock Exchange
        </span>
      </div>
    </div>
  );
}