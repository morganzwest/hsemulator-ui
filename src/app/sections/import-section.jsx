'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Plug, Download, Code, ArrowRight, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SectionWrapper } from '../home-components/section-wrapper';
import { StepCard } from '../home-components/step-card';

const steps = [
  {
    number: 1,
    icon: Plug,
    title: 'Connect HubSpot',
    description: 'One-click OAuth to link your HubSpot account securely.',
  },
  {
    number: 2,
    icon: Download,
    title: 'Import Existing Code',
    description: 'We pull in your current custom code actions automatically.',
  },
  {
    number: 3,
    icon: Code,
    title: 'Start Developing',
    description: 'Edit, test, and deploy with proper tooling from day one.',
  },
];

export function ImportSection() {
  return (
    <SectionWrapper id="import">
      <div className="text-center mb-16">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
        >
          Quick Start
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight"
        >
          Import your existing code
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Get started in under 60 seconds. No rebuild required — 
          your existing workflows keep running.
        </motion.p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {steps.map((step, index) => (
          <StepCard
            key={step.number}
            number={step.number}
            icon={step.icon}
            title={step.title}
            description={step.description}
            delay={index * 0.15}
            isLast={index === steps.length - 1}
          />
        ))}
      </div>

      {/* Key points */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>No rebuild required</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Workflows keep running</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          <span>Setup in under 60 seconds</span>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="text-center mt-12"
      >
        <Button size="lg" asChild>
          <Link href="/get-started">
            Start Importing
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </SectionWrapper>
  );
}
