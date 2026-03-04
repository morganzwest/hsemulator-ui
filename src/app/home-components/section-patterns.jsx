'use client';

import * as React from 'react';

export function DotPattern({ className, dotSize = 2, spacing = 20 }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className || ''}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes dot-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        .dot-pattern {
          background-image: radial-gradient(circle, hsl(var(--primary) / 0.4) 1px, transparent 1px);
          background-size: ${spacing}px ${spacing}px;
          animation: dot-pulse 4s ease-in-out infinite;
        }
      `}</style>
      <div className="absolute inset-0 dot-pattern" />
    </div>
  );
}

export function WavePattern({ className }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className || ''}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes wave-move {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .wave-line {
          animation: wave-move 20s linear infinite;
        }
        .wave-line:nth-child(2) { animation-delay: -5s; opacity: 0.5; }
        .wave-line:nth-child(3) { animation-delay: -10s; opacity: 0.3; }
      `}</style>
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[1, 2, 3].map((i) => (
          <path
            key={i}
            className="wave-line"
            d={`M0,${50 + i * 15} Q250,${20 + i * 10} 500,${50 + i * 15} T1000,${50 + i * 15} T1500,${50 + i * 15} T2000,${50 + i * 15}`}
            stroke="url(#wave-gradient)"
            strokeWidth="2"
            fill="none"
          />
        ))}
      </svg>
    </div>
  );
}

export function GridLines({ className }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className || ''}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes line-drift {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        .grid-lines {
          background-image: 
            linear-gradient(to bottom, transparent 59px, hsl(var(--primary) / 0.08) 60px);
          background-size: 100% 60px;
          animation: line-drift 15s linear infinite;
        }
      `}</style>
      <div className="absolute inset-0 grid-lines" />
    </div>
  );
}
