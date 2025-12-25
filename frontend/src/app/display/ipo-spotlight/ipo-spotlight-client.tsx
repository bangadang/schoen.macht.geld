'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Sparkles, Clock, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { useStocks } from '@/hooks/use-stocks';
import type { StockResponse } from '@/lib/api/client';

// How long each stock stays in the spotlight
const SPOTLIGHT_DURATION_MS = 8000;

// Format relative time in German
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tag${diffDays > 1 ? 'en' : ''}`;
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
}

export default function IpoSpotlightClient() {
  const { stocks, isLoading } = useStocks({ order: 'created_at_desc', limit: 10 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const currentStock = useMemo(() => {
    if (stocks.length === 0) return null;
    return stocks[currentIndex % stocks.length];
  }, [stocks, currentIndex]);

  // Auto-advance to next stock
  useEffect(() => {
    if (!isPlaying || stocks.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stocks.length);
    }, SPOTLIGHT_DURATION_MS);

    return () => clearInterval(timer);
  }, [isPlaying, stocks.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + stocks.length) % stocks.length);
  }, [stocks.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % stocks.length);
  }, [stocks.length]);

  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl text-white"
        >
          Lade neue Aktien...
        </motion.div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <div className="text-center">
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold">Noch keine Börsengänge</h2>
          <p className="text-gray-400 mt-2">Warte auf die ersten Aktien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Spotlight gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/30 via-black to-black" />

      {/* Animated particles/sparkles in background */}
      <SparkleBackground />

      {/* Main spotlight area */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Sparkles className="w-8 h-8 text-yellow-400" />
          <h1 className="text-3xl font-bold text-white">IPO Spotlight</h1>
          <span className="text-gray-400">— Neu an der Börse</span>
        </motion.div>

        {/* Spotlight content */}
        <AnimatePresence mode="wait">
          {currentStock && (
            <SpotlightCard key={currentStock.ticker} stock={currentStock} />
          )}
        </AnimatePresence>

        {/* Navigation dots */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handlePrev}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex gap-2">
            {stocks.map((stock, index) => (
              <button
                key={stock.ticker}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'bg-yellow-400 w-8'
                    : 'bg-white/30 hover:bg-white/50'
                )}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ml-4"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
          <motion.div
            key={currentIndex}
            initial={{ width: 0 }}
            animate={{ width: isPlaying ? '100%' : '0%' }}
            transition={{ duration: SPOTLIGHT_DURATION_MS / 1000, ease: 'linear' }}
            className="h-full bg-yellow-400"
          />
        </div>
      </div>

      {/* Queue preview on the right */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        <span className="text-xs text-gray-500 uppercase tracking-wide mb-2">Nächste</span>
        {stocks.slice(0, 5).map((stock, index) => (
          <motion.button
            key={stock.ticker}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: index === currentIndex ? 0 : 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors',
              index === currentIndex && 'opacity-0 pointer-events-none'
            )}
          >
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
              {stock.image ? (
                <Image
                  unoptimized
                  src={stock.image}
                  alt={stock.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-900 flex items-center justify-center text-xs">
                  {stock.ticker.slice(0, 2)}
                </div>
              )}
            </div>
            <span className="text-white text-sm font-mono">{stock.ticker}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function SpotlightCard({ stock }: { stock: StockResponse }) {
  const isPositive = stock.percent_change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: -50 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
      className="relative"
    >
      {/* Spotlight glow behind the card */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute -inset-8 bg-gradient-radial from-yellow-400/20 via-purple-500/10 to-transparent blur-3xl"
      />

      {/* Main card */}
      <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-3xl p-8 border border-white/10 shadow-2xl min-w-[400px]">
        {/* NEW badge */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: -12 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute -top-4 -right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-4 py-2 rounded-full text-sm shadow-lg"
        >
          NEU!
        </motion.div>

        {/* Stock image */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-yellow-400/50 shadow-lg shadow-yellow-400/20 mb-6"
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
            <div className="w-full h-full bg-gradient-to-br from-purple-700 to-purple-900 flex items-center justify-center text-4xl font-bold text-white">
              {stock.ticker.slice(0, 2)}
            </div>
          )}
        </motion.div>

        {/* Stock info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-1">{stock.title}</h2>
          <p className="text-lg text-gray-400 font-mono mb-4">{stock.ticker}</p>

          {stock.description && (
            <p className="text-gray-400 text-sm mb-4 max-w-xs mx-auto line-clamp-2">
              {stock.description}
            </p>
          )}

          {/* Price display */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Kurs</p>
              <p className="text-4xl font-bold text-white font-mono">
                {stock.price.toFixed(2)}
                <span className="text-xl text-gray-400 ml-1">CHF</span>
              </p>
            </div>

            <div className="h-12 w-px bg-white/10" />

            <div className="text-center">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Änderung</p>
              <p
                className={cn(
                  'text-2xl font-bold font-mono flex items-center gap-1',
                  isPositive ? 'text-green-400' : 'text-red-400'
                )}
              >
                {isPositive ? (
                  <TrendingUp className="w-5 h-5" />
                ) : (
                  <TrendingDown className="w-5 h-5" />
                )}
                {isPositive ? '+' : ''}
                {stock.percent_change.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* IPO time */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-2 text-gray-500"
          >
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              Börsengang {formatRelativeTime(stock.created_at)}
            </span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function SparkleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-yellow-400 rounded-full"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
