'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowRight, Calendar } from 'lucide-react';
import { UIMockup } from '../home-components/ui-mockup';

export function HeroSection() {
  return (
    <section className='relative pt-16 lg:pt-32 pb-24 overflow-hidden'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant='secondary' className='mb-6 px-4 py-1.5 text-sm'>
              Pilot Programme
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-6'
          >
            Build, Test and Deploy HubSpot
            <span className='block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
              Custom Code — Properly.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10'
          >
            The development platform for HubSpot automation. Version control,
            CI/CD, and real-time monitoring for your custom code actions.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='flex flex-col sm:flex-row items-center justify-center gap-4'
          >
            <Button size='lg' className='h-12 px-8 text-base' asChild>
              <Link href='/get-started'>
                Join the Pilot
                <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='h-12 px-8 text-base'
              asChild
            >
              <Link href='/demo'>
                <Calendar className='mr-2 h-4 w-4' />
                Request a Demo
              </Link>
            </Button>
          </motion.div>

          {/* Supporting line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className='mt-6 text-sm text-muted-foreground'
          >
            Free during pilot period • No credit card required
          </motion.p>
        </div>

        {/* UI Mockup */}
        <UIMockup />
      </div>
    </section>
  );
}
