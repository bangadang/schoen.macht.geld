'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Rocket, TrendingUp, Star } from 'lucide-react';
import type { StockEvent } from '@/contexts/events-context';

interface AllTimeHighProps {
  event: StockEvent;
  onComplete: () => void;
}

const ANIMATION_DURATION = 6000;

export function AllTimeHigh({ event, onComplete }: AllTimeHighProps) {
  const [phase, setPhase] = useState<'launch' | 'soar' | 'celebrate' | 'exit'>('launch');
  const stock = event.stock;

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('soar'), 800),
      setTimeout(() => setPhase('celebrate'), 2000),
      setTimeout(() => setPhase('exit'), ANIMATION_DURATION - 800),
      setTimeout(onComplete, ANIMATION_DURATION),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Stars for celebration
  const stars = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 0.5,
    size: 10 + Math.random() * 20,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(to top, #1a1a2e, #16213e, #0f3460)' }}
        onClick={onComplete}
      >
        {/* Stars background */}
        {phase === 'celebrate' &&
          stars.map((star) => (
            <motion.div
              key={star.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
              transition={{ duration: 1.5, delay: star.delay, repeat: 2 }}
              className="absolute"
              style={{ left: `${star.x}%`, top: `${star.y}%` }}
            >
              <Star className="text-yellow-400" style={{ width: star.size, height: star.size }} fill="currentColor" />
            </motion.div>
          ))}

        {/* Rocket trail */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: phase === 'soar' || phase === 'celebrate' ? 0.6 : 0,
            height: phase === 'soar' || phase === 'celebrate' ? '100vh' : 0,
          }}
          transition={{ duration: 1 }}
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 bg-gradient-to-t from-orange-500 via-yellow-400 to-transparent blur-md"
        />

        {/* Rocket with stock */}
        <motion.div
          initial={{ y: '100vh' }}
          animate={{
            y: phase === 'launch' ? '60vh' : phase === 'exit' ? '-100vh' : '10vh',
          }}
          transition={{
            type: 'spring',
            stiffness: phase === 'launch' ? 100 : 50,
            damping: 15,
            duration: phase === 'exit' ? 0.8 : undefined,
          }}
          className="relative flex flex-col items-center"
        >
          {/* Rocket icon */}
          <motion.div
            animate={{ rotate: phase === 'soar' ? [0, -5, 5, 0] : 0 }}
            transition={{ duration: 0.5, repeat: phase === 'soar' ? Infinity : 0 }}
            className="relative"
          >
            <Rocket className="w-32 h-32 text-white -rotate-45" />
            {/* Flame - positioned at rocket exhaust (bottom-left after -45° rotation) */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="absolute -bottom-6 left-2 w-16 h-24 bg-gradient-to-t from-orange-600 via-yellow-500 to-transparent rounded-full blur-sm -z-10"
            />
          </motion.div>

          {/* Stock card attached to rocket */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 bg-zinc-900/90 backdrop-blur rounded-2xl p-6 border border-green-500/50 shadow-2xl shadow-green-500/20 text-center"
          >
            {/* Stock image */}
            <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-green-400 mb-4">
              {stock.image ? (
                <Image
                  unoptimized
                  src={stock.image}
                  alt={stock.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center text-2xl font-bold text-white">
                  {stock.ticker.slice(0, 2)}
                </div>
              )}
            </div>

            {/* ALL-TIME HIGH badge */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold px-4 py-2 rounded-full mb-3"
            >
              <TrendingUp className="w-5 h-5" />
              ALLZEITHOCH!
            </motion.div>

            <h2 className="text-2xl font-bold text-white mb-1">{stock.title}</h2>
            <p className="text-green-400 font-mono mb-3">{stock.ticker}</p>

            {/* New price */}
            <div className="text-4xl font-bold text-green-400 font-mono">
              {stock.price.toFixed(2)} CHF
            </div>

            {/* Previous high */}
            {event.metadata?.previousPrice && (
              <p className="text-sm text-gray-400 mt-2">
                Vorheriges Hoch: {event.metadata.previousPrice.toFixed(2)} CHF
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Tap to dismiss */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 3 }}
          className="absolute bottom-8 text-sm text-gray-400"
        >
          Tippen zum Schliessen
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}