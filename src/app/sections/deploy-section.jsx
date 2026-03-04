'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { GitBranch, ArrowRight, Check, FileCode, Play } from 'lucide-react';
import { SectionWrapper } from '../home-components/section-wrapper';
import { DeployFlow } from '../home-components/flow-diagram';
import { Badge } from '../../components/ui/badge';

const capabilities = [
  {
    title: 'Push Directly to HubSpot',
    description:
      'Deploy updates with a single click or automatically via CI/CD.',
  },
  {
    title: 'Keep Actions Synchronized',
    description: 'Your code in Novocode stays in sync with HubSpot workflows.',
  },
  {
    title: 'Version Every Change',
    description: 'Complete history of who changed what and when.',
  },
  {
    title: 'Zero-Downtime Deployments',
    description: 'Update code without interrupting running workflows.',
  },
];

export function DeploySection() {
  return (
    <SectionWrapper id='deploy'>
      <div className='text-center mb-12'>
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className='text-sm font-medium text-muted-foreground uppercase tracking-wider'
        >
          CI/CD & Deployment
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className='mt-4 text-3xl sm:text-4xl font-bold tracking-tight'
        >
          Deploy and stay in sync
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className='mt-4 text-lg text-muted-foreground max-w-2xl mx-auto'
        >
          Eliminate copy-paste deployments. Novocode becomes the single source
          of truth for your automation code.
        </motion.p>
      </div>

      {/* Deploy Flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className='mb-12'
      >
        <DeployFlow />
      </motion.div>

      {/* Source of truth badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className='text-center mb-12'
      >
        <Badge variant='outline' className='px-4 py-2 text-sm'>
          <GitBranch className='mr-2 h-4 w-4' />
          Novocode is the source of truth for your automation code
        </Badge>
      </motion.div>

      {/* Capabilities grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
        {capabilities.map((cap, index) => (
          <motion.div
            key={cap.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className='flex items-start gap-3 p-4 rounded-lg border bg-card/50'
          >
            <div className='w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5'>
              <Check className='h-3.5 w-3.5 text-green-500' />
            </div>
            <div>
              <h4 className='font-medium text-sm'>{cap.title}</h4>
              <p className='text-xs text-muted-foreground mt-0.5'>
                {cap.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
