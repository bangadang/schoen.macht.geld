'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Trophy } from 'lucide-react';
import { useRaceData, type RaceStock } from '@/hooks/use-stocks';

// Extended stock info with current race value (actual price from chart)
interface RaceStockWithValue extends RaceStock {
  raceValue: number; // Current price from chart data
}

/**
 * Performance Race display.
 * Shows an animated line chart racing the top stocks against each other.
 */
export default function PerformanceRaceClient() {
  // Fetch up to 5 stocks, but works with fewer; use 20 snapshots for slower sampling
  const { raceStocks, raceData, isLoading } = useRaceData(5, 20);

  // Sort stocks by current price (latest data point) and include race value
  const sortedStocks = useMemo((): RaceStockWithValue[] => {
    if (raceData.length === 0 || raceStocks.length === 0) {
      return raceStocks.map((s) => ({ ...s, raceValue: s.currentPrice }));
    }

    const latestPoint = raceData[raceData.length - 1];
    return [...raceStocks]
      .map((stock) => ({
        ...stock,
        raceValue: (latestPoint[stock.ticker] as number) ?? stock.currentPrice,
      }))
      .sort((a, b) => b.raceValue - a.raceValue); // Higher price = better position
  }, [raceStocks, raceData]);

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
        <div className="text-gray-400 text-lg">
          {stockCount === 1
            ? '1 Aktie'
            : `Top ${stockCount} Aktien im Vergleich`}
        </div>
      </div>

      {/* Main content: Chart + Legend */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Chart */}
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={raceData}
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
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                />
              ))}
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
      className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border-l-4"
      style={{ borderLeftColor: stock.color }}
    >
      {/* Position */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0',
          position === 1 && 'bg-yellow-500 text-black',
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
        className="px-2 h-8 rounded flex items-center justify-center font-mono font-bold text-sm"
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
