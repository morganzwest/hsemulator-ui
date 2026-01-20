'use client';

import { GalleryVerticalEnd, ShieldCheck } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className='grid min-h-svh max-w-[95rem] mx-auto grid-cols-1 md:grid-cols-2'>
      {/* Value / context */}
      <div className='hidden md:flex flex-col justify-center px-12'>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className='mb-6 flex items-center gap-2 text-sm text-muted-foreground'>
            <div className='bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md'>
              <GalleryVerticalEnd className='size-4' />
            </div>
            HS Emulator
          </div>

          <h1 className='text-3xl font-semibold tracking-tight'>
            Execute and validate HubSpot actions with confidence.
          </h1>

          <p className='mt-4 max-w-md text-muted-foreground'>
            A hosted execution environment for HubSpot custom code actions,
            built for correctness, observability, and repeatability — not
            guesswork.
          </p>

          {/* Feature list */}
          <ul className='mt-8 space-y-4 text-sm'>
            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Deterministic runtime execution
                </strong>{' '}
                ensuring identical behaviour across runs, environments, and
                inputs.
              </span>
            </li>

            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Assertion-driven validation
                </strong>{' '}
                to explicitly define and enforce expected outcomes.
              </span>
            </li>

            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Structured, timestamped logs
                </strong>{' '}
                with execution context, events, and failure traces.
              </span>
            </li>

            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Execution timing and resource metrics
                </strong>{' '}
                to surface performance regressions early.
              </span>
            </li>

            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Snapshot-based regression detection
                </strong>{' '}
                to catch unintended output changes before deployment.
              </span>
            </li>

            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Flaky test identification
                </strong>{' '}
                through repeat execution and variance analysis.
              </span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Auth */}
      <div className='flex flex-col items-center justify-center gap-6 p-6'>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className='w-full max-w-sm'
        >
          <LoginForm mode='signup' />
        </motion.div>

        {/* Trust strip */}
        <div className='flex items-center gap-3 text-xs text-muted-foreground'>
          <ShieldCheck className='h-4 w-4' />
          <span>No passwords stored</span>
          <span>•</span>
          <span>Scoped access only</span>
        </div>
      </div>
    </div>
  );
}
