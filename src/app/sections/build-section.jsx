'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Code2,
  FileCode,
  Layers,
  Play,
  TestTube,
  Braces,
  Hash,
  Terminal,
} from 'lucide-react';
import { SectionWrapper } from '../home-components/section-wrapper';

const features = [
  {
    icon: Code2,
    title: 'Full-Featured Editor',
    description:
      'Syntax highlighting, error detection, and IntelliSense for JavaScript and Python.',
  },
  {
    icon: Hash,
    title: 'Multi-Language Support',
    description:
      'Native support for JavaScript and Python custom code actions.',
  },
  {
    icon: Layers,
    title: 'Action Templates',
    description:
      'Start from pre-built templates for common HubSpot operations.',
  },
  {
    icon: Play,
    title: 'Local Execution',
    description: 'Test your code instantly without deploying to HubSpot.',
  },
  {
    icon: TestTube,
    title: 'Event Simulation',
    description:
      'Simulate test payloads to verify your logic with realistic data.',
  },
  {
    icon: Terminal,
    title: 'Debug Console',
    description:
      'Built-in console output and error tracing during development.',
  },
];

export function BuildSection() {
  return (
    <SectionWrapper id='build' className='bg-muted/30'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        {/* Left: Content */}
        <div>
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className='text-sm font-medium text-muted-foreground uppercase tracking-wider'
          >
            Development Environment
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className='mt-4 text-3xl sm:text-4xl font-bold tracking-tight'
          >
            Stop writing automation code inside workflow editors
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className='mt-4 text-lg text-muted-foreground'
          >
            Work in a familiar environment with proper tooling. Novocode brings
            the power of modern IDEs to HubSpot development.
          </motion.p>

          {/* Feature list */}
          <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4'>
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className='flex items-start gap-3'
              >
                <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5'>
                  <feature.icon className='h-4 w-4 text-primary' />
                </div>
                <div>
                  <h4 className='font-medium text-sm'>{feature.title}</h4>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: Code Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className='relative'
        >
          <div className='rounded-xl border bg-card/90 shadow-2xl overflow-hidden'>
            {/* Window header */}
            <div className='flex items-center justify-between px-4 py-3 border-b bg-muted/50'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-red-500' />
                <div className='w-3 h-3 rounded-full bg-yellow-500' />
                <div className='w-3 h-3 rounded-full bg-green-500' />
              </div>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <FileCode className='h-3.5 w-3.5' />
                <span>validate-contact.js</span>
              </div>
              <div className='w-16' />
            </div>

            {/* Code content */}
            <div className='p-5 font-mono text-sm'>
              <div className='space-y-1.5'>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    1
                  </span>
                  <span>
                    <span className='text-purple-400'>exports</span>.
                    <span className='text-blue-400'>main</span> ={' '}
                    <span className='text-purple-400'>async</span> (
                    <span className='text-orange-400'>event</span>) ={'>'} {'{'}
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    2
                  </span>
                  <span className='pl-4'>
                    <span className='text-gray-500'>
                      {'// Validate and enrich contact data'}
                    </span>
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    3
                  </span>
                  <span className='pl-4'>
                    <span className='text-purple-400'>const</span> {'{'} email,
                    company {'}'} = event.
                    <span className='text-blue-400'>inputFields</span>;
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    4
                  </span>
                  <span className='pl-4' />
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    5
                  </span>
                  <span className='pl-4'>
                    <span className='text-purple-400'>if</span> (!email ||
                    !email.<span className='text-blue-400'>includes</span>(
                    <span className='text-green-400'>&quot;@&quot;</span>)){' '}
                    {'{'}
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    6
                  </span>
                  <span className='pl-8'>
                    <span className='text-purple-400'>throw</span>{' '}
                    <span className='text-purple-400'>new</span>{' '}
                    <span className='text-yellow-400'>Error</span>(
                    <span className='text-green-400'>
                      &quot;Invalid email format&quot;
                    </span>
                    );
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    7
                  </span>
                  <span className='pl-4'>{'}'}</span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    8
                  </span>
                  <span className='pl-4' />
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    9
                  </span>
                  <span className='pl-4'>
                    <span className='text-purple-400'>return</span> {'{'}
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    10
                  </span>
                  <span className='pl-8'>
                    email: email.
                    <span className='text-blue-400'>toLowerCase</span>(),
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    11
                  </span>
                  <span className='pl-8'>
                    domain: email.<span className='text-blue-400'>split</span>(
                    <span className='text-green-400'>&quot;@&quot;</span>)[
                    <span className='text-yellow-400'>1</span>],
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    12
                  </span>
                  <span className='pl-8'>
                    validatedAt: <span className='text-purple-400'>new</span>{' '}
                    <span className='text-yellow-400'>Date</span>().
                    <span className='text-blue-400'>toISOString</span>()
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    13
                  </span>
                  <span className='pl-4'>{'}'};</span>
                </div>
                <div className='flex'>
                  <span className='text-muted-foreground w-6 select-none'>
                    14
                  </span>
                  <span>{'}'};</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
