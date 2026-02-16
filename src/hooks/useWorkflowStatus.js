import { useEffect, useState, useRef, useCallback } from 'react';
import { checkWorkflowStatus } from '@/lib/cicd/cicd';
import { logger } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/errors';

// Retry utility with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on authentication errors or client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        throw error;
      }

      // If this is the last attempt, throw error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

export function useWorkflowStatus({
  workflowId,
  secretName,
  cicdSecretId,
  sourceCode,
  isEditing,
  manualTrigger,
  debounceMs = 1500, // Increased from 1000ms for better performance
}) {
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const statusCheckControllerRef = useRef(null);
  const lastCheckTimeRef = useRef(0);
  const rateLimitMs = 2000; // Minimum 2 seconds between status checks
  const previousManualTriggerRef = useRef(0);

  const checkStatus = useCallback(async (signal) => {
    if (!workflowId.trim() || !secretName.trim() || !cicdSecretId || isEditing) {
      return;
    }

    // Rate limiting: check if enough time has passed since last check
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTimeRef.current;
    const isManualTrigger = manualTrigger !== previousManualTriggerRef.current;

    // Bypass rate limit for manual triggers (like after push)
    if (!isManualTrigger && timeSinceLastCheck < rateLimitMs && !signal.aborted) {
      // If not enough time has passed and this isn't a manual trigger, skip this check
      return;
    }

    previousManualTriggerRef.current = manualTrigger;
    lastCheckTimeRef.current = now;
    setStatusLoading(true);
    try {
      const status = await retryWithBackoff(async () => {
        return await checkWorkflowStatus({
          workflowId,
          cicdSecretId,
          searchKey: secretName,
          sourceCode,
        });
      }, 2, 800); // 2 retries with 800ms base delay

      // Only update if we weren't aborted during the call
      if (!signal.aborted) {
        setWorkflowStatus(status);
        setStatusChecked(true);
      }
    } catch (err) {
      // Only show error if we weren't aborted
      if (!signal.aborted) {
        logger.error('Failed to check workflow status:', err);

        // Return error instead of showing toast for better flexibility
        return {
          error: true,
          message: getErrorMessage(err),
        };
      }
    } finally {
      // Only update loading state if we weren't aborted
      if (!signal.aborted) {
        setStatusLoading(false);
      }
    }

    return null;
  }, [workflowId, secretName, cicdSecretId, sourceCode, isEditing, manualTrigger]);

  const getErrorMessage = (err) => {
    let errorMessage = ERROR_MESSAGES.FAILED_TO_CHECK_STATUS;
    if (err.message.includes('Missing required parameters')) {
      errorMessage = 'Invalid configuration. Please check your workflow ID and secret name.';
    } else if (err.status === 429) {
      errorMessage = 'Too many requests. Please wait a moment and try again.';
    } else if (err.status >= 500) {
      errorMessage = 'Server error. Please try again in a few moments.';
    } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
    }
    return errorMessage;
  };

  // Main status checking effect
  useEffect(() => {
    // Cancel any pending status check
    if (statusCheckControllerRef.current) {
      statusCheckControllerRef.current.abort();
    }

    const controller = new AbortController();
    statusCheckControllerRef.current = controller;

    const timeoutId = setTimeout(async () => {
      const error = await checkStatus(controller.signal);
      if (error && !controller.signal.aborted) {
        // Let the component handle the error display
        console.error('Status check error:', error.message);
      }
    }, debounceMs);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [workflowId, secretName, cicdSecretId, sourceCode, isEditing, manualTrigger, debounceMs, checkStatus]);

  // Clear status when fields are incomplete or we're editing
  useEffect(() => {
    if (!workflowId.trim() || !secretName.trim() || !cicdSecretId || isEditing) {
      setWorkflowStatus(null);
      setStatusChecked(false);
    }
  }, [workflowId, secretName, cicdSecretId, isEditing]);

  const resetStatus = useCallback(() => {
    setWorkflowStatus(null);
    setStatusChecked(false);
  }, []);

  const triggerStatusCheck = useCallback(() => {
    // This will trigger the useEffect to run again
    setStatusChecked(false);
  }, []);

  return {
    workflowStatus,
    statusLoading,
    statusChecked,
    resetStatus,
    triggerStatusCheck,
  };
}
