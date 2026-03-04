'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { User, ArrowRight, Cloud, FileCode, Check, Play, GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
};

const lineVariants = {
  hidden: { pathLength: 0 },
  visible: { pathLength: 1 }
};

export function SolutionFlow() {
  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <motion.div
        className="flex flex-col md:flex-row items-center gap-6 md:gap-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.2 }}
      >
        {/* Developer Node */}
        <motion.div
          variants={nodeVariants}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <span className="text-sm font-medium">Developer</span>
        </motion.div>

        {/* Arrow */}
        <motion.div
          variants={nodeVariants}
          className="flex flex-col items-center"
        >
          <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:hidden" />
        </motion.div>

        {/* Novocode Node */}
        <motion.div
          variants={nodeVariants}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-24 h-24 rounded-2xl bg-primary border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
            <FileCode className="h-10 w-10 text-primary-foreground" />
          </div>
          <span className="text-sm font-semibold text-primary">Novocode</span>
        </motion.div>

        {/* Arrow */}
        <motion.div
          variants={nodeVariants}
          className="flex flex-col items-center"
        >
          <ArrowRight className="h-6 w-6 text-muted-foreground hidden md:block" />
          <ArrowRight className="h-6 w-6 text-muted-foreground rotate-90 md:hidden" />
        </motion.div>

        {/* HubSpot Node */}
        <motion.div
          variants={nodeVariants}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Cloud className="h-8 w-8 text-orange-500" />
          </div>
          <span className="text-sm font-medium">HubSpot</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function DeployFlow({ className }) {
  const steps = [
    { icon: FileCode, label: 'Edit Code', color: 'bg-blue-500/10 text-blue-500' },
    { icon: Play, label: 'Test', color: 'bg-yellow-500/10 text-yellow-500' },
    { icon: Check, label: 'Deploy', color: 'bg-green-500/10 text-green-500' },
  ];

  return (
    <div className={cn("flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8", className)}>
      {steps.map((step, index) => (
        <React.Fragment key={step.label}>
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15 }}
          >
            <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center", step.color)}>
              <step.icon className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">{step.label}</span>
          </motion.div>
          
          {index < steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 + 0.1 }}
            >
              <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
              <ArrowRight className="h-5 w-5 text-muted-foreground rotate-90 md:hidden" />
            </motion.div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function ProblemFlow({ className }) {
  return (
    <motion.div
      className={cn("relative p-8 rounded-xl border bg-muted/30", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <GitBranch className="h-5 w-5" />
          <span className="text-sm">Current Workflow</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3">
          {['Dev Portal', 'Copy', 'Staging', 'Copy', 'Production'].map((item, index) => (
            <React.Fragment key={item}>
              <div className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                index % 2 === 0 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "text-muted-foreground"
              )}>
                {item}
              </div>
              {index < 4 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              )}
            </React.Fragment>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Manual, error-prone, no version history
        </div>
      </div>
    </motion.div>
  );
}
