'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Crown, Sparkles } from 'lucide-react';
import type { StockEvent } from '@/contexts/events-context';

interface NewLeaderCelebrationProps {
  event: StockEvent;
  onComplete: () => void;
}

const ANIMATION_DURATION = 8000; // 8 seconds total

export function NewLeaderCelebration({ event, onComplete }: NewLeaderCelebrationProps) {
  const [phase, setPhase] = useState<'intro' | 'reveal' | 'confetti' | 'exit'>('intro');
  const stock = event.stock;

  useEffect(() => {
    // Phase timing
    const timers = [
      setTimeout(() => setPhase('reveal'), 1000),
      setTimeout(() => setPhase('confetti'), 2500),
      setTimeout(() => setPhase('exit'), ANIMATION_DURATION - 1000),
      setTimeout(onComplete, ANIMATION_DURATION),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Generate confetti particles - more particles for fuller effect
  const confetti = Array.from({ length: 150 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 3,
    color: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB', '#32CD32', '#FF69B4', '#00FF7F'][i % 8],
    size: 6 + Math.random() * 12,
    rotation: Math.random() * 360,
    swayAmount: 20 + Math.random() * 40,
  }));

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onComplete}
      >
        {/* Spotlight effect */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-0 bg-gradient-radial from-yellow-400/40 via-transparent to-transparent"
        />

        {/* Confetti */}
        {phase === 'confetti' &&
          confetti.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: '110vh',
                x: [0, particle.swayAmount, -particle.swayAmount, 0],
                rotate: particle.rotation + 720,
                opacity: [1, 1, 1, 0],
              }}
              transition={{
                duration: particle.duration,
                delay: particle.delay,
                ease: 'linear',
                x: {
                  duration: particle.duration / 2,
                  repeat: 2,
                  ease: 'easeInOut',
                },
              }}
              className="absolute top-0"
              style={{
                left: `${particle.x}%`,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                borderRadius: particle.id % 3 === 0 ? '50%' : particle.id % 3 === 1 ? '2px' : '0',
                transform: particle.id % 2 === 0 ? 'rotate(45deg)' : undefined,
              }}
            />
          ))}

        {/* Main content */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{
            scale: phase === 'exit' ? 0.8 : 1,
            opacity: phase === 'exit' ? 0 : 1,
            y: 0,
          }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
          className="relative text-center"
        >
          {/* Crown icon */}
          <motion.div
            initial={{ y: -50, opacity: 0, rotate: -10 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: 'spring', bounce: 0.6 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <Crown className="w-24 h-24 text-yellow-400 drop-shadow-lg" />
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-12 h-12 text-yellow-200" />
              </motion.div>
            </div>
          </motion.div>

          {/* "NEW #1" text */}
          <motion.h1
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: 'spring', bounce: 0.5 }}
            className="text-6xl font-bold text-yellow-400 mb-6 tracking-wider"
            style={{ textShadow: '0 0 40px rgba(250, 204, 21, 0.5)' }}
          >
            NEUER SPITZENREITER!
          </motion.h1>

          {/* Stock card */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, type: 'spring', bounce: 0.3 }}
            className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl p-8 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20"
          >
            {/* Stock image with glow */}
            <motion.div
              animate={{ boxShadow: ['0 0 20px rgba(250, 204, 21, 0.3)', '0 0 60px rgba(250, 204, 21, 0.6)', '0 0 20px rgba(250, 204, 21, 0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="relative w-40 h-40 mx-auto rounded-full overflow-hidden border-4 border-yellow-400 mb-6"
            >
              {stock.image ? (
                <Image
                  unoptimized
                  src={stock.image}
                  alt={stock.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-600 to-yellow-800 flex items-center justify-center text-4xl font-bold text-white">
                  {stock.ticker.slice(0, 2)}
                </div>
              )}
            </motion.div>

            {/* Stock name */}
            <h2 className="text-4xl font-bold text-white mb-2">{stock.title}</h2>
            <p className="text-xl text-yellow-400 font-mono mb-4">{stock.ticker}</p>

            {/* Price */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: 'spring' }}
              className="text-5xl font-bold text-white font-mono"
            >
              {stock.price.toFixed(2)}
              <span className="text-2xl text-gray-400 ml-2">CHF</span>
            </motion.div>

            {/* Change */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className={`text-2xl font-mono mt-2 ${stock.percent_change >= 0 ? 'text-green-400' : 'text-red-400'}`}
            >
              {stock.percent_change >= 0 ? '+' : ''}
              {stock.percent_change.toFixed(1)}%
            </motion.div>
          </motion.div>

          {/* Previous leader mention */}
          {event.metadata?.previousLeader && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="mt-6 text-gray-400"
            >
              Überholt: {event.metadata.previousLeader.title} ({event.metadata.previousLeader.ticker})
            </motion.p>
          )}

          {/* Tap to dismiss hint */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 3 }}
            className="mt-8 text-sm text-gray-500"
          >
            Tippen zum Schliessen
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
