'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function StepCard({ 
  number,
  icon: Icon, 
  title, 
  description, 
  className,
  delay = 0,
  isLast = false
}) {
  return (
    <motion.div
      className={cn(
        "relative flex flex-col items-center text-center",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      {/* Connector line */}
      {!isLast && (
        <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-[2px] bg-gradient-to-r from-border via-primary/30 to-border" />
      )}
      
      {/* Number badge */}
      <div className="relative mb-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">{number}</span>
        </div>
        {Icon && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-background border border-border flex items-center justify-center">
            <Icon className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
        {description}
      </p>
    </motion.div>
  );
}
