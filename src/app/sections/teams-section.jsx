'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Users, GitBranch, Library, Layers, Shield, Lock } from 'lucide-react';
import { SectionWrapper } from '../home-components/section-wrapper';

const features = [
  {
    icon: Users,
    title: 'Multiple Users',
    description: 'Invite team members with role-based access controls. Everyone works together safely.',
  },
  {
    icon: GitBranch,
    title: 'Shared Code Repositories',
    description: 'Centralize your automation code. Everyone knows where to find and update logic.',
  },
  {
    icon: Library,
    title: 'Shared Action Libraries',
    description: 'Reuse proven automation patterns across your organization.',
  },
  {
    icon: Layers,
    title: 'Multi-Environment Support',
    description: 'Manage automation across development, staging, and production environments.',
  },
];

export function TeamsSection() {
  return (
    <SectionWrapper id="teams">
      <div className="text-center mb-16">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
        >
          Collaboration
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight"
        >
          Built for teams
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Teams can maintain automation code safely without relying on a single developer. 
          Scale your HubSpot operations with confidence.
        </motion.p>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4 p-6 rounded-xl border bg-card/50"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <feature.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Security note */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
      >
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>SOC 2 Type II</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4" />
          <span>End-to-end encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span>SSO & SAML</span>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}
