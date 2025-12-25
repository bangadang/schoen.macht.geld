'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceDot,
} from 'recharts';
import { cn } from '@/lib/utils';
import { Trophy, Play, RotateCcw } from 'lucide-react';
import { useRaceData, type RaceStock } from '@/hooks/use-stocks';

// Extended stock info with current race value (actual price from chart)
interface RaceStockWithValue extends RaceStock {
  raceValue: number; // Current price from chart data
}

// Animation timing constants
const RACE_SYNC_INTERVAL_MS = 35000; // Must match the hook's sync interval
const END_BUFFER_MS = 5000; // Time to show completed race before new data loads

// Interpolate between two values
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Easing function for smoother animation
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Performance Race display.
 * Shows an animated line chart racing the top stocks against each other.
 * Smooth animation interpolates between data points.
 */
export default function PerformanceRaceClient() {
  const { raceStocks, raceData, isLoading } = useRaceData(5, 30);

  // Continuous animation progress (0 to totalFrames-1)
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const totalFrames = raceData.length;
  const isComplete = progress >= totalFrames - 1;
  const currentFrame = Math.floor(progress);

  // Calculate frame duration to fit animation within sync interval minus buffer
  const frameDurationMs = useMemo(() => {
    if (totalFrames <= 1) return 1000;
    return (RACE_SYNC_INTERVAL_MS - END_BUFFER_MS) / (totalFrames - 1);
  }, [totalFrames]);

  // Track which stocks we're racing - reset when this changes
  const stockTickersKey = useMemo(() => {
    return raceStocks.map((s) => s.ticker).sort().join(',');
  }, [raceStocks]);

  const prevStockTickersRef = useRef<string>('');

  // Reset animation when stocks change
  useEffect(() => {
    if (stockTickersKey && stockTickersKey !== prevStockTickersRef.current) {
      prevStockTickersRef.current = stockTickersKey;
      setProgress(0);
      setIsPlaying(true);
    }
  }, [stockTickersKey]);

  // Smooth animation loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || totalFrames === 0) return;

    const animate = (currentTime: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      // Calculate progress increment based on dynamic frame duration
      const progressIncrement = deltaTime / frameDurationMs;

      setProgress((prev) => {
        const next = prev + progressIncrement;
        if (next >= totalFrames - 1) {
          setIsPlaying(false);
          return totalFrames - 1;
        }
        return next;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = 0;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, totalFrames, frameDurationMs]);

  // No auto-restart - let the data refresh trigger a new race

  // Get interpolated value for a stock at current progress
  const getInterpolatedValue = useCallback(
    (ticker: string): number | null => {
      if (raceData.length === 0) return null;

      const frame = Math.floor(progress);
      const t = easeInOutCubic(progress - frame);

      const currentValue = raceData[frame]?.[ticker] as number | undefined;
      const nextValue = raceData[frame + 1]?.[ticker] as number | undefined;

      if (currentValue === undefined) return null;
      if (nextValue === undefined || frame >= totalFrames - 1) return currentValue;

      return lerp(currentValue, nextValue, t);
    },
    [raceData, progress, totalFrames]
  );

  // Create chart data - reveal frames one at a time (no line interpolation to avoid jumps)
  const chartData = useMemo(() => {
    return raceData.map((point, index) => {
      if (index <= currentFrame) {
        return point; // Show completed frames
      }
      // Future frames - null values
      const emptyPoint: Record<string, string | null> = { timestamp: point.timestamp };
      raceStocks.forEach((stock) => {
        emptyPoint[stock.ticker] = null;
      });
      return emptyPoint;
    });
  }, [raceData, currentFrame, raceStocks]);

  // Sort stocks by their interpolated value
  const sortedStocks = useMemo((): RaceStockWithValue[] => {
    if (raceData.length === 0 || raceStocks.length === 0) {
      return raceStocks.map((s) => ({ ...s, raceValue: s.currentPrice }));
    }

    return [...raceStocks]
      .map((stock) => ({
        ...stock,
        raceValue: getInterpolatedValue(stock.ticker) ?? stock.currentPrice,
      }))
      .sort((a, b) => b.raceValue - a.raceValue);
  }, [raceStocks, raceData, getInterpolatedValue]);

  // Get current timestamp for display (from completed frame)
  const currentTimestamp = raceData[currentFrame]?.timestamp ?? '';

  const handleRestart = useCallback(() => {
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (isComplete) {
      handleRestart();
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, [isComplete, handleRestart]);

  const stockCount = raceStocks.length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-white bg-black">
        <div className="text-2xl animate-pulse">Lade Renndaten...</div>
      </div>
    );
  }

  if (stockCount === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white bg-black">
        <div className="text-2xl">Keine Aktien verfügbar</div>
      </div>
    );
  }

  if (raceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-white bg-black">
        <div className="text-2xl">Keine Kursdaten verfügbar</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full p-6 flex flex-col bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-500" />
          <h1 className="text-4xl font-bold">Performance Race</h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Progress indicator */}
          <div className="text-gray-400 text-lg font-mono">
            {currentTimestamp} ({currentFrame + 1}/{totalFrames})
          </div>
          {/* Play/Restart button */}
          <button
            onClick={handleTogglePlay}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
            title={isComplete ? 'Neustart' : isPlaying ? 'Pause' : 'Abspielen'}
          >
            {isComplete ? (
              <RotateCcw className="w-5 h-5" />
            ) : (
              <Play className={cn('w-5 h-5', isPlaying && 'text-green-400')} />
            )}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-800 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-yellow-500"
          style={{ width: `${((progress + 1) / totalFrames) * 100}%` }}
        />
      </div>

      {/* Main content: Chart + Legend */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chart */}
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 250, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis
                dataKey="timestamp"
                tick={{ fill: 'white', fontSize: 12 }}
                tickLine={{ stroke: 'white' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
              />
              <YAxis
                domain={['dataMin - 5', 'dataMax + 5']}
                tick={{ fill: 'white', fontSize: 12 }}
                tickLine={{ stroke: 'white' }}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.3)' }}
                tickFormatter={(value) => `${value.toFixed(0)} CHF`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: 'white',
                }}
                labelStyle={{ fontWeight: 'bold', marginBottom: '8px' }}
                formatter={(value: number, name: string) => {
                  const stock = raceStocks.find((s) => s.ticker === name);
                  return [`${value.toFixed(2)} CHF`, stock?.title ?? name];
                }}
              />
              {raceStocks.map((stock) => (
                <Line
                  key={stock.ticker}
                  type="monotone"
                  dataKey={stock.ticker}
                  stroke={stock.color}
                  strokeWidth={3}
                  dot={false}
                  connectNulls={false}
                  isAnimationActive={false}
                />
              ))}
              {/* Stock cards positioned at line endpoints */}
              {sortedStocks.map((stock, index) => {
                const position = index + 1;
                return (
                  <ReferenceDot
                    key={`card-${stock.ticker}`}
                    x={currentTimestamp}
                    y={stock.raceValue}
                    r={0}
                    shape={(props) => (
                      <RaceStockCard
                        cx={props.cx ?? 0}
                        cy={props.cy ?? 0}
                        stock={stock}
                        position={position}
                      />
                    )}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// SVG-based stock card for positioning at line endpoints
function RaceStockCard({
  cx,
  cy,
  stock,
  position,
}: {
  cx: number;
  cy: number;
  stock: RaceStockWithValue;
  position: number;
}) {
  const cardWidth = 220;
  const cardHeight = 50;
  const offsetX = 15;
  const offsetY = -cardHeight / 2;

  // Position colors for medals
  const positionColors = {
    1: { bg: '#eab308', text: '#000' }, // gold
    2: { bg: '#9ca3af', text: '#000' }, // silver
    3: { bg: '#b45309', text: '#fff' }, // bronze
  };
  const posColor = positionColors[position as 1 | 2 | 3] || { bg: '#3f3f46', text: '#fff' };

  return (
    <g transform={`translate(${cx + offsetX}, ${cy + offsetY})`}>
      {/* Card background */}
      <rect
        x={0}
        y={0}
        width={cardWidth}
        height={cardHeight}
        rx={8}
        fill="#18181b"
        stroke={stock.color}
        strokeWidth={2}
      />

      {/* Position badge */}
      <circle
        cx={25}
        cy={cardHeight / 2}
        r={14}
        fill={posColor.bg}
      />
      <text
        x={25}
        y={cardHeight / 2 + 5}
        textAnchor="middle"
        fill={posColor.text}
        fontSize={14}
        fontWeight="bold"
      >
        {position}
      </text>

      {/* Stock title */}
      <text
        x={50}
        y={cardHeight / 2 - 5}
        fill="white"
        fontSize={13}
        fontWeight="600"
      >
        {stock.title.length > 14 ? stock.title.slice(0, 14) + '…' : stock.title}
      </text>

      {/* Stock ticker */}
      <text
        x={50}
        y={cardHeight / 2 + 12}
        fill="#9ca3af"
        fontSize={11}
        fontFamily="monospace"
      >
        {stock.ticker}
      </text>

      {/* Price value */}
      <rect
        x={cardWidth - 75}
        y={cardHeight / 2 - 12}
        width={65}
        height={24}
        rx={4}
        fill={stock.color + '33'}
      />
      <text
        x={cardWidth - 42}
        y={cardHeight / 2 + 4}
        textAnchor="middle"
        fill={stock.color}
        fontSize={12}
        fontWeight="bold"
        fontFamily="monospace"
      >
        {stock.raceValue.toFixed(1)}
      </text>
    </g>
  );
}