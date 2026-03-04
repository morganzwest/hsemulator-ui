'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  className,
  iconClassName,
  delay = 0 
}) {
  return (
    <motion.div
      className={cn(
        "group relative rounded-xl border bg-card/50 p-6 transition-all duration-300",
        "hover:border-primary/30 hover:bg-card/80 hover:shadow-lg hover:-translate-y-1",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className={cn(
        "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4",
        "bg-primary/10 text-primary",
        iconClassName
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}
