'use client';

import * as React from 'react';

export function AnimatedGrid({ className }) {
  return (
    <div
      className={`fixed inset-0 z-0 pointer-events-none overflow-hidden ${className || ''}`}
      aria-hidden="true"
    >
      <style>{`
        @keyframes grid-drift {
          0% { transform: translateX(0); }
          100% { transform: translateX(40px); }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.03; }
          50% { opacity: 0.06; }
        }
        .animated-grid-pattern {
          background-image: 
            linear-gradient(to right, hsl(var(--primary) / 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--primary) / 0.08) 1px, transparent 1px);
          background-size: 40px 40px;
          animation: grid-drift 20s linear infinite, grid-pulse 8s ease-in-out infinite;
        }
      `}</style>
      <div className="absolute inset-0 animated-grid-pattern" />
      {/* Fade edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
    </div>
  );
}
