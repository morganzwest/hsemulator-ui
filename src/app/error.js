"use client"

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { handleError } from '@/lib/errors';
import Link from 'next/link';

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to Sentry
    handleError(error, {
      type: 'nextjs_error_page',
      resettable: true
    });
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Application Error</h1>

        <p className="text-muted-foreground mb-6">
          Something went wrong while loading this page. We&apos;ve been notified and are working on a fix.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left mb-6 p-4 bg-muted rounded-md">
            <summary className="cursor-pointer font-mono text-sm mb-2">
              Error Details (Development Only)
            </summary>
            <pre className="text-xs overflow-auto max-h-32 whitespace-pre-wrap">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <Button
            variant="outline"
            asChild
            className="flex items-center gap-2"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
