'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
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
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Trophy, Play, RotateCcw } from 'lucide-react';
import { useRaceData, type RaceStock } from '@/hooks/use-stocks';

// Extended stock info with current race value (actual price from chart)
interface RaceStockWithValue extends RaceStock {
  raceValue: number; // Current price from chart data
}

// Animation timing constants
const FRAME_DURATION_MS = 800; // Time to display each frame
const DOT_ANIMATION_DURATION_MS = 200; // Dot grows then shrinks

// Custom animated dot component for the current position with price label
function AnimatedDot({
  cx,
  cy,
  color,
  price,
  ticker,
}: {
  cx: number;
  cy: number;
  color: string;
  price: number;
  ticker: string;
}) {
  return (
    <g>
      {/* Outer expanding ring */}
      <circle
        cx={cx}
        cy={cy}
        r={16}
        fill="none"
        stroke={color}
        strokeWidth={2}
        opacity={0.5}
        style={{
          animation: `race-dot-ring ${DOT_ANIMATION_DURATION_MS}ms ease-out`,
        }}
      />
      {/* Main dot with scale animation */}
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill={color}
        stroke="white"
        strokeWidth={2}
        style={{
          animation: `race-dot-pulse ${DOT_ANIMATION_DURATION_MS}ms ease-out`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
      {/* Price label */}
      <g
        style={{
          animation: `race-dot-pulse ${DOT_ANIMATION_DURATION_MS}ms ease-out`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      >
        {/* Background pill for readability */}
        <rect
          x={cx + 12}
          y={cy - 10}
          width={70}
          height={20}
          rx={4}
          fill="rgba(0, 0, 0, 0.8)"
          stroke={color}
          strokeWidth={1}
        />
        {/* Price text */}
        <text
          x={cx + 47}
          y={cy + 4}
          textAnchor="middle"
          fill="white"
          fontSize={12}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {price.toFixed(2)}
        </text>
      </g>
    </g>
  );
}

/**
 * Performance Race display.
 * Shows an animated line chart racing the top stocks against each other.
 * Each data point is revealed one at a time with ~1 second intervals.
 */
export default function PerformanceRaceClient() {
  const { raceStocks, raceData, isLoading } = useRaceData(5, 30);

  // Animation state
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const totalFrames = raceData.length;
  const isComplete = currentFrame >= totalFrames - 1;

  // Reset animation when data changes
  useEffect(() => {
    if (raceData.length > 0) {
      setCurrentFrame(0);
      setIsPlaying(true);
    }
  }, [raceData.length]);

  // Animation timer - advance one frame per FRAME_DURATION_MS
  useEffect(() => {
    if (!isPlaying || isComplete || totalFrames === 0) return;

    const timer = setInterval(() => {
      setCurrentFrame((prev) => {
        if (prev >= totalFrames - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, FRAME_DURATION_MS);

    return () => clearInterval(timer);
  }, [isPlaying, isComplete, totalFrames]);

  // Create chart data with full X axis, but null values for future points
  const chartData = useMemo(() => {
    return raceData.map((point, index) => {
      if (index <= currentFrame) {
        return point; // Show actual values for revealed points
      }
      // Return point with only timestamp (null values for stocks)
      const emptyPoint: Record<string, string | null> = { timestamp: point.timestamp };
      raceStocks.forEach((stock) => {
        emptyPoint[stock.ticker] = null;
      });
      return emptyPoint;
    });
  }, [raceData, currentFrame, raceStocks]);

  // Get visible data (only up to current frame) for ranking/display
  const visibleData = useMemo(() => {
    return raceData.slice(0, currentFrame + 1);
  }, [raceData, currentFrame]);

  // Sort stocks by their value at the current frame
  const sortedStocks = useMemo((): RaceStockWithValue[] => {
    if (visibleData.length === 0 || raceStocks.length === 0) {
      return raceStocks.map((s) => ({ ...s, raceValue: s.currentPrice }));
    }

    const currentPoint = visibleData[visibleData.length - 1];
    return [...raceStocks]
      .map((stock) => ({
        ...stock,
        raceValue: (currentPoint[stock.ticker] as number) ?? stock.currentPrice,
      }))
      .sort((a, b) => b.raceValue - a.raceValue);
  }, [raceStocks, visibleData]);

  // Get current timestamp for display
  const currentTimestamp = visibleData.length > 0
    ? visibleData[visibleData.length - 1].timestamp
    : '';

  const handleRestart = useCallback(() => {
    setCurrentFrame(0);
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
          className="h-full bg-yellow-500 transition-all duration-1000 ease-linear"
          style={{ width: `${((currentFrame + 1) / totalFrames) * 100}%` }}
        />
      </div>

      {/* Main content: Chart + Legend */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chart */}
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
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
              {/* Animated dots at current position with price labels */}
              {visibleData.length > 0 &&
                raceStocks.map((stock) => {
                  const currentValue = visibleData[visibleData.length - 1][stock.ticker] as number;
                  if (currentValue === undefined) return null;
                  return (
                    <ReferenceDot
                      key={`dot-${stock.ticker}-${currentFrame}`}
                      x={currentTimestamp}
                      y={currentValue}
                      shape={(props) => (
                        <AnimatedDot
                          cx={props.cx ?? 0}
                          cy={props.cy ?? 0}
                          color={stock.color}
                          price={currentValue}
                          ticker={stock.ticker}
                        />
                      )}
                    />
                  );
                })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Leaderboard */}
        <div className="w-80 flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Rangliste
          </h2>
          {sortedStocks.map((stock, index) => (
            <RaceStockCard key={stock.ticker} stock={stock} position={index + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RaceStockCard({
  stock,
  position,
}: {
  stock: RaceStockWithValue;
  position: number;
}) {
  const isPositive = stock.percentChange >= 0;

  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border-l-4 transition-all duration-300"
      style={{ borderLeftColor: stock.color }}
    >
      {/* Position */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 transition-all duration-300',
          position === 1 && 'bg-yellow-500 text-black scale-110',
          position === 2 && 'bg-gray-400 text-black',
          position === 3 && 'bg-amber-700 text-white',
          position > 3 && 'bg-zinc-700 text-white'
        )}
      >
        {position}
      </div>

      {/* Stock image */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-zinc-700 flex-shrink-0">
        {stock.image ? (
          <Image
            unoptimized
            src={stock.image}
            alt={stock.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-xs font-bold">
            {stock.ticker.slice(0, 2)}
          </div>
        )}
      </div>

      {/* Stock info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{stock.title}</div>
        <div className="text-sm text-gray-400 font-mono">{stock.ticker}</div>
      </div>

      {/* Race value (current chart price) */}
      <div
        className="px-2 h-8 rounded flex items-center justify-center font-mono font-bold text-sm transition-all duration-300"
        style={{ backgroundColor: stock.color + '33', color: stock.color }}
      >
        {stock.raceValue.toFixed(2)}
      </div>

      {/* Price & change */}
      <div className="text-right flex-shrink-0">
        <div className="font-mono font-semibold">{stock.currentPrice.toFixed(2)}</div>
        <div
          className={cn(
            'text-sm font-mono',
            isPositive ? 'text-green-400' : 'text-red-400'
          )}
        >
          {isPositive ? '+' : ''}
          {stock.percentChange.toFixed(1)}%
        </div>
      </div>
    </div>
  );
}