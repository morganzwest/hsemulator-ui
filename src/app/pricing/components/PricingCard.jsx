'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { PurchaseButton } from './PurchaseButton';

export function PricingCard({ plan, index }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
      },
    },
  };

  const hoverVariants = {
    hover: {
      y: -8,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  };

  const priceDisplay = {
    main: plan.price,
    period: '/month',
    billing: '',
  };

  return (
    <motion.div
      variants={cardVariants}
      initial='hidden'
      animate='visible'
      whileHover='hover'
      className={`relative rounded-2xl border bg-card p-8 transition-all duration-300 ${
        plan.popular
          ? 'border-primary shadow-lg shadow-primary/10'
          : 'border-border shadow-sm hover:shadow-md'
      }`}
    >
      {plan.popular && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 + index * 0.1 }}
          className='absolute -top-3 left-1/2 transform -translate-x-1/2'
        >
          <Badge variant='default' className='text-xs font-semibold px-3 py-1'>
            Most Popular
          </Badge>
        </motion.div>
      )}

      <div className='text-center mb-8'>
        <h3 className='text-2xl font-bold mb-2'>{plan.name}</h3>
        <p className='text-muted-foreground mb-6'>{plan.description}</p>

        <div className='mb-4'>
          <div className='flex items-baseline justify-center gap-1'>
            <span className='text-5xl font-bold'>${priceDisplay.main}</span>
            <span className='text-lg text-muted-foreground'>
              {priceDisplay.period}
            </span>
          </div>
          {priceDisplay.billing && (
            <p className='text-sm text-muted-foreground mt-1'>
              {priceDisplay.billing}
            </p>
          )}
        </div>
      </div>

      <div className='space-y-4 mb-8'>
        {plan.features.map((feature, featureIndex) => (
          <motion.div
            key={featureIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + featureIndex * 0.05 + index * 0.1 }}
            className='flex items-start gap-3'
          >
            <Check className='h-5 w-5 text-green-500 mt-0.5 shrink-0' />
            <span className='text-sm'>{feature}</span>
          </motion.div>
        ))}

        {plan.notIncluded.map((feature, featureIndex) => (
          <motion.div
            key={featureIndex}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay:
                0.3 +
                (plan.features.length + featureIndex) * 0.05 +
                index * 0.1,
            }}
            className='flex items-start gap-3 opacity-50'
          >
            <div className='h-5 w-5 mt-0.5 shrink-0 rounded-full border-2 border-muted-foreground/30' />
            <span className='text-sm text-muted-foreground'>{feature}</span>
          </motion.div>
        ))}
      </div>

      <PurchaseButton planId={plan.id} size='lg' />
    </motion.div>
  );
}
