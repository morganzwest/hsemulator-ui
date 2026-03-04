'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/button';

export function Footer() {
  return (
    <footer className='border-t bg-muted/30'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-8'>
          {/* Brand */}
          <div className='text-center md:text-left'>
            <div className='text-lg font-semibold'>Novocode</div>
            <div className='text-sm text-muted-foreground'>by Novocy</div>
          </div>

          {/* Links */}
          <div className='flex items-center gap-6 text-sm text-muted-foreground'>
            <Link
              href='/privacy'
              className='hover:text-foreground transition-colors'
            >
              Privacy Policy
            </Link>
            <Link
              href='/terms'
              className='hover:text-foreground transition-colors'
            >
              Terms of Service
            </Link>
          </div>

          {/* CTAs */}
          <div className='flex items-center gap-3'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/login'>Login</Link>
            </Button>
            <Button size='sm' asChild>
              <Link href='/get-started'>Get Started</Link>
            </Button>
          </div>
        </div>

        {/* Copyright */}
        <div className='mt-8 pt-8 border-t text-center text-sm text-muted-foreground'>
          © {new Date().getFullYear()} Novocy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
