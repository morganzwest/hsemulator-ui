'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { handleError } from '@/lib/errors';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our error reporting service
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });

    handleError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
      componentName: this.props.componentName || 'Unknown',
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className='min-h-50 flex items-center justify-center p-6'>
          <div className='text-center max-w-md'>
            <div className='flex justify-center mb-4'>
              <div className='rounded-full bg-destructive/10 p-3'>
                <AlertTriangle className='h-6 w-6 text-destructive' />
              </div>
            </div>

            <h2 className='text-lg font-semibold mb-2'>Something went wrong</h2>

            <p className='text-muted-foreground mb-4'>
              {this.props.fallbackMessage ||
                "An unexpected error occurred. We've been notified and are working on a fix."}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className='text-left mb-4 p-3 bg-muted rounded-md'>
                <summary className='cursor-pointer font-mono text-sm mb-2'>
                  Error Details (Development Only)
                </summary>
                <pre className='text-xs overflow-auto max-h-32'>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className='flex gap-2 justify-center'>
              <Button
                variant='outline'
                size='sm'
                onClick={this.handleReset}
                className='flex items-center gap-2'
              >
                <RefreshCw className='h-4 w-4' />
                Try Again
              </Button>

              <Button
                variant='default'
                size='sm'
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC wrapper for easier usage
export function withErrorBoundary(Component, fallbackMessage, componentName) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary
        fallbackMessage={fallbackMessage}
        componentName={componentName}
      >
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
