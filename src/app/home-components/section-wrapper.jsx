'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

export function SectionWrapper({ 
  children, 
  className,
  id,
  delay = 0 
}) {
  return (
    <motion.section
      id={id}
      className={`py-24 lg:py-32 ${className || ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {children}
      </div>
    </motion.section>
  );
}
