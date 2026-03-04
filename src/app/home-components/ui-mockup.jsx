'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Terminal, Play, FileCode, Logs } from 'lucide-react';

// Stable random number generator for firework positions
const generateRandomOffset = (index) => {
  const seed = index * 1234; // Deterministic seed based on index
  const x = Math.sin(seed) * 50;
  const y = Math.cos(seed) * 50;
  return { x, y };
};

const floatAnimation = {
  y: [0, -12, 0],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  },
};

const floatAnimationDelay = {
  y: [0, -8, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: 'easeInOut',
    delay: 0.5,
  },
};

export function UIMockup() {
  return (
    <div className='relative w-full max-w-4xl mx-auto mt-12'>
      {/* Main editor card */}
      <motion.div
        className='relative rounded-xl border bg-card/90 backdrop-blur-sm shadow-2xl overflow-hidden'
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        {/* Window header */}
        <div className='flex items-center justify-between px-4 py-3 border-b bg-muted/50'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded-full bg-red-500' />
            <div className='w-3 h-3 rounded-full bg-yellow-500' />
            <div className='w-3 h-3 rounded-full bg-green-500' />
          </div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <FileCode className='h-3.5 w-3.5' />
            <span>action.js</span>
          </div>
          <div className='w-16' />
        </div>

        {/* Code content */}
        <div className='p-6 font-mono text-sm'>
          <div className='space-y-1'>
            <div className='flex'>
              <span className='text-muted-foreground w-8 select-none'>1</span>
              <span>
                <span className='text-purple-400'>exports</span>.
                <span className='text-blue-400'>main</span> ={' '}
                <span className='text-purple-400'>async</span> (
                <span className='text-orange-400'>event</span>) ={'>'} {'{'}
              </span>
            </div>
            <div className='flex'>
              <span className='text-muted-foreground w-8 select-none'>2</span>
              <span className='pl-4'>
                <span className='text-purple-400'>const</span> email = event.
                <span className='text-blue-400'>inputFields</span>?.email;
              </span>
            </div>
            <div className='flex'>
              <span className='text-muted-foreground w-8 select-none'>3</span>
              <span className='pl-4'>
                <span className='text-purple-400'>const</span> domain = email.
                <span className='text-blue-400'>split</span>(
                <span className='text-green-400'>&quot;@&quot;</span>)[
                <span className='text-yellow-400'>1</span>];
              </span>
            </div>
            <div className='flex'>
              <span className='text-muted-foreground w-8 select-none'>4</span>
              <span className='pl-4'>
                console.<span className='text-blue-400'>log</span>(
                <span className='text-green-400'>
                  &quot;Processing contact&quot;
                </span>
                , {'{'} email, domain {'}'});
              </span>
            </div>
            <div className='flex'>
              <span className='text-muted-foreground w-8 select-none'>5</span>
              <span className='pl-4'>
                <span className='text-purple-400'>return</span> {'{'} email,
                domain, processedAt:{' '}
                <span className='text-purple-400'>new</span>{' '}
                <span className='text-yellow-400'>Date</span>() {'}'};
              </span>
            </div>
            <div className='flex'>
              <span className='text-muted-foreground w-8 select-none'>6</span>
              <span>{'}'};</span>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div className='flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground'>
          <div className='flex items-center gap-4'>
            <span className='flex items-center gap-1.5'>
              <span className='w-2 h-2 rounded-full bg-green-500' />
              Ready
            </span>
            <span>JavaScript</span>
          </div>
          <span>HubSpot Runtime v2.1</span>
        </div>
      </motion.div>

      {/* Floating execution log card */}
      <motion.div
        className='absolute -bottom-6 -right-4 lg:right-8 w-64 rounded-lg border bg-card/95 backdrop-blur-sm shadow-xl overflow-hidden'
        initial={{ opacity: 0, x: 20 }}
        animate={{
          opacity: 1,
          x: 0,
          y: [0, -8, 0],
        }}
        transition={{
          opacity: { duration: 0.6, delay: 0.8 },
          x: { duration: 0.6, delay: 0.8 },
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 },
        }}
      >
        <div className='flex items-center justify-between px-3 py-2 border-b bg-muted/50'>
          <div className='flex items-center gap-2'>
            <Logs className='h-3.5 w-3.5 text-muted-foreground' />
            <span className='text-xs font-medium'>Execution Log</span>
          </div>
          <span className='text-[10px] text-green-500'>● Live</span>
        </div>
        <div className='p-3 font-mono text-xs space-y-1'>
          <div className='text-green-400'>✓ Execution succeeded</div>
          <div className='text-muted-foreground'>Duration: 42ms</div>
          <div className='text-muted-foreground'>Memory: 12MB</div>
        </div>
      </motion.div>

      {/* Floating deploy button card */}
      <motion.div
        className='absolute -top-4 right-4 lg:right-0 max-w-42 lg:left-22 rounded-lg border bg-primary text-primary-foreground shadow-xl overflow-hidden px-4 py-2'
        initial={{ opacity: 0, x: -20 }}
        animate={{
          opacity: 1,
          x: 0,
          y: [0, -6, 0],
        }}
        transition={{
          opacity: { duration: 0.6, delay: 1 },
          x: { duration: 0.6, delay: 1 },
          y: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className='flex items-center gap-2 relative'>
          {/* Firework effect */}
          <motion.div
            className='absolute inset-0 pointer-events-auto'
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className='absolute w-1 h-1 bg-yellow-400 rounded-full'
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, generateRandomOffset(i).x * 100, 0],
                  y: [0, generateRandomOffset(i).y * 100, 0],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
              />
            ))}
          </motion.div>

          <Play className='h-3.5 w-3.5' />
          <span className='text-xs font-medium'>Deploy to HubSpot</span>
        </div>
      </motion.div>
    </div>
  );
}
