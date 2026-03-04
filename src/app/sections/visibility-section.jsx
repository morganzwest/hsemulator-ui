'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { 
  ScrollText, 
  AlertCircle, 
  Activity, 
  History, 
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Terminal
} from 'lucide-react';
import { SectionWrapper } from '../home-components/section-wrapper';

const features = [
  {
    icon: ScrollText,
    title: 'Execution Logs',
    description: 'Comprehensive logging for every code execution with timestamps and context.',
  },
  {
    icon: AlertCircle,
    title: 'Failure Diagnostics',
    description: 'Detailed error messages and stack traces when things go wrong.',
  },
  {
    icon: Activity,
    title: 'Performance Metrics',
    description: 'Track execution duration, memory usage, and throughput.',
  },
  {
    icon: History,
    title: 'Historical Records',
    description: 'Search and filter past executions by date, status, or action.',
  },
  {
    icon: Eye,
    title: 'Real-time Monitoring',
    description: 'Watch executions live as they happen in your workflows.',
  },
];

export function VisibilitySection() {
  return (
    <SectionWrapper id="visibility" className="bg-muted/30">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: Log Preview */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="order-2 lg:order-1"
        >
          <div className="rounded-xl border bg-card/90 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Execution Logs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">Live</span>
              </div>
            </div>

            {/* Log entries */}
            <div className="p-4 font-mono text-xs space-y-3">
              {/* Success entry */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 font-medium">Success</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">validate-contact.js</span>
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    Processed contact_8f3a2b for user@example.com
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      42ms
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      12MB
                    </span>
                  </div>
                </div>
              </div>

              {/* Error entry */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 font-medium">Failed</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">enrich-company.js</span>
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    API timeout after 5000ms
                  </div>
                  <div className="mt-2 p-2 rounded bg-red-500/5 text-red-400 text-[10px] overflow-x-auto">
                    Error: Request failed with status code 504<br/>
                    at enrichCompany (enrich-company.js:15)
                  </div>
                </div>
              </div>

              {/* Pending entry */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                <div className="h-4 w-4 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 font-medium">Running</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">send-webhook.js</span>
                  </div>
                  <div className="mt-1 text-muted-foreground">
                    Sending payload to external API...
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right: Content */}
        <div className="order-1 lg:order-2">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm font-medium text-muted-foreground uppercase tracking-wider"
          >
            Monitoring & Reliability
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight"
          >
            Know when it succeeds.
            <span className="block text-primary">Know immediately when it fails.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-lg text-muted-foreground"
          >
            Reduce operational risk with complete visibility into your automation. 
            Catch issues before they impact your business.
          </motion.p>

          {/* Feature list */}
          <div className="mt-8 space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
