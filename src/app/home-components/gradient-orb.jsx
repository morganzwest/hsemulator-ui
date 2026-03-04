'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

export function GradientOrb({ 
  className, 
  color = 'primary', 
  size = 400, 
  position = { top: '10%', right: '10%' },
  delay = 0 
}) {
  const colorClasses = {
    primary: 'bg-primary',
    accent: 'bg-accent',
    muted: 'bg-muted-foreground',
  };

  return (
    <motion.div
      className={`fixed rounded-full pointer-events-none z-0 blur-[100px] opacity-[0.08] ${colorClasses[color]} ${className || ''}`}
      style={{
        width: size,
        height: size,
        ...position,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 0.08, 
        scale: 1,
        y: [0, -20, 0],
        x: [0, 10, 0],
      }}
      transition={{
        opacity: { duration: 1, delay },
        scale: { duration: 1, delay },
        y: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 10, repeat: Infinity, ease: "easeInOut" },
      }}
      aria-hidden="true"
    />
  );
}

export function GradientOrbGroup() {
  return (
    <>
      <GradientOrb 
        color="primary" 
        size={500} 
        position={{ top: '-5%', right: '-5%' }} 
        delay={0}
      />
      <GradientOrb 
        color="accent" 
        size={400} 
        position={{ bottom: '20%', left: '-10%' }} 
        delay={0.3}
      />
      <GradientOrb 
        color="primary" 
        size={300} 
        position={{ top: '40%', left: '30%' }} 
        delay={0.6}
      />
    </>
  );
}
