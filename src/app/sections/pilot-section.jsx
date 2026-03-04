'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Rocket,
  Users,
  Zap,
  ArrowRight,
  Star,
  Gift,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { SectionWrapper } from '../home-components/section-wrapper';
import { WavePattern } from '../home-components/section-patterns';

const pilotBenefits = [
  {
    icon: Zap,
    title: 'White-Glove Setup',
    description:
      'We help migrate your existing code. Personal onboarding session with our team.',
    highlight: true,
  },
  {
    icon: Gift,
    title: '100% Free',
    description:
      'No charges during the entire pilot period. Full platform access included.',
    highlight: true,
  },
  {
    icon: Rocket,
    title: 'Unlimited Actions',
    description:
      'Run as many actions as you need. No usage limits during the pilot.',
  },
];

export function PilotSection() {
  return (
    <SectionWrapper id='pilot' className='relative overflow-hidden'>
      {/* Wave pattern background */}
      <WavePattern className='opacity-50' />

      {/* Glow effects */}
      <div className='absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none' />
      <div className='absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none' />

      <div className='relative z-10 max-w-5xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-16'>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-6'
          >
            <Star className='h-4 w-4 text-yellow-500 fill-yellow-500' />
            <span className='text-sm font-medium text-yellow-500'>
              Limited Availability
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6'
          >
            Join the Pilot
            <span className='block text-yellow-500'>Early Access</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className='text-lg text-muted-foreground max-w-2xl mx-auto'
          >
            We are accepting a small group of forward-thinking teams to help
            shape the future of HubSpot development. Special perks for early
            adopters.
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
          {pilotBenefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                benefit.highlight
                  ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40'
                  : 'bg-card/50 border-border hover:border-primary/30'
              }`}
            >
              {benefit.highlight && (
                <div className='absolute -top-3 left-4 px-2 py-0.5 bg-yellow-500 text-yellow-950 text-[10px] font-bold uppercase tracking-wider rounded'>
                  Included
                </div>
              )}

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  benefit.highlight ? 'bg-yellow-500/10' : 'bg-primary/10'
                }`}
              >
                <benefit.icon
                  className={`h-6 w-6 ${
                    benefit.highlight ? 'text-yellow-500' : 'text-primary'
                  }`}
                />
              </div>

              <h3 className='font-semibold mb-2'>{benefit.title}</h3>
              <p className='text-sm text-muted-foreground'>
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Spots counter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className='flex items-center justify-center gap-8 mb-12'
        >
          <div className='flex items-center gap-3 px-6 py-3 rounded-full bg-muted'>
            <div className='flex -space-x-2'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='w-8 h-8 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center'
                >
                  <Users className='h-4 w-4 text-primary' />
                </div>
              ))}
            </div>
            <span className='text-sm font-medium'>47 teams already joined</span>
          </div>

          <div className='text-sm text-muted-foreground'>
            <span className='text-yellow-500 font-semibold'>13 spots</span>{' '}
            remaining this month
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className='text-center'
        >
          <Button
            size='lg'
            className='h-14 px-10 text-base bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-semibold'
            asChild
          >
            <Link href='/get-started'>
              Join the Pilot
              <ArrowRight className='ml-2 h-5 w-5' />
            </Link>
          </Button>

          <div className='mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span>No credit card required</span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span>Cancel anytime</span>
            </div>
            <div className='flex items-center gap-2'>
              <CheckCircle2 className='h-4 w-4 text-green-500' />
              <span>Free forever during pilot</span>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
