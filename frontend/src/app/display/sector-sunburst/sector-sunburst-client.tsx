'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateStockGroupsAiGenerateStockGroupsGet } from '@/lib/api/client';
import type { StockGroup } from '@/lib/api/client';

const REFRESH_INTERVAL_MS = 90000;

// Color palette for sectors
const SECTOR_COLORS = [
  '#A020F0', // Primary purple
  '#20A0F0', // Accent blue
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#EC4899', // Pink
  '#F59E0B', // Amber
];

// Lighter shades for stocks
const STOCK_COLORS = [
  ['#C084FC', '#D8B4FE', '#E9D5FF', '#F3E8FF'],
  ['#38BDF8', '#7DD3FC', '#BAE6FD', '#E0F2FE'],
  ['#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
  ['#22D3EE', '#67E8F9', '#A5F3FC', '#CFFAFE'],
  ['#F472B6', '#F9A8D4', '#FBCFE8', '#FCE7F3'],
  ['#FBBF24', '#FCD34D', '#FDE68A', '#FEF3C7'],
];

interface ArcData {
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  fill: string;
  name: string;
  value: number;
  isStock?: boolean;
}

// Convert polar to cartesian coordinates
function polarToCartesian(cx: number, cy: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

// Generate SVG arc path
function describeArc(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) {
  const start1 = polarToCartesian(cx, cy, outerRadius, endAngle);
  const end1 = polarToCartesian(cx, cy, outerRadius, startAngle);
  const start2 = polarToCartesian(cx, cy, innerRadius, startAngle);
  const end2 = polarToCartesian(cx, cy, innerRadius, endAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    'M', start1.x, start1.y,
    'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end1.x, end1.y,
    'L', start2.x, start2.y,
    'A', innerRadius, innerRadius, 0, largeArcFlag, 1, end2.x, end2.y,
    'Z',
  ].join(' ');
}

// Custom Sunburst Component
function CustomSunburst({
  groups,
  width,
  height,
}: {
  groups: StockGroup[];
  width: number;
  height: number;
}) {
  const cx = width / 2;
  const cy = height / 2;
  const maxRadius = Math.min(width, height) / 2 - 10;

  // Ring dimensions
  const innerRadius = maxRadius * 0.25;
  const sectorOuterRadius = maxRadius * 0.55;
  const stockOuterRadius = maxRadius * 0.95;
  const gap = 3;

  // Calculate total value
  const totalValue = groups.reduce(
    (sum, g) => sum + g.stocks.reduce((s, stock) => s + Math.max(stock.price, 1), 0),
    0
  );

  // Build arc data
  const arcs: ArcData[] = [];
  let currentAngle = 0;

  groups.forEach((group, sectorIndex) => {
    const sectorValue = group.stocks.reduce((sum, s) => sum + Math.max(s.price, 1), 0);
    const sectorAngle = (sectorValue / totalValue) * 360;
    const sectorStartAngle = currentAngle;
    const sectorEndAngle = currentAngle + sectorAngle;

    // Add sector arc
    arcs.push({
      startAngle: sectorStartAngle + gap / 2,
      endAngle: sectorEndAngle - gap / 2,
      innerRadius: innerRadius,
      outerRadius: sectorOuterRadius - gap,
      fill: SECTOR_COLORS[sectorIndex % SECTOR_COLORS.length],
      name: group.name,
      value: sectorValue,
    });

    // Add stock arcs within this sector
    let stockAngle = sectorStartAngle;
    group.stocks.forEach((stock, stockIndex) => {
      const stockValue = Math.max(stock.price, 1);
      const stockArcAngle = (stockValue / sectorValue) * sectorAngle;
      const stockStartAngle = stockAngle;
      const stockEndAngle = stockAngle + stockArcAngle;

      arcs.push({
        startAngle: stockStartAngle + gap / 2,
        endAngle: stockEndAngle - gap / 2,
        innerRadius: sectorOuterRadius + gap,
        outerRadius: stockOuterRadius,
        fill: STOCK_COLORS[sectorIndex % STOCK_COLORS.length][stockIndex % 4],
        name: stock.title,
        value: stock.price,
        isStock: true,
      });

      stockAngle = stockEndAngle;
    });

    currentAngle = sectorEndAngle;
  });

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Arcs */}
      {arcs.map((arc, i) => (
        <motion.path
          key={`arc-${i}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.02, duration: 0.3 }}
          d={describeArc(cx, cy, arc.innerRadius, arc.outerRadius, arc.startAngle, arc.endAngle)}
          fill={arc.fill}
          stroke="#000"
          strokeWidth={2}
          className="cursor-pointer hover:brightness-110 transition-all"
        />
      ))}

      {/* Center - drawn before labels so it doesn't cover them */}
      <circle cx={cx} cy={cy} r={innerRadius - gap} fill="#000" />

      {/* Labels with boxes */}
      {arcs.map((arc, i) => {
        const midAngle = (arc.startAngle + arc.endAngle) / 2;
        const labelRadius = (arc.innerRadius + arc.outerRadius) / 2;
        const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);
        const arcAngle = arc.endAngle - arc.startAngle;

        // Only show label if arc is big enough
        const showLabel = arcAngle > 15;
        if (!showLabel) return null;

        // Estimate box size based on text length
        const charWidth = arc.isStock ? 7 : 8;
        const boxWidth = Math.max(arc.isStock ? 60 : 80, arc.name.length * charWidth + 20);
        const boxHeight = arc.isStock ? 24 : 28;

        return (
          <foreignObject
            key={`label-${i}`}
            x={labelPos.x - boxWidth / 2}
            y={labelPos.y - boxHeight / 2}
            width={boxWidth}
            height={boxHeight}
            className="pointer-events-none"
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '0 8px',
                color: 'white',
                fontSize: arc.isStock ? '11px' : '13px',
                fontWeight: arc.isStock ? 'normal' : 'bold',
                whiteSpace: 'nowrap',
              }}
            >
              {arc.name}
            </div>
          </foreignObject>
        );
      })}
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fill="#A020F0"
        fontSize={24}
        fontWeight="bold"
      >
        SMG
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="#666"
        fontSize={12}
      >
        Börse
      </text>
    </svg>
  );
}

export default function SectorSunburstClient() {
  const [groups, setGroups] = useState<StockGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setDimensions({ width: rect.width, height: rect.height });
        }
      }
    };

    const timeout = setTimeout(updateDimensions, 100);
    window.addEventListener('resize', updateDimensions);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateDimensions);
    };
  }, [isLoading]);

  const fetchGroups = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await generateStockGroupsAiGenerateStockGroupsGet();
      if (response.data?.groups) {
        setGroups(response.data.groups);
      }
    } catch (err) {
      console.error('Failed to fetch stock groups:', err);
      setError('Generierung fehlgeschlagen');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch - only once
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchGroups();
  }, [fetchGroups]);

  // Auto-refresh interval
  useEffect(() => {
    const interval = setInterval(() => fetchGroups(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchGroups]);

  const stats = useMemo(() => {
    const totalStocks = groups.reduce((sum, g) => sum + g.stocks.length, 0);
    const allStocks = groups.flatMap((g) => g.stocks);
    const totalValue = allStocks.reduce((sum, s) => sum + s.price, 0);
    return { totalStocks, totalValue, sectorCount: groups.length };
  }, [groups]);

  const chartSize = Math.min(dimensions.width, dimensions.height);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <PieChart className="w-16 h-16 text-purple-500" />
        </motion.div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-4 text-xl"
        >
          Praktikant sortiert Aktien...
        </motion.p>
      </div>
    );
  }

  if (error || groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-black text-white">
        <PieChart className="w-16 h-16 text-gray-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">{error || 'Keine Sektoren verfügbar'}</h2>
        <p className="text-gray-400 mb-4">Nicht genug Aktien für Gruppierung</p>
        <button
          onClick={() => fetchGroups()}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg"
        >
          <RefreshCw className="w-4 h-4" />
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="absolute top-2 left-4 right-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <PieChart className="w-5 h-5 text-purple-400" />
          <h1 className="text-lg font-bold">Sektor Sunburst</h1>
          <span className="text-gray-500 text-sm">
            {stats.sectorCount} Sektoren · {stats.totalStocks} Aktien · {stats.totalValue.toFixed(2)} CHF
          </span>
        </div>
        <button
          onClick={() => fetchGroups(true)}
          disabled={isRefreshing}
          className={cn(
            'flex items-center gap-2 px-3 py-1 rounded-lg text-sm bg-white/10 hover:bg-white/20',
            isRefreshing && 'opacity-50 cursor-not-allowed'
          )}
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          Neu
        </button>
      </div>

      {/* Chart */}
      <div ref={containerRef} className="absolute top-10 bottom-16 left-0 right-0 flex items-center justify-center">
        {chartSize > 100 && (
          <CustomSunburst groups={groups} width={chartSize} height={chartSize} />
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-2 left-4 right-4 z-20">
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
          {groups.map((group, index) => {
            const sectorTotal = group.stocks.reduce((sum, s) => sum + s.price, 0);
            return (
              <div key={group.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SECTOR_COLORS[index % SECTOR_COLORS.length] }}
                />
                <span className="text-sm font-medium truncate max-w-[200px]">{group.name}</span>
                <span className="text-sm text-gray-400 font-mono">{sectorTotal.toFixed(2)} CHF</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
