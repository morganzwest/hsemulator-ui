'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  GitBranch,
  Library,
  Layers,
  Shield,
  Lock,
  UserPlus,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { SectionWrapper } from '../home-components/section-wrapper';
import { GridLines } from '../home-components/section-patterns';

const teamFeatures = [
  {
    icon: Users,
    title: 'Unlimited Team Members',
    description:
      'Invite your entire team. Role-based access keeps everyone in their lane.',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: GitBranch,
    title: 'Shared Workspaces',
    description:
      'Centralized code repositories. No more "where did I put that action?"',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    icon: Library,
    title: 'Reusable Libraries',
    description:
      'Build once, use everywhere. Share proven patterns across projects.',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    icon: Layers,
    title: 'Environment Management',
    description:
      'Dev → Staging → Prod. Deploy with confidence across environments.',
    color: 'bg-orange-500/10 text-orange-500',
  },
];

export function TeamsSection() {
  return (
    <SectionWrapper id='teams' className='relative overflow-hidden'>
      {/* Background pattern */}
      <GridLines className='opacity-30' />

      {/* Ambient glow */}
      <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none' />

      <div className='relative z-10'>
        {/* Header */}
        <div className='text-center mb-16'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6'
          >
            <UserPlus className='h-4 w-4 text-primary' />
            <span className='text-sm font-medium text-primary'>
              Team Edition
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='text-4xl sm:text-5xl font-bold tracking-tight'
          >
            Built for teams that
            <span className='block text-primary'>ship together</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className='mt-6 text-lg text-muted-foreground max-w-2xl mx-auto'
          >
            Stop being held hostage by one developer. Scale your HubSpot
            automation with a team that actually collaborates.
          </motion.p>
        </div>

        {/* Team visualization */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className='mb-12'
        >
          <div className='flex flex-wrap items-center justify-center gap-4 md:gap-8'>
            {/* Team avatars representation */}
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  i === 2
                    ? 'bg-primary text-primary-foreground w-16 h-16'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <Users className={i === 2 ? 'h-7 w-7' : 'h-5 w-5'} />
              </motion.div>
            ))}
          </div>
          <div className='text-center mt-4 text-sm text-muted-foreground'>
            Your whole team, working in sync
          </div>
        </motion.div>

        {/* Features Bento Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12'>
          {teamFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className='group relative overflow-hidden rounded-2xl border bg-card p-6 hover:shadow-lg transition-all duration-300'
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
              >
                <feature.icon className='h-6 w-6' />
              </div>
              <h3 className='font-semibold mb-2'>{feature.title}</h3>
              <p className='text-sm text-muted-foreground'>
                {feature.description}
              </p>

              {/* Hover effect */}
              <div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
            </motion.div>
          ))}
        </div>

        {/* Collaboration features highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'
        >
          <div className='flex items-center gap-3 p-4 rounded-xl bg-muted/50'>
            <div className='w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center'>
              <MessageSquare className='h-5 w-5 text-green-500' />
            </div>
            <div>
              <div className='font-medium text-sm'>Real-time Comments</div>
              <div className='text-xs text-muted-foreground'>
                Discuss code inline
              </div>
            </div>
          </div>
          <div className='flex items-center gap-3 p-4 rounded-xl bg-muted/50'>
            <div className='w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center'>
              <Zap className='h-5 w-5 text-blue-500' />
            </div>
            <div>
              <div className='font-medium text-sm'>Instant Sync</div>
              <div className='text-xs text-muted-foreground'>
                Changes propagate immediately
              </div>
            </div>
          </div>
          <div className='flex items-center gap-3 p-4 rounded-xl bg-muted/50'>
            <div className='w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center'>
              <Shield className='h-5 w-5 text-purple-500' />
            </div>
            <div>
              <div className='font-medium text-sm'>Audit Trail</div>
              <div className='text-xs text-muted-foreground'>
                Know who changed what
              </div>
            </div>
          </div>
        </motion.div>

        {/* Security badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className='flex items-center justify-center gap-8 text-sm text-muted-foreground'
        >
          <div className='flex items-center gap-2'>
            <Shield className='h-4 w-4' />
            <span>SOC 2 Type II</span>
          </div>
          <div className='flex items-center gap-2'>
            <Lock className='h-4 w-4' />
            <span>End-to-end encryption</span>
          </div>
          <div className='flex items-center gap-2'>
            <Users className='h-4 w-4' />
            <span>SSO & SAML</span>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
