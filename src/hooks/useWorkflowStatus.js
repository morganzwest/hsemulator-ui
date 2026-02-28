import { useEffect, useState, useRef, useCallback } from 'react';
import { checkWorkflowStatus } from '@/lib/cicd/cicd';
import { logger } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/errors';

// Retry utility with exponential backoff
/**
 * Retry utility function with exponential backoff for handling transient failures
 * 
 * @param {Function} fn - The async function to retry
 * @param {number} [maxRetries=3] - Maximum number of retry attempts
 * @param {number} [baseDelay=1000] - Base delay in milliseconds for exponential backoff
 * @returns {Promise<any>} Result of the function execution
 * 
 * @throws {Error} The last error encountered after all retries are exhausted
 * 
 * @example
 * try {
 *   const result = await retryWithBackoff(
 *     () => fetch('/api/data'),
 *     3,
 *     1000
 *   );
 * } catch (error) {
 *   console.error('All retries failed:', error);
 * }
 */
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

/**
 * Custom hook for managing workflow status checking with rate limiting and retry logic
 * 
 * @param {Object} config - Hook configuration object
 * @param {string} config.workflowId - The workflow ID to check status for
 * @param {string} config.secretName - The secret name for authentication (legacy)
 * @param {string} config.cicdSecretId - The CICD secret ID for authentication
 * @param {string} config.sourceCode - The source code to compare against
 * @param {string} config.actionId - The action ID to check status for
 * @param {boolean} config.isEditing - Whether the configuration is being edited
 * @param {number} config.manualTrigger - Manual trigger value for forcing status checks
 * @param {number} [config.debounceMs=1500] - Debounce delay in milliseconds
 * 
 * @returns {Object} Hook state and control functions
 * @returns {Object|null} returns.workflowStatus - Current workflow status data
 * @returns {boolean} returns.statusLoading - Whether status check is in progress
 * @returns {boolean} returns.statusChecked - Whether status has been checked at least once
 * @returns {Function} returns.resetStatus - Function to reset status state
 * @returns {Function} returns.triggerStatusCheck - Function to manually trigger status check
 * 
 * @example
 * const {
 *   workflowStatus,
 *   statusLoading,
 *   statusChecked,
 *   resetStatus,
 *   triggerStatusCheck
 * } = useWorkflowStatus({
 *   workflowId: '123456789',
 *   cicdSecretId: 'secret-123',
 *   actionId: 'action-456',
 *   sourceCode: 'function handler() { return "Hello"; }',
 *   isEditing: false,
 *   manualTrigger: 0
 * });
 */
export function useWorkflowStatus({
  workflowId,
  secretName,
  cicdSecretId,
  sourceCode,
  actionId,
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
  const forceNextCheckRef = useRef(false);
  const [triggerKey, setTriggerKey] = useState(0); // Add trigger key to force re-runs

  /**
 * Checks workflow status with rate limiting and retry logic
 * 
 * @param {AbortSignal} signal - Abort signal to cancel the status check
 * @returns {Promise<Object|null>} Error object if check fails, null otherwise
 * 
 * @example
 * const error = await checkStatus(controller.signal);
 * if (error) {
 *   console.error('Status check failed:', error.message);
 * }
 */
  const checkStatus = useCallback(async (signal) => {
    if (!workflowId.trim() || (!secretName?.trim() && !actionId) || !cicdSecretId || !actionId || isEditing) {
      return;
    }

    // Rate limiting: check if enough time has passed since last check
    const now = Date.now();
    const timeSinceLastCheck = now - lastCheckTimeRef.current;
    const isManualTrigger = manualTrigger !== previousManualTriggerRef.current;

    // Bypass rate limit for manual triggers (like after push) or when forced
    if (!isManualTrigger && !forceNextCheckRef.current && timeSinceLastCheck < rateLimitMs && !signal.aborted) {
      // If not enough time has passed and this isn't a manual trigger or forced check, skip this check
      return;
    }

    // Reset force flag after using it
    forceNextCheckRef.current = false;

    previousManualTriggerRef.current = manualTrigger;
    lastCheckTimeRef.current = now;
    setStatusLoading(true);
    try {
      const status = await retryWithBackoff(async () => {
        return await checkWorkflowStatus({
          workflowId,
          cicdSecretId,
          actionId,
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
  }, [workflowId, secretName, cicdSecretId, actionId, sourceCode, isEditing, manualTrigger]);

  /**
 * Generates user-friendly error messages based on error type and status
 * 
 * @param {Error} err - The error object to generate message for
 * @returns {string} User-friendly error message
 * 
 * @example
 * const message = getErrorMessage(error);
 * // Returns: 'Network error. Please check your connection and try again.'
 */
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
  }, [workflowId, secretName, cicdSecretId, actionId, sourceCode, isEditing, manualTrigger, debounceMs, checkStatus, triggerKey]);

  // Clear status when fields are incomplete or we're editing
  useEffect(() => {
    if (!workflowId.trim() || (!secretName?.trim() && !actionId) || !cicdSecretId || !actionId || isEditing) {
      setWorkflowStatus(null);
      setStatusChecked(false);
    }
  }, [workflowId, secretName, cicdSecretId, actionId, isEditing]);

  /**
 * Resets the workflow status state and allows immediate next check
 * 
 * @returns {void}
 * 
 * @example
 * resetStatus();
 */
  const resetStatus = useCallback(() => {
    setWorkflowStatus(null);
    setStatusChecked(false);
    // Reset rate limiting to allow immediate next check
    forceNextCheckRef.current = true;
    lastCheckTimeRef.current = 0;
  }, []);

  /**
 * Triggers a manual status check by incrementing the trigger key
 * 
 * @returns {void}
 * 
 * @example
 * triggerStatusCheck();
 */
  const triggerStatusCheck = useCallback(() => {
    // This will trigger the useEffect to run again by incrementing the trigger key
    setTriggerKey(prev => prev + 1);
    setStatusChecked(false);
    // Force immediate check by calling checkStatus directly
    const controller = new AbortController();
    checkStatus(controller.signal);
  }, [checkStatus]);

  return {
    workflowStatus,
    statusLoading,
    statusChecked,
    resetStatus,
    triggerStatusCheck,
  };
}
