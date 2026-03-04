'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowRight, Calendar } from 'lucide-react';
import { UIMockup } from '../home-components/ui-mockup';
import { Boxes } from '../home-components/background-boxes';

export function HeroSection() {
  return (
    <section className='relative -mt-28 pt-50 pb-24 overflow-hidden'>
      <style>{`
        @keyframes aurora {
          0% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0.3;
          }
          33% { 
            transform: translate(30px, -30px) rotate(120deg) scale(1.1);
            opacity: 0.4;
          }
          66% { 
            transform: translate(-20px, 20px) rotate(240deg) scale(0.9);
            opacity: 0.35;
          }
          100% { 
            transform: translate(0, 0) rotate(360deg) scale(1);
            opacity: 0.3;
          }
        }
      `}</style>

      {/* Background boxes only for hero section */}
      <div className='absolute inset-0 z-0'>
        <Boxes className='pointer-events-auto opacity-20' />
      </div>

      {/* Aurora background on top */}
      <div className='absolute inset-0 z-[5] pointer-events-none'>
        <div
          className='absolute inset-0 overflow-hidden opacity-40'
          style={{
            '--aurora':
              'repeating-linear-gradient(100deg,#10b981_10%,#34d399_15%,#6ee7b7_20%,#2dd4bf_25%,#14b8a6_30%)',
            '--dark-gradient':
              'repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)',
            '--white-gradient':
              'repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)',
            '--color-1': '#10b981',
            '--color-2': '#34d399',
            '--color-3': '#6ee7b7',
            '--color-4': '#2dd4bf',
            '--color-5': '#14b8a6',
            '--black': '#000',
            '--white': '#fff',
            '--transparent': 'transparent',
            '--animation-speed': '15s',
          }}
        >
          <div className='pointer-events-none absolute -inset-[10px] [background-image:var(--white-gradient),var(--aurora)] [background-size:300%,_200%] [background-position:50%_50%,50%_50%] opacity-50 blur-[10px] invert filter will-change-transform [--aurora:repeating-linear-gradient(100deg,var(--color-1)_10%,var(--color-2)_15%,var(--color-3)_20%,var(--color-4)_25%,var(--color-5)_30%)] [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)] [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""] dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)] [mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]' />
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-6 relative z-10 pointer-events-none'>
        <div className='max-w-4xl mx-auto text-center'>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              type: 'spring',
              stiffness: 100,
              damping: 15,
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <Badge
              variant='secondary'
              className='mb-6 px-4 py-1.5 text-sm shadow-lg backdrop-blur-sm bg-background/80 border-primary/20'
            >
              Pilot Programme
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.1,
              type: 'spring',
              stiffness: 80,
              damping: 12,
            }}
            className='text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.15] mb-6'
          >
            <motion.span
              className='block'
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              Build, Test and Deploy HubSpot
            </motion.span>
            <motion.span
              className='block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent'
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                backgroundSize: '200% 200%',
              }}
            >
              Custom Code — Properly.
            </motion.span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              type: 'spring',
              stiffness: 60,
              damping: 15,
            }}
            className='text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed'
          >
            The development platform for HubSpot automation. Version control,
            CI/CD, and real-time monitoring for your custom code actions.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              type: 'spring',
              stiffness: 70,
              damping: 14,
            }}
            className='flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto'
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size='lg'
                className='h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90'
                asChild
              >
                <Link href='/get-started'>
                  Join the Pilot
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                size='lg'
                variant='outline'
                className='h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary/40 hover:bg-primary/5'
                asChild
              >
                <Link href='/demo'>
                  <Calendar className='mr-2 h-4 w-4' />
                  Request a Demo
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Supporting line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              type: 'spring',
              stiffness: 50,
              damping: 20,
            }}
            className='mt-6 text-sm text-muted-foreground'
          >
            Free during pilot period • No credit card required
          </motion.p>
        </div>

        {/* UI Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.6,
            type: 'spring',
            stiffness: 40,
            damping: 20,
          }}
        >
          <UIMockup />
        </motion.div>
      </div>
    </section>
  );
}
