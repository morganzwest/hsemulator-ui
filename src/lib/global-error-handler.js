"use client"

import { handleError, captureMessage } from './errors';

// Global error handlers for browser errors
export function setupGlobalErrorHandlers() {
  // Handle unhandled promise rejections
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      handleError(new Error(event.reason), {
        type: 'unhandledrejection',
        promise: event.promise
      });
      
      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      handleError(event.error || new Error(event.message), {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handle resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        // This is a resource loading error (img, script, etc.)
        captureMessage(`Resource loading failed: ${event.target.src || event.target.href}`, 'warning', {
          type: 'resource_error',
          element: event.target.tagName,
          source: event.target.src || event.target.href
        });
      }
    }, true);
  }
}

// Setup global error handlers when the module is imported
if (typeof window !== 'undefined') {
  setupGlobalErrorHandlers();
}
