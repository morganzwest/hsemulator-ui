'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Code, GitBranch, Activity, Shield } from 'lucide-react';
import { SectionWrapper } from '../home-components/section-wrapper';
import { SolutionFlow } from '../home-components/flow-diagram';

const capabilities = [
  {
    icon: Code,
    title: 'Development Environment',
    description: 'Proper code editor with syntax highlighting, IntelliSense, and language support.',
  },
  {
    icon: GitBranch,
    title: 'CI/CD Workflow',
    description: 'Automated deployments with version control and change tracking.',
  },
  {
    icon: Activity,
    title: 'Execution Monitoring',
    description: 'Real-time logs, performance metrics, and failure alerts.',
  },
  {
    icon: Shield,
    title: 'Governance',
    description: 'Team access controls, audit logs, and compliance features.',
  },
];

export function SolutionSection() {
  return (
    <SectionWrapper id="solution" className="bg-muted/30">
      <div className="text-center mb-12">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm font-medium text-primary uppercase tracking-wider"
        >
          The Solution
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight"
        >
          Novocode adds software engineering
          <span className="block text-primary">discipline to HubSpot automation</span>
        </motion.h2>
      </div>

      {/* Architecture Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="mb-16"
      >
        <SolutionFlow />
      </motion.div>

      {/* Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {capabilities.map((cap, index) => (
          <motion.div
            key={cap.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="flex flex-col items-center text-center p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <cap.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">{cap.title}</h3>
            <p className="text-sm text-muted-foreground">{cap.description}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
