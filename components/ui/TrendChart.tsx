import React from 'react';

interface DataPoint {
  date: string;
  score: number;
}

interface TrendChartProps {
  data: DataPoint[];
  height?: number;
}

export function TrendChart({ data, height = 160 }: TrendChartProps) {
  if (!data || data.length === 0) return null;

  const minScore = Math.min(...data.map(d => d.score)) - 5;
  const maxScore = Math.max(...data.map(d => d.score)) + 5;
  const range = maxScore - minScore;

  // We'll use 100% width, but define viewBox for scaling
  const width = 800;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.score - minScore) / range) * height;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(' L ')}`;
  const areaData = `${pathData} L ${width},${height} L 0,${height} Z`;

  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 -10 ${width} ${height + 20}`} 
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        {/* Subtle grid lines */}
        <line x1="0" y1={height} x2={width} y2={height} stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1="0" x2={width} y2="0" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" />

        {/* Area fill */}
        <path 
          d={areaData} 
          fill="var(--color-gray-100)" 
          opacity="0.5"
        />
        
        {/* Line */}
        <path 
          d={pathData} 
          fill="none" 
          stroke="var(--color-black)" 
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * width;
          const y = height - ((d.score - minScore) / range) * height;
          return (
            <circle 
              key={i} 
              cx={x} 
              cy={y} 
              r="3" 
              fill="var(--color-white)" 
              stroke="var(--color-black)"
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
}
