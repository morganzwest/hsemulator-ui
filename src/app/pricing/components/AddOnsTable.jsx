'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Plus, Check, Bot, Zap, User, Globe } from 'lucide-react';
import Link from 'next/link';

const addOns = [
  {
    name: 'Additional 100 AI Credits',
    price: '£50',
    billing: 'One-time purchase',
    icon: Bot,
  },
  {
    name: 'Additional 10k Action Executions',
    price: '£50',
    billing: 'per month',
    icon: Zap,
  },
  {
    name: 'Additional 1 User',
    price: '£20',
    billing: 'per month',
    icon: User,
  },
  {
    name: 'Additional 1 Portal',
    price: '£40',
    billing: 'per month',
    icon: Globe,
  },
];

export function AddOnsTable() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      whileInView='visible'
      viewport={{ once: true, margin: '-100px' }}
      className='space-y-6'
    >
      {/* Grid of add-on cards */}
      <div className='grid md:grid-cols-2 gap-6'>
        {addOns.map((addOn, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{
              y: -4,
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            className='group relative overflow-hidden rounded-2xl border border-border bg-background shadow-lg hover:shadow-xl transition-all duration-300'
          >
            {/* Bold white edge at top */}
            <div className='absolute inset-x-0 top-0 h-1 bg-white/40 shadow-lg' />

            {/* Content */}
            <div className='relative p-8'>
              {/* Header */}
              <div className='flex items-start justify-between mb-6'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-xl bg-white border border-border flex items-center justify-center shadow-lg'>
                    <addOn.icon className='h-6 w-6 text-black' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-lg text-foreground'>
                      {addOn.name}
                    </h3>
                    <Badge variant='secondary' className='mt-1 text-xs'>
                      {addOn.billing}
                    </Badge>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-2xl font-bold text-foreground'>
                    {addOn.price}
                  </div>
                </div>
              </div>

              {/* Description removed - moved to title */}

              {/* Add button */}
              <Button
                variant='outline'
                className='w-full border-2 border-border hover:bg-black hover:text-white hover:border-black transition-all duration-200 font-medium'
                size='sm'
              >
                <Plus className='h-4 w-4 mr-2' />
                Add to plan
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA section */}
      <motion.div
        variants={cardVariants}
        className='rounded-2xl border border-border bg-background p-8 text-center'
      >
        <div className='max-w-2xl mx-auto'>
          <h3 className='text-xl font-semibold text-foreground mb-3'>
            Need a custom solution?
          </h3>
          <p className='text-muted-foreground mb-6'>
            We can tailor add-ons to your specific requirements. Contact our
            sales team to discuss custom packages and enterprise solutions.
          </p>
          <Button
            size='lg'
            variant='outline'
            className='border-2 border-border hover:bg-black hover:text-white hover:border-black transition-all duration-200 font-medium'
            asChild
          >
            <Link href='/contact-sales'>
              Contact Sales
              <ArrowRight className='ml-2 h-4 w-4' />
            </Link>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
