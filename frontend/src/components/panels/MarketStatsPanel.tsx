'use client';

import { useMemo } from 'react';
import { useStocks } from '@/hooks/use-stocks';
import {
  Panel,
  TickerSymbol,
  StockPrice,
  PercentChange,
  StatBox,
  DisplayLoading,
} from '@/components/display';
import { LOADING_MESSAGES, LABELS, EMPTY_STATE_MESSAGES } from '@/constants/messages';

interface MarketStatsPanelProps {
  /** Whether to show a compact view */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to hide the panel header */
  hideHeader?: boolean;
}

/**
 * Embeddable market statistics panel showing key market metrics
 */
export function MarketStatsPanel({
  compact = false,
  className,
  hideHeader = false,
}: MarketStatsPanelProps) {
  const { stocks, isLoading } = useStocks();

  const stats = useMemo(() => {
    if (stocks.length === 0) return null;

    const highest = [...stocks].sort((a, b) => b.price - a.price)[0];
    const lowest = [...stocks].sort((a, b) => a.price - b.price)[0];
    const biggestMove = [...stocks].sort((a, b) => Math.abs(b.percent_change) - Math.abs(a.percent_change))[0];
    const mostStable = [...stocks].sort((a, b) => Math.abs(a.percent_change) - Math.abs(b.percent_change))[0];

    return { highest, lowest, biggestMove, mostStable };
  }, [stocks]);

  if (isLoading && stocks.length === 0) {
    return (
      <Panel title="STATISTIK" className={className} hideHeader={hideHeader} compact={compact}>
        <DisplayLoading message={LOADING_MESSAGES.terminal} />
      </Panel>
    );
  }

  if (!stats) {
    return (
      <Panel title="STATISTIK" className={className} hideHeader={hideHeader} compact={compact}>
        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
          {EMPTY_STATE_MESSAGES.noDataShort}
        </div>
      </Panel>
    );
  }

  return (
    <Panel
      title="STATISTIK"
      className={className}
      hideHeader={hideHeader}
      compact={compact}
    >
      <div className="h-full p-2 grid grid-cols-2 gap-2 text-xs">
        <StatBox label={LABELS.highestPrice}>
          <TickerSymbol ticker={stats.highest.ticker} size="xs" />
          <StockPrice value={stats.highest.price} change={stats.highest.change} size="sm" glow />
        </StatBox>
        <StatBox label={LABELS.lowestPrice}>
          <TickerSymbol ticker={stats.lowest.ticker} size="xs" />
          <StockPrice value={stats.lowest.price} change={stats.lowest.change} size="sm" glow />
        </StatBox>
        <StatBox label={LABELS.biggestMove}>
          <TickerSymbol ticker={stats.biggestMove.ticker} size="xs" />
          <PercentChange value={stats.biggestMove.percent_change} showArrow size="sm" />
        </StatBox>
        <StatBox label={LABELS.mostStable}>
          <TickerSymbol ticker={stats.mostStable.ticker} size="xs" />
          <PercentChange value={stats.mostStable.percent_change} showArrow size="sm" />
        </StatBox>
      </div>
    </Panel>
  );
}
