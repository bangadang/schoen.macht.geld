'use client';

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useStocks } from '@/hooks/use-stocks';
import { generateHeadlinesAiGenerateHeadlinesPost } from '@/lib/api/client';
import type { StockResponse } from '@/lib/api/client';
import {
  StockPrice,
  PercentChange,
  TickerSymbol,
  ChangeArrow,
  COLORS,
} from '@/components/display';
import '@/components/display/marquee.css';
import { TIMINGS } from '@/constants/timings';

/**
 * Base marquee component with Bloomberg terminal styling.
 * Horizontally scrolling text with configurable content.
 */
function Marquee({
  children,
  duration = 30,
  className = '',
}: {
  children: React.ReactNode;
  duration?: number;
  className?: string;
}) {
  return (
    <div className={`w-full overflow-hidden border-y border-border bg-black ${className}`}>
      <div
        className="flex animate-marquee whitespace-nowrap"
        style={{ animationDuration: `${duration}s` }}
      >
        {children}
        <span aria-hidden="true">{children}</span>
      </div>
    </div>
  );
}

/**
 * Stock price marquee - displays real-time stock prices scrolling horizontally.
 * Same style as the ticker view.
 */
export function StockMarquee({ speed = 1 }: { speed?: number }) {
  const { stocks, isLoading } = useStocks();

  const repeatedContent = useMemo(() => {
    if (!stocks || stocks.length === 0) return null;
    const repeatCount = Math.max(2, Math.ceil(40 / stocks.length));
    return Array(repeatCount)
      .fill(stocks)
      .flat()
      .map((stock: StockResponse, index: number) => (
        <span key={`${stock.ticker}-${index}`} className="flex items-center">
          <span className="text-muted-foreground mx-2">│</span>
          <TickerSymbol ticker={stock.ticker} size="sm" variant="primary" />
          <StockPrice
            value={stock.price}
            change={stock.change}
            glow
            size="sm"
            className="ml-2"
          />
          <span className="text-muted-foreground text-xs ml-1">CHF</span>
          <ChangeArrow value={stock.change} size="sm" className="ml-1" />
          <PercentChange
            value={stock.percent_change}
            size="sm"
            className="ml-0.5"
          />
        </span>
      ));
  }, [stocks]);

  if (isLoading && stocks.length === 0) {
    return (
      <div className="w-full h-8 flex items-center justify-center bg-black text-primary border-y border-border">
        <span className="text-sm">▌ LADE KURSDATEN... ▐</span>
      </div>
    );
  }

  if (!repeatedContent) return null;

  const baseDuration = (stocks?.length || 10) * 4;
  const animationDuration = baseDuration / speed;

  return (
    <div className="h-8 flex items-center bg-black text-sm shrink-0 overflow-hidden">
      <Marquee duration={animationDuration}>{repeatedContent}</Marquee>
    </div>
  );
}

/**
 * Headlines marquee - displays AI-generated news headlines scrolling horizontally.
 * Styled exactly like the stock marquee.
 */
export function HeadlinesMarquee({ speed = 1 }: { speed?: number }) {
  const { stocks } = useStocks();
  const [headlineQueue, setHeadlineQueue] = useState<string[]>([]);
  const hasLoadedAi = useRef(false);
  const hasFetchedOnMount = useRef(false);

  // Generate fallback headlines from top movers
  const fallbackHeadlines = useMemo(() => {
    if (!stocks || stocks.length === 0) {
      return ['Willkommen beim Schön. Macht. Geld. News Network.'];
    }

    const topMovers = [...stocks]
      .sort((a, b) => Math.abs(b.percent_change) - Math.abs(a.percent_change))
      .slice(0, 5);

    return topMovers.map((stock) => {
      const direction = stock.percent_change >= 0 ? 'steigt' : 'fällt';
      const arrow = stock.percent_change >= 0 ? '▲' : '▼';
      return `${arrow} ${stock.title} (${stock.ticker}) ${direction} um ${Math.abs(stock.percent_change).toFixed(2)}%`;
    });
  }, [stocks]);

  // Initialize with fallback headlines
  useEffect(() => {
    if (headlineQueue.length === 0 && fallbackHeadlines.length > 0) {
      setHeadlineQueue(fallbackHeadlines);
    }
  }, [fallbackHeadlines, headlineQueue.length]);

  // Fetch AI headlines and append to queue
  const fetchHeadlines = useCallback(async () => {
    try {
      const response = await generateHeadlinesAiGenerateHeadlinesPost({
        query: { count: 5 },
      });
      if (response.data?.headlines && response.data.headlines.length > 0) {
        const newHeadlines = response.data.headlines;
        if (!hasLoadedAi.current) {
          setHeadlineQueue(newHeadlines);
          hasLoadedAi.current = true;
        } else {
          setHeadlineQueue((prev) => [...prev, ...newHeadlines]);
        }
      }
    } catch {
      // Keep current headlines on error
    }
  }, []);

  // Fetch headlines on mount and periodically
  useEffect(() => {
    if (!hasFetchedOnMount.current) {
      hasFetchedOnMount.current = true;
      fetchHeadlines();
    }

    const interval = setInterval(fetchHeadlines, TIMINGS.headlineRefresh);
    return () => clearInterval(interval);
  }, [fetchHeadlines]);

  const repeatedContent = useMemo(() => {
    if (headlineQueue.length === 0) return null;
    const repeatCount = Math.max(2, Math.ceil(20 / headlineQueue.length));
    return Array(repeatCount)
      .fill(headlineQueue)
      .flat()
      .map((headline: string, index: number) => (
        <span key={`headline-${index}`} className="flex items-center">
          <span className="text-muted-foreground mx-2">│</span>
          <span className="font-bold text-primary uppercase tracking-wide">
            {headline}
          </span>
        </span>
      ));
  }, [headlineQueue]);

  if (!repeatedContent) return null;

  const baseDuration = Math.max(30, headlineQueue.length * 8);
  const animationDuration = baseDuration / speed;

  return (
    <div className="h-8 flex items-center bg-black text-sm shrink-0 overflow-hidden">
      <Marquee duration={animationDuration}>{repeatedContent}</Marquee>
    </div>
  );
}
