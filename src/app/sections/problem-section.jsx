'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { GitCommit, EyeOff, Copy, UserX, X, AlertTriangle } from 'lucide-react';
import { SectionWrapper } from '../home-components/section-wrapper';
import { DotPattern } from '../home-components/section-patterns';

const problems = [
  {
    icon: GitCommit,
    title: 'No Version History',
    description: 'Changes lost forever. No way to track who did what.',
  },
  {
    icon: EyeOff,
    title: 'Blind Production',
    description:
      'Code fails silently. You only notice when customers complain.',
  },
  {
    icon: Copy,
    title: 'Copy-Paste Hell',
    description: 'Same code, 3 portals, endless manual syncing.',
  },
  {
    icon: UserX,
    title: 'Bus Factor of 1',
    description:
      'One developer holds all knowledge. If they leave, you are stuck.',
  },
];

export function ProblemSection() {
  return (
    <SectionWrapper id='problem' className='relative overflow-hidden'>
      {/* Background pattern */}
      <DotPattern className='opacity-50' />

      {/* Red glow effect */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[150px] pointer-events-none' />

      <div className='relative z-10'>
        {/* Dramatic header */}
        <div className='text-center mb-16'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-6'
          >
            <AlertTriangle className='h-4 w-4 text-red-500' />
            <span className='text-sm font-medium text-red-400'>
              The Challenge
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight'
          >
            Custom code deserves
            <span className='block text-red-400'>better tooling</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className='mt-6 text-lg text-muted-foreground max-w-2xl mx-auto'
          >
            Teams waste hours every week fighting the same problems. It does not
            have to be this way.
          </motion.p>
        </div>

        {/* Pain grid - more visual */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto'>
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className='group relative'
            >
              <div className='flex items-start gap-4 p-6 rounded-xl border border-red-500/10 bg-card/50 hover:border-red-500/30 transition-all duration-300'>
                {/* Icon with X */}
                <div className='relative'>
                  <div className='w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center'>
                    <problem.icon className='h-6 w-6 text-red-400' />
                  </div>
                  <div className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center'>
                    <X className='h-3 w-3 text-white' />
                  </div>
                </div>

                <div className='flex-1'>
                  <h3 className='font-semibold text-lg mb-1 text-foreground'>
                    {problem.title}
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    {problem.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats row for impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className='mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16'
        >
          <div className='text-center'>
            <div className='text-3xl md:text-4xl font-bold text-red-400'>
              4+ hrs
            </div>
            <div className='text-sm text-muted-foreground mt-1'>
              Lost per week
            </div>
          </div>
          <div className='h-12 w-px bg-border hidden md:block' />
          <div className='text-center'>
            <div className='text-3xl md:text-4xl font-bold text-red-400'>
              60%
            </div>
            <div className='text-sm text-muted-foreground mt-1'>
              Of teams affected
            </div>
          </div>
          <div className='h-12 w-px bg-border hidden md:block' />
          <div className='text-center'>
            <div className='text-3xl md:text-4xl font-bold text-red-400'>
              $0
            </div>
            <div className='text-sm text-muted-foreground mt-1'>
              Spent on solutions
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
