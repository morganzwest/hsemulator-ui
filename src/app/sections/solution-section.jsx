'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Code, GitBranch, Activity, Shield } from 'lucide-react';
import { SectionWrapper } from '../home-components/section-wrapper';
import { SolutionFlow } from '../home-components/flow-diagram';
import { HubSpotLogo } from '../home-components/hubspot-logo';
import { cn } from '@/lib/utils';

export function Ripple({
  className,
  children,
  mainCircleSize = 150,
  mainCircleOpacity = 0.24,
  numCircles = 6,
  color = 'rgba(255, 255, 255, 0.8)',
  showMask = false,
}) {
  return (
    <div className={cn('relative inset-0 overflow-hidden', className)}>
      {/* Keyframe animation */}
      <style>{`
        @keyframes ripple-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(0.9);
          }
        }
      `}</style>

      {/* Ripple container with optional radial fade mask */}
      <div
        className='pointer-events-none absolute inset-0 select-none z-0'
        style={{
          maskImage: showMask
            ? 'radial-gradient(ellipse at center, white 0%, white 30%, transparent 70%)'
            : 'none',
          WebkitMaskImage: showMask
            ? 'radial-gradient(ellipse at center, white 0%, white 30%, transparent 70%)'
            : 'none',
        }}
      >
        {Array.from({ length: numCircles }, (_, i) => {
          const size = mainCircleSize + i * 40;
          const opacity = mainCircleOpacity - i * 0.03;

          return (
            <div
              key={i}
              className='absolute rounded-full'
              style={{
                width: size,
                height: size,
                opacity,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(1)',
                border: `1px solid ${color}`,
                backgroundColor: `${color.replace(/[\d.]+\)$/, '0.1)')}`,
                boxShadow: `0 0 20px ${color.replace(/[\d.]+\)$/, '0.1)')}`,
                animation: 'ripple-pulse 2s ease-in-out infinite',
                animationDelay: `${i * 0.06}s`,
              }}
            />
          );
        })}
      </div>

      {/* Content layer */}
      {children && (
        <div className='relative z-20 h-full w-full'>{children}</div>
      )}
    </div>
  );
}

export default function RippleDemo() {
  return <Ripple />;
}

const capabilities = [
  {
    icon: null, // HubSpot logo handled separately
    isHubSpot: true,
    title: 'HubSpot Native',
    description:
      'Built specifically for HubSpot. Deep integration with workflows, CRM, and APIs.',
  },
  {
    icon: Code,
    title: 'Development Environment',
    description:
      'Proper code editor with syntax highlighting, IntelliSense, and language support.',
  },
  {
    icon: GitBranch,
    title: 'CI/CD Workflow',
    description:
      'Automated deployments with version control and change tracking.',
  },
  {
    icon: Activity,
    title: 'Execution Monitoring',
    description: 'Real-time logs, performance metrics, and failure alerts.',
  },
];

export function SolutionSection() {
  return (
    <SectionWrapper id='solution' className='bg-muted/30'>
      <div className='text-center mb-12'>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className='text-sm font-medium text-primary uppercase tracking-wider'
        >
          The Solution
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className='mt-4 text-3xl sm:text-4xl font-bold tracking-tight'
        >
          Novocode adds software engineering
          <span className='block text-primary'>
            discipline to HubSpot automation
          </span>
        </motion.h2>
      </div>

      {/* Architecture Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className='mb-16'
      >
        <SolutionFlow />
      </motion.div>

      {/* Capabilities */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {capabilities.map((cap, index) => (
          <motion.div
            key={cap.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className='flex flex-col items-center text-center p-6'
          >
            <div className='w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4'>
              {cap.isHubSpot ? (
                <HubSpotLogo className='p-2' size={40} />
              ) : (
                <cap.icon className='h-6 w-6 text-primary' />
              )}
            </div>
            <h3 className='font-semibold mb-2'>{cap.title}</h3>
            <p className='text-sm text-muted-foreground'>{cap.description}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
