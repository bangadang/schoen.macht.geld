'use client';

import { mockStocks } from '@/lib/mock-data';
import type { Stock } from '@/lib/types';
import { useEffect, useState } from 'react';
import { ResponsiveContainer, Tooltip, Treemap } from 'recharts';

const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, colors, name, value } = props;
  
  // The actual data object from our `data` array is in `props.payload`
  const stockData = props.payload;
  if (!stockData) return null;

  const change = stockData.change || 0;
  const isPositive = change >= 0;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: isPositive ? '#10B981' : '#EF4444',
          stroke: '#1f2937',
          strokeWidth: 2,
          opacity: 0.8,
        }}
      />
      <foreignObject x={x + 4} y={y + 4} width={width - 8} height={height - 8}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            color: 'white',
            textAlign: 'left',
          }}
        >
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{name}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{stockData.ticker}</div>
          </div>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              ${value.toFixed(2)}
            </div>
            <div style={{ color: isPositive ? '#A7F3D0' : '#FECACA' }}>
              {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </div>
          </div>
        </div>
      </foreignObject>
    </g>
  );
};

export default function MarketMapClient() {
  const [data, setData] = useState<(Stock & { change: number })[]>([]);

  useEffect(() => {
     const loadData = () => {
      const hasRegistered = localStorage.getItem('firstRegistration') === 'true';
      let stocksToDisplay;
      if (hasRegistered) {
        const storedStocks = JSON.parse(localStorage.getItem('stocks') || '[]');
        stocksToDisplay = storedStocks.length > 0 ? storedStocks : mockStocks;
      } else {
        stocksToDisplay = mockStocks;
      }
      setData(stocksToDisplay.map((s: Stock) => ({ ...s, change: s.sentiment })));
    };
    
    loadData(); // Initial load
    const dataInterval = setInterval(loadData, 3000); // Refresh data every 3 seconds

    return () => clearInterval(dataInterval);
  }, []);
  
  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey="value"
        nameKey="nickname"
        aspectRatio={16 / 9}
        content={<CustomizedContent />}
        isAnimationActive={false} // Better for frequent updates
      >
        <Tooltip
          contentStyle={{
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: 'white' }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
