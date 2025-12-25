'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon } from 'lucide-react';
import type { StockEvent } from '@/contexts/events-context';

interface MarketCloseProps {
  event: StockEvent;
  onComplete: () => void;
}

const ANIMATION_DURATION = 5000; // 5 seconds

export function MarketClose({ event, onComplete }: MarketCloseProps) {
  const [phase, setPhase] = useState<'flash' | 'moon' | 'text' | 'exit'>('flash');
  const marketDay = event.metadata?.marketDay ?? 1;
  const leader = event.stock;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('moon'), 300),
      setTimeout(() => setPhase('text'), 1500),
      setTimeout(() => setPhase('exit'), ANIMATION_DURATION - 800),
      setTimeout(onComplete, ANIMATION_DURATION),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        onClick={onComplete}
      >
        {/* Initial flash */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="absolute inset-0 bg-indigo-900"
        />

        {/* Dark overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.95 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="absolute inset-0 bg-black"
        />

        {/* Stars background */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(2px 2px at 20px 30px, white, transparent),
              radial-gradient(2px 2px at 40px 70px, white, transparent),
              radial-gradient(1px 1px at 90px 40px, white, transparent),
              radial-gradient(2px 2px at 160px 120px, white, transparent),
              radial-gradient(1px 1px at 230px 80px, white, transparent),
              radial-gradient(2px 2px at 300px 150px, white, transparent),
              radial-gradient(1px 1px at 400px 60px, white, transparent),
              radial-gradient(2px 2px at 500px 200px, white, transparent)`,
            backgroundSize: '550px 250px',
          }}
        />

        {/* Radial glow behind moon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1.5, opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute w-96 h-96 rounded-full bg-gradient-radial from-indigo-500/40 via-indigo-600/10 to-transparent"
        />

        {/* Moon container */}
        <motion.div
          initial={{ scale: 0, y: 50 }}
          animate={{
            scale: phase === 'exit' ? 0.8 : 1,
            y: 0,
            opacity: phase === 'exit' ? 0 : 1,
          }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Moon icon with glow */}
          <motion.div
            animate={{
              filter: [
                'drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))',
                'drop-shadow(0 0 40px rgba(99, 102, 241, 0.7))',
                'drop-shadow(0 0 20px rgba(99, 102, 241, 0.5))',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Moon
              className="w-32 h-32 text-indigo-300"
              strokeWidth={1.5}
              fill="currentColor"
            />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: phase === 'text' || phase === 'moon' ? 1 : 0,
              y: phase === 'text' || phase === 'moon' ? 0 : 20,
            }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 text-center"
          >
            <motion.h1
              className="text-5xl font-bold text-indigo-300 tracking-wider"
              style={{ textShadow: '0 0 30px rgba(99, 102, 241, 0.6)' }}
            >
              MARKT GESCHLOSSEN
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 text-xl text-indigo-200/80"
            >
              Handelstag {marketDay} beendet
            </motion.p>
            {leader && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-2 text-lg text-indigo-200/60"
              >
                Tagessieger: {leader.name}
              </motion.p>
            )}
          </motion.div>
        </motion.div>

        {/* Tap to dismiss */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 2.5 }}
          className="absolute bottom-12 text-sm text-gray-500"
        >
          Tippen zum Schliessen
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}