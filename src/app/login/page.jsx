'use client';

import { GalleryVerticalEnd, ShieldCheck } from 'lucide-react';
import { LoginForm } from '@/components/login-form';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '~/lib/supabase/browser';

export default function LoginPage() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const handleHashAuth = async () => {
      const hash = window.location.hash;

      if (!hash || !hash.includes('access_token')) return;

      const params = new URLSearchParams(hash.substring(1));

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token || !refresh_token) return;

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (!error) {
        window.location.replace('/dashboard');
      }
    };

    handleHashAuth();
  }, []);

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
            Welcome back.
          </h1>

          <p className='mt-4 max-w-md text-muted-foreground'>
            Sign in to continue validating and executing HubSpot custom code
            actions in a deterministic, observable runtime.
          </p>

          {/* Feature list */}
          <ul className='mt-8 space-y-4 text-sm'>
            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Deterministic execution
                </strong>{' '}
                with identical behaviour across environments.
              </span>
            </li>

            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Assertion-driven validation
                </strong>{' '}
                to enforce expected outcomes.
              </span>
            </li>

            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Structured execution logs
                </strong>{' '}
                with timestamps and context.
              </span>
            </li>

            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>Performance metrics</strong>{' '}
                for timing and resource usage.
              </span>
            </li>

            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Snapshot regression detection
                </strong>{' '}
                to catch unintended changes.
              </span>
            </li>

            <li className='flex gap-3'>
              <span className='mt-1 size-1.5 rounded-full bg-primary' />
              <span className='text-muted-foreground'>
                <strong className='text-foreground'>
                  Flaky test visibility
                </strong>{' '}
                through repeat execution analysis.
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
          <LoginForm mode='login' />
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
