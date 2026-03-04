'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function AuroraBackground({ className }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-0 pointer-events-none overflow-hidden',
        className
      )}
      aria-hidden="true"
    >
      <style>{`
        @keyframes aurora-drift {
          0% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0.3;
          }
          33% { 
            transform: translate(30px, -30px) rotate(120deg) scale(1.1);
            opacity: 0.5;
          }
          66% { 
            transform: translate(-20px, 20px) rotate(240deg) scale(0.9);
            opacity: 0.4;
          }
          100% { 
            transform: translate(0, 0) rotate(360deg) scale(1);
            opacity: 0.3;
          }
        }
        
        @keyframes aurora-flow {
          0% { 
            background-position: 0% 50%;
            transform: translateX(0) translateY(0);
          }
          50% { 
            background-position: 100% 50%;
            transform: translateX(-100px) translateY(50px);
          }
          100% { 
            background-position: 0% 50%;
            transform: translateX(0) translateY(0);
          }
        }

        .aurora-gradient-1 {
          background: radial-gradient(
            ellipse at top right,
            rgba(59, 130, 246, 0.3) 0%,
            rgba(147, 51, 234, 0.2) 25%,
            rgba(236, 72, 153, 0.1) 50%,
            transparent 70%
          );
          animation: aurora-drift 20s ease-in-out infinite, aurora-flow 15s ease-in-out infinite;
        }

        .aurora-gradient-2 {
          background: radial-gradient(
            ellipse at top right,
            rgba(34, 211, 238, 0.25) 0%,
            rgba(59, 130, 246, 0.15) 30%,
            rgba(99, 102, 241, 0.1) 60%,
            transparent 80%
          );
          animation: aurora-drift 25s ease-in-out infinite reverse, aurora-flow 18s ease-in-out infinite;
        }

        .aurora-gradient-3 {
          background: radial-gradient(
            ellipse at top right,
            rgba(168, 85, 247, 0.2) 0%,
            rgba(236, 72, 153, 0.15) 40%,
            transparent 70%
          );
          animation: aurora-drift 30s ease-in-out infinite, aurora-flow 22s ease-in-out infinite reverse;
        }
      `}</style>
      
      {/* Multiple aurora layers for depth */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-0 right-0 w-[800px] h-[600px] aurora-gradient-1"
          style={{
            filter: 'blur(40px)',
          }}
        />
        <div 
          className="absolute top-0 right-0 w-[600px] h-[500px] aurora-gradient-2"
          style={{
            filter: 'blur(60px)',
            animationDelay: '5s',
          }}
        />
        <div 
          className="absolute top-0 right-0 w-[700px] h-[550px] aurora-gradient-3"
          style={{
            filter: 'blur(80px)',
            animationDelay: '10s',
          }}
        />
      </div>

      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-background/20" />
    </div>
  );
}
