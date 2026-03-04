'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { GitCommit, EyeOff, Copy, UserX } from 'lucide-react';
import { SectionWrapper } from '../home-components/section-wrapper';
import { FeatureCard } from '../home-components/feature-card';
import { ProblemFlow } from '../home-components/flow-diagram';

const problems = [
  {
    icon: GitCommit,
    title: 'No Version History',
    description: 'Changes to automation code are not tracked. You cannot see who changed what, or roll back to a working version.',
  },
  {
    icon: EyeOff,
    title: 'No Production Visibility',
    description: 'Once code goes live, failures are difficult to detect. You only find out when something critical breaks.',
  },
  {
    icon: Copy,
    title: 'Manual Updates',
    description: 'Developers copy and paste code between environments. It is tedious, error-prone, and impossible to track.',
  },
  {
    icon: UserX,
    title: 'Difficult Maintenance',
    description: 'Businesses become dependent on the developer who originally built the logic. Knowledge walks out the door.',
  },
];

export function ProblemSection() {
  return (
    <SectionWrapper id="problem">
      <div className="text-center mb-16">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
        >
          The Problem
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight"
        >
          HubSpot development is broken
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Teams struggle with custom code actions because the platform 
          lacks basic software engineering practices.
        </motion.p>
      </div>

      {/* Problem Flow Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <ProblemFlow />
      </motion.div>

      {/* Problem Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {problems.map((problem, index) => (
          <FeatureCard
            key={problem.title}
            icon={problem.icon}
            title={problem.title}
            description={problem.description}
            delay={index * 0.1}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
