'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useWorkflowStatus } from '@/hooks/useWorkflowStatus';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ShieldCheck,
  Workflow,
  RefreshCcw,
  CheckCircle,
  Check,
  Edit3,
  Info,
  AlertCircle,
  Loader2,
  Settings,
  Rocket,
  Lock,
  Unlock,
  ExternalLink,
  HelpCircle,
  Code,
  Terminal,
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { ERROR_MESSAGES } from '@/lib/errors';
import { getActivePortal } from '@/lib/portal-state';
import {
  fetchCICDConfig,
  saveCICDConfig,
  promoteAction,
  checkWorkflowStatus,
  fetchWorkflowDetails,
} from '@/lib/cicd/cicd';

/* --------------------------------
   Retry Utility with Exponential Backoff
-------------------------------- */

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

      // If this is the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * CI/CD Setup Drawer component for configuring workflow deployments
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {Function} props.onOpenChange - Callback function to handle drawer open/close state
 * @param {string} props.actionId - The ID of the current action
 * @param {string} props.portalId - The ID of the current portal
 * @param {string} props.sourceCode - The source code to be deployed
 *
 * @returns {JSX.Element} The rendered CI/CD setup drawer component
 *
 * @example
 * <CICDSetupDrawer
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   actionId="action-123"
 *   portalId="portal-456"
 *   sourceCode="function handler() { return 'Hello'; }"
 * />
 */
export function CICDSetupDrawer({
  open,
  onOpenChange,
  actionId,
  portalId,
  sourceCode,
}) {
  const [workflowId, setWorkflowId] = useState('');
  const [debouncedWorkflowId, setDebouncedWorkflowId] = useState('');
  const [selectedActionId, setSelectedActionId] = useState('');
  const [secretName, setSecretName] = useState('');
  const [token, setToken] = useState('');
  const [maskedToken, setMaskedToken] = useState('');
  const [replaceToken, setReplaceToken] = useState(false);
  const [cicdSecret, setCicdSecret] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showForceConfirm, setShowForceConfirm] = useState(false);
  const [manualStatusTrigger, setManualStatusTrigger] = useState(0);
  const [pushCompleted, setPushCompleted] = useState(false);
  const pushCompletedTimeoutRef = useRef(null);

  // Track if user has made manual input to prevent config overwrites
  const hasUserInputRef = useRef(false);

  // Debounce workflow ID to prevent rapid state changes while typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedWorkflowId(workflowId);
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [workflowId]);

  // Workflow fetching states
  const [workflowData, setWorkflowData] = useState(null);
  const [fetchingWorkflow, setFetchingWorkflow] = useState(false);
  const [showActionSelection, setShowActionSelection] = useState(false);
  const [workflowActions, setWorkflowActions] = useState([]);

  // Get portal data for URL generation
  const [portalData, setPortalData] = useState(null);

  // Use custom hook for status checking
  const {
    workflowStatus,
    statusLoading,
    statusChecked,
    resetStatus,
    triggerStatusCheck,
    // secretName is the legacy prop for secret identification, actionId is the new intent-driven prop
  } = useWorkflowStatus({
    workflowId: debouncedWorkflowId,
    secretName: cicdSecret?.name,
    cicdSecretId: cicdSecret?.id,
    sourceCode,
    actionId: selectedActionId,
    isEditing,
    manualTrigger: manualStatusTrigger,
    debounceMs: 1500, // Use improved debouncing
  });

  // Validation states
  const [workflowIdError, setWorkflowIdError] = useState('');
  const [secretNameError, setSecretNameError] = useState('');

  // Refs for focus management
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape' && open && !showForceConfirm) {
        onOpenChange(false);
      }
    },
    [open, showForceConfirm, onOpenChange],
  );

  // Focus trap for accessibility
  const handleFocusTrap = useCallback((event) => {
    if (event.key === 'Tab') {
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusableRef.current) {
          event.preventDefault();
          lastFocusableRef.current?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusableRef.current) {
          event.preventDefault();
          firstFocusableRef.current?.focus();
        }
      }
    }
  }, []);

  // Add keyboard event listeners
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleFocusTrap);

      // Focus first element when drawer opens
      setTimeout(() => {
        firstFocusableRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keydown', handleFocusTrap);
    };
  }, [open, handleKeyDown, handleFocusTrap]);

  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);

  const hasExistingToken = Boolean(maskedToken);
  const hasCicdSecret = Boolean(cicdSecret);
  const hasAllFields =
    workflowId.trim() && selectedActionId.trim() && !workflowIdError;
  const isReadonly = hasAllFields && !isEditing;

  /* --------------------------------
     Validation Functions
  -------------------------------- */

  /**
   * Validates workflow ID input for format and length requirements
   *
   * @param {string} value - The workflow ID value to validate
   * @returns {boolean} True if valid, false otherwise
   *
   * @example
   * if (validateWorkflowId('123456789')) {
   *   // Valid workflow ID
   * } else {
   *   // Invalid workflow ID
   * }
   */
  const validateWorkflowId = (value) => {
    if (!value.trim()) {
      setWorkflowIdError('Workflow ID is required');
      return false;
    }
    if (!/^\d+$/.test(value.trim())) {
      setWorkflowIdError('Workflow ID must be numeric');
      return false;
    }
    if (value.trim().length < 6) {
      setWorkflowIdError('Workflow ID appears to be too short');
      return false;
    }
    setWorkflowIdError('');
    return true;
  };

  /**
   * Determines if the selected action ID should be cleared based on workflow ID changes
   *
   * @param {string} newWorkflowId - The new workflow ID value
   * @param {string} previousWorkflowId - The previous workflow ID value
   * @returns {boolean} True if action ID should be cleared
   */
  const shouldClearActionId = (newWorkflowId, previousWorkflowId) => {
    // Clear if workflow ID becomes empty
    if (!newWorkflowId.trim()) {
      return true;
    }

    // Clear if workflow ID becomes too short (likely incomplete typing)
    if (newWorkflowId.length < 6) {
      return true;
    }

    // Clear if workflow ID format becomes invalid (non-numeric)
    if (!/^\d+$/.test(newWorkflowId)) {
      return true;
    }

    // Clear if the workflow ID fundamentally changes (not just typing more digits)
    // This prevents clearing when user is just adding more digits to an existing valid ID
    if (
      previousWorkflowId &&
      newWorkflowId.startsWith(previousWorkflowId) &&
      newWorkflowId.length > previousWorkflowId.length
    ) {
      return false;
    }

    // Clear if workflow ID changes to a completely different value
    if (
      previousWorkflowId &&
      previousWorkflowId.length >= 6 &&
      newWorkflowId.length >= 6 &&
      newWorkflowId !== previousWorkflowId
    ) {
      return true;
    }

    return false;
  };

  /**
   * Validates secret name input for format and length requirements
   *
   * @param {string} value - The secret name value to validate
   * @returns {boolean} True if valid, false otherwise
   *
   * @example
   * if (validateSecretName('my-secret-123')) {
   *   // Valid secret name
   * } else {
   *   // Invalid secret name
   * }
   */
  const validateSecretName = (value) => {
    if (!value.trim()) {
      setSecretNameError('Secret name is required');
      return false;
    }
    // Allow alphanumeric, underscores, and hyphens
    if (!/^[A-Za-z0-9_-]+$/.test(value.trim())) {
      setSecretNameError(
        'Secret name can only contain letters, numbers, underscores, and hyphens',
      );
      return false;
    }
    if (value.trim().length > 100) {
      setSecretNameError('Secret name must be 100 characters or less');
      return false;
    }
    setSecretNameError('');
    return true;
  };

  /* --------------------------------
     Load config on open (ONLY ONCE)
  -------------------------------- */

  // Reset user input flag when drawer closes
  useEffect(() => {
    if (!open) {
      hasUserInputRef.current = false;
    }
  }, [open]);

  // Load config ONLY when drawer opens and user hasn't made input yet
  useEffect(() => {
    if (!open || hasUserInputRef.current) return;

    setLoading(true);

    // Get portal data for URL generation
    try {
      const portal = getActivePortal();
      setPortalData(portal);
    } catch (err) {
      console.warn('Failed to get portal data:', err);
      setPortalData({ id: portalId });
    }

    fetchCICDConfig(actionId, portalId)
      .then((config) => {
        // ONLY set workflow ID if user hasn't typed anything yet
        if (!hasUserInputRef.current) {
          setWorkflowId(config.workflowId || '');
          setSelectedActionId(config.actionId || '');
          console.log(
            '[CICD] Auto-pull config loaded, workflowId:',
            config.workflowId,
          );
        }

        setSecretName('');
        setMaskedToken(
          config.token ? `${config.token.slice(0, 8)}•••••••` : '',
        );
        setCicdSecret(config.cicdSecret);
        setToken('');
        setReplaceToken(false);
        setIsEditing(false);

        // Clear validation errors on load
        setWorkflowIdError('');
        setSecretNameError('');

        // Set up action selection UI based on config
        if (config.workflowId && config.actionId) {
          setShowActionSelection(false);
        } else if (config.workflowId && !config.actionId) {
          setShowActionSelection(false);
        } else {
          setShowActionSelection(false);
        }
      })
      .catch(() => {
        toast.error(ERROR_MESSAGES.FAILED_TO_LOAD_CONFIG);
      })
      .finally(() => setLoading(false));
  }, [open, actionId, portalId]); // Remove all hook dependencies

  /* --------------------------------
     Derived state
  -------------------------------- */

  const canSave =
    workflowId.trim() &&
    selectedActionId.trim() &&
    (hasCicdSecret || replaceToken || token.length) &&
    (!replaceToken || token.length);

  const canPush =
    workflowId.trim() &&
    selectedActionId.trim() &&
    (hasCicdSecret || hasExistingToken) &&
    statusChecked &&
    !pushCompleted; // Disable when push was just completed

  // Debug canPush logic
  useEffect(() => {
    logger.log('canPush debug:', {
      canPush,
      workflowId: workflowId.trim(),
      selectedActionId: selectedActionId.trim(),
      hasCicdSecret,
      hasExistingToken,
      statusChecked,
      pushCompleted,
      workflowStatus,
    });
  }, [
    canPush,
    workflowId,
    selectedActionId,
    hasCicdSecret,
    hasExistingToken,
    statusChecked,
    pushCompleted,
    workflowStatus,
  ]);

  /* --------------------------------
     Workflow Fetching
  -------------------------------- */

  /**
   * Fetches workflow details from the runtime service and handles action selection
   *
   * @returns {Promise<void>}
   *
   * @example
   * await handleFetchWorkflow();
   */
  async function handleFetchWorkflow() {
    console.log('[CICD] Fetch workflow clicked:', {
      workflowId,
      workflowIdError,
    });

    if (!workflowId.trim()) {
      toast.error('Please enter a workflow ID first');
      return;
    }

    if (workflowIdError) {
      toast.error('Please fix workflow ID errors before fetching');
      return;
    }

    setFetchingWorkflow(true);
    try {
      console.log('[CICD] Calling fetchWorkflowDetails for:', workflowId);
      const data = await fetchWorkflowDetails(workflowId, cicdSecret?.id);
      console.log(
        '[CICD] Workflow data received, action count:',
        data.actions?.length || 0,
      );
      setWorkflowData(data);

      if (data.actions && data.actions.length > 0) {
        console.log('[CICD] Actions found:', data.actions.length);
        setWorkflowActions(data.actions);

        if (data.actions.length === 1) {
          // Single action - auto-select and proceed
          const singleAction = data.actions[0];
          console.log(
            '[CICD] Auto-selecting single action:',
            singleAction.action_id,
          );
          setSelectedActionId(singleAction.action_id);
          setShowActionSelection(false);

          // Save the action_id to database
          await saveCICDConfig({
            actionId,
            portalId,
            workflowId,
            secretName: '', // Empty since we're not using search tokens anymore
            selectedActionId: singleAction.action_id,
          });

          toast.success('Action automatically selected');
        } else {
          // Multiple actions - show selection
          console.log('[CICD] Multiple actions found, showing selection UI');
          setShowActionSelection(true);
        }
      } else {
        console.log('[CICD] No actions found in workflow');
        toast.error('No actions found in this workflow');
      }
    } catch (err) {
      console.error('[CICD] Failed to fetch workflow:', err);
      toast.error(err.message || ERROR_MESSAGES.FAILED_TO_FETCH_WORKFLOW);
    } finally {
      setFetchingWorkflow(false);
    }
  }

  /**
   * Returns the appropriate icon component for a given runtime environment
   *
   * @param {string} runtime - The runtime environment identifier
   * @returns {JSX.Element} Icon component for the runtime
   *
   * @example
   * const icon = getLanguageIcon('NODE20X'); // Returns Code icon
   * const icon = getLanguageIcon('PYTHON39'); // Returns Terminal icon
   */
  function getLanguageIcon(runtime) {
    switch (runtime) {
      case 'NODE20X':
        return <Code className='h-4 w-4' />;
      case 'PYTHON39':
        return <Terminal className='h-4 w-4' />;
      default:
        return <Code className='h-4 w-4' />;
    }
  }

  /**
   * Returns the human-readable name for a given runtime environment
   *
   * @param {string} runtime - The runtime environment identifier
   * @returns {string} Human-readable runtime name
   *
   * @example
   * const name = getLanguageName('NODE20X'); // Returns 'Node.js'
   * const name = getLanguageName('PYTHON39'); // Returns 'Python'
   */
  function getLanguageName(runtime) {
    switch (runtime) {
      case 'NODE20X':
        return 'Node.js';
      case 'PYTHON39':
        return 'Python';
      default:
        return 'Unknown';
    }
  }

  /**
   * Handles action selection from workflow actions and saves the configuration
   *
   * @param {string} newSelectedActionId - The ID of the selected action
   * @returns {Promise<void>}
   *
   * @example
   * await handleActionSelection('action-123');
   */
  async function handleActionSelection(newSelectedActionId) {
    setSelectedActionId(newSelectedActionId);
    setShowActionSelection(false);

    // Save the selected action_id to database
    try {
      await saveCICDConfig({
        actionId,
        portalId,
        workflowId,
        secretName: '', // Empty since we're not using search tokens anymore
        selectedActionId: newSelectedActionId,
      });
      toast.success('Action selected successfully');
    } catch (err) {
      toast.error(ERROR_MESSAGES.FAILED_TO_SAVE_CONFIG);
    }
  }

  /* --------------------------------
     Actions
  -------------------------------- */

  /**
   * Saves the current CI/CD configuration to the database
   *
   * @returns {Promise<void>}
   *
   * @example
   * await handleSave();
   */
  async function handleSave() {
    // Validate inputs before saving
    const isWorkflowIdValid = validateWorkflowId(workflowId);

    if (!isWorkflowIdValid) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setLoading(true);

    try {
      await saveCICDConfig({
        actionId,
        portalId,
        workflowId,
        secretName: '', // Empty since we're not using search tokens anymore
        selectedActionId: selectedActionId,
        token: replaceToken ? token : undefined,
      });

      toast.success('CI/CD configuration saved');
      setToken('');
      setReplaceToken(false);
      setIsEditing(false);
    } catch (err) {
      toast.error(ERROR_MESSAGES.FAILED_TO_SAVE_CONFIG);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Initiates the push/deployment process, handling force confirmation if needed
   *
   * @returns {Promise<void>}
   *
   * @example
   * await handlePush();
   */
  async function handlePush() {
    // Check if this is first-time setup and needs force
    if (
      workflowStatus?.status === 'unmanaged' ||
      workflowStatus?.status === 'not_found'
    ) {
      setShowForceConfirm(true);
      return;
    }

    await performPush();
  }

  /**
   * Performs the actual deployment to HubSpot with retry logic
   *
   * @returns {Promise<void>}
   *
   * @example
   * await performPush();
   */
  async function performPush() {
    setPushing(true);
    logger.log('Starting deployment process');

    try {
      const res = await retryWithBackoff(
        async () => {
          return await promoteAction({
            workflowId,
            actionId: selectedActionId,
            hubspotToken: hasCicdSecret ? null : token,
            sourceCode,
            cicdSecretId: cicdSecret?.id,
            force: showForceConfirm,
          });
        },
        2,
        1000,
      ); // 2 retries with 1s base delay

      if (res.status === 'noop') {
        toast.info(ERROR_MESSAGES.WORKFLOW_ALREADY_UP_TO_DATE);
        logger.log('Deployment completed with noop status');
        setPushCompleted(true);
        // Reset immediately since we don't need to check status again
        setTimeout(() => {
          logger.log(
            'Resetting pushCompleted state immediately after noop deployment',
          );
          setPushCompleted(false);
        }, 500);
      } else {
        toast.success(ERROR_MESSAGES.ACTION_PROMOTED_SUCCESSFULLY);
        logger.log('Deployment completed successfully');
        setPushCompleted(true);
        // Reset immediately since deployment was successful
        setTimeout(() => {
          logger.log(
            'Resetting pushCompleted state immediately after successful deployment',
          );
          setPushCompleted(false);
        }, 500);
      }
      setShowForceConfirm(false);
    } catch (err) {
      logger.error('Push failed:', err);

      // Provide more specific error messages
      let errorMessage = err.message || ERROR_MESSAGES.PROMOTION_FAILED;
      if (err.status === 401) {
        errorMessage = 'Authentication failed. Please check your credentials.';
      } else if (err.status === 403) {
        errorMessage =
          'Access denied. You may not have permission to perform this action.';
      } else if (err.status === 404) {
        errorMessage = 'Workflow not found. Please verify the workflow ID.';
      } else if (err.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (err.status >= 500) {
        errorMessage = 'Server error. Please try again in a few moments.';
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage =
          'Network error. Please check your connection and try again.';
      }

      toast.error(errorMessage);
      // Don't set pushCompleted on error to allow immediate retry
    } finally {
      setPushing(false);
    }
  }

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (pushCompletedTimeoutRef.current) {
        clearTimeout(pushCompletedTimeoutRef.current);
        pushCompletedTimeoutRef.current = null;
      }
    };
  }, []);

  // Clear push completed state when status check completes after push
  useEffect(() => {
    if (pushCompleted && !statusLoading && workflowStatus) {
      logger.log(
        'Resetting pushCompleted state due to successful status check',
      );
      logger.log(
        'Current state - pushCompleted:',
        pushCompleted,
        'statusLoading:',
        statusLoading,
        'statusChecked:',
        statusChecked,
        'workflowStatus:',
        workflowStatus,
      );
      setPushCompleted(false);
      // Clear any pending timeout
      if (pushCompletedTimeoutRef.current) {
        clearTimeout(pushCompletedTimeoutRef.current);
        pushCompletedTimeoutRef.current = null;
      }
    }
  }, [pushCompleted, statusLoading, workflowStatus, statusChecked]);

  // Fallback timeout to reset pushCompleted state
  useEffect(() => {
    if (pushCompleted) {
      // Set a fallback timeout to reset the button state after 8 seconds
      pushCompletedTimeoutRef.current = setTimeout(() => {
        logger.log('Resetting pushCompleted state due to timeout fallback');
        setPushCompleted(false);
        pushCompletedTimeoutRef.current = null;
      }, 8000);

      // Cleanup function to clear timeout if component unmounts or state changes
      return () => {
        if (pushCompletedTimeoutRef.current) {
          clearTimeout(pushCompletedTimeoutRef.current);
          pushCompletedTimeoutRef.current = null;
        }
      };
    }
  }, [pushCompleted]);

  /**
   * Returns CSS class names for styling workflow status indicators
   *
   * @param {string} status - The workflow status value
   * @returns {string} CSS class names for status styling
   *
   * @example
   * const classes = getStatusColor('in_sync'); // Returns green color classes
   * const classes = getStatusColor('out_of_sync'); // Returns yellow color classes
   */
  function getStatusColor(status) {
    switch (status) {
      case 'in_sync':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'out_of_sync':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'unmanaged':
      case 'not_found':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      case 'deploying':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
    }
  }

  /**
   * Returns the appropriate icon component for a given workflow status
   *
   * @param {string} status - The workflow status value
   * @returns {JSX.Element} Icon component for the status
   *
   * @example
   * const icon = getStatusIcon('in_sync'); // Returns CheckCircle icon
   * const icon = getStatusIcon('deploying'); // Returns Loader2 icon with animation
   */
  function getStatusIcon(status) {
    switch (status) {
      case 'in_sync':
        return <CheckCircle className='h-5 w-5' />;
      case 'out_of_sync':
        return <AlertCircle className='h-5 w-5' />;
      case 'unmanaged':
      case 'not_found':
        return <AlertCircle className='h-5 w-5' />;
      case 'deploying':
        return <Loader2 className='h-5 w-5 animate-spin' />;
      default:
        return <Info className='h-5 w-5' />;
    }
  }

  /**
   * Returns the appropriate button text based on current deployment state
   *
   * @returns {string} Button text for the deploy action
   *
   * @example
   * const text = getButtonText(); // Returns 'Deploying...', 'Deploy to HubSpot', etc.
   */
  function getButtonText() {
    if (pushing) {
      return 'Deploying...';
    }

    if (pushCompleted) {
      return 'Updating Status...';
    }

    if (!statusChecked) {
      return 'Checking Status...';
    }

    if (
      workflowStatus?.status === 'unmanaged' ||
      workflowStatus?.status === 'not_found'
    ) {
      return 'Force Deploy';
    }

    return 'Deploy to HubSpot';
  }

  /**
   * Returns human-readable text description for workflow status
   *
   * @param {string} status - The workflow status value
   * @returns {string} Human-readable status description
   *
   * @example
   * const text = getStatusText('in_sync'); // Returns 'Action is in sync with source code'
   * const text = getStatusText('unmanaged'); // Returns 'Action is not managed'
   */
  function getStatusText(status) {
    switch (status) {
      case 'in_sync':
        return 'Action is in sync with source code';
      case 'out_of_sync':
        return 'Action is out of sync - update needed';
      case 'unmanaged':
        return 'Action is not managed';
      case 'not_found':
        return 'Action not found in workflow';
      case 'workflow_not_found':
        return 'Workflow not found';
      case 'access_denied':
        return 'Access denied';
      default:
        return 'Unknown status';
    }
  }

  /**
   * Returns recommendation text based on workflow status and context
   *
   * @param {string} status - The workflow status value
   * @param {boolean} actionFound - Whether the action was found in the workflow
   * @param {boolean} hasHashMarker - Whether the action has a hash marker (unused)
   * @returns {string} Recommendation text for the user
   *
   * @example
   * const recommendation = getRecommendation('out_of_sync', true, false);
   * // Returns 'Action is out of sync with source code. Deploy to update.'
   */
  function getRecommendation(status, actionFound, hasHashMarker) {
    switch (status) {
      case 'in_sync':
        return 'Action is up to date. No deployment needed.';
      case 'out_of_sync':
        return 'Action is out of sync with source code. Deploy to update.';
      case 'unmanaged':
        if (actionFound) {
          return 'Action exists but is not managed by novocode. Force deploy to take control.';
        }
        return 'No action found with this action ID. Force deploy to create new action.';
      case 'not_found':
        if (actionFound) {
          return 'Action found but status check failed. Try refreshing or contact support.';
        }
        return 'No action found in workflow. Check workflow ID and action ID, then force deploy.';
      case 'workflow_not_found':
        return 'Workflow not found. Verify the workflow ID is correct and try again.';
      case 'access_denied':
        return 'Access denied. Check your authentication credentials and permissions.';
      default:
        return 'Unknown status. Try refreshing or contact support if issue persists.';
    }
  }

  /* --------------------------------
     Render
  -------------------------------- */

  return (
    <TooltipProvider>
      <>
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent side='right' className='w-full max-w-2xl sm:max-w-lg'>
            <div className='flex flex-col h-full'>
              {/* Header */}
              <SheetHeader className='px-6 py-4 border-b bg-background/95 backdrop-blur-sm'>
                <SheetTitle className='flex items-center gap-3 text-xl'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <Workflow className='h-6 w-6 text-primary' />
                  </div>
                  CI/CD Configuration
                </SheetTitle>
              </SheetHeader>

              {/* Scrollable Content */}
              <div className='flex-1 overflow-y-auto'>
                <div className='px-6 py-4 space-y-6'>
                  {/* Configuration Status Card */}
                  <div className='bg-card rounded-xl p-6 border shadow-sm'>
                    <div className='flex items-center justify-between mb-4'>
                      <h3 className='text-lg font-semibold flex items-center gap-2'>
                        <Settings className='h-5 w-5 text-muted-foreground' />
                        Configuration Status
                      </h3>
                      {hasAllFields && !isEditing && (
                        <div className='flex items-center gap-2 text-sm bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full border border-green-200 dark:border-green-800'>
                          <CheckCircle className='h-4 w-4' />
                          Configured
                        </div>
                      )}
                    </div>

                    {/* Configuration Fields */}
                    <div className='grid grid-cols-1 gap-6'>
                      {/* Workflow ID Field */}
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between'>
                          <Label className='text-sm font-medium text-foreground'>
                            Workflow ID
                          </Label>
                          {isReadonly && (
                            <Button
                              type='button'
                              variant='outline'
                              size='sm'
                              onClick={() => setIsEditing(true)}
                              className='h-8 px-3'
                            >
                              <Edit3 className='h-4 w-4 mr-2' />
                              Edit
                            </Button>
                          )}
                        </div>
                        <div className='relative'>
                          <Input
                            ref={firstFocusableRef}
                            disabled={loading || isReadonly}
                            className={`h-11 px-4 pr-20 font-mono text-sm transition-all duration-200 ${
                              isReadonly
                                ? 'bg-muted/50 border-muted-300 text-muted-foreground cursor-not-allowed'
                                : workflowIdError
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                  : 'bg-background border-input focus:ring-2 focus:ring-primary focus:border-primary'
                            }`}
                            placeholder='123456789'
                            value={workflowId}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');

                              // Mark that user has made manual input
                              if (value !== workflowId) {
                                hasUserInputRef.current = true;
                              }

                              setWorkflowId(value);

                              // NEVER clear selected action ID while typing - only clear on explicit user action
                              if (value) validateWorkflowId(value);
                            }}
                            onBlur={() => validateWorkflowId(workflowId)}
                            aria-invalid={!!workflowIdError}
                            aria-describedby={
                              workflowIdError ? 'workflow-id-error' : undefined
                            }
                          />
                          <div className='absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2'>
                            {workflowId.trim() && !workflowIdError && (
                              <div className='w-5 h-5 rounded-full bg-green-500 flex items-center justify-center'>
                                <Check className='h-3 w-3 text-white' />
                              </div>
                            )}
                            {selectedActionId.trim() && (
                              <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={() => setSelectedActionId('')}
                                className='h-7 px-2 text-xs'
                                title='Clear selected action'
                              >
                                <RefreshCcw className='h-3 w-3' />
                              </Button>
                            )}
                            {!(
                              workflowId.trim() &&
                              !workflowIdError &&
                              selectedActionId.trim()
                            ) && (
                              <Button
                                type='button'
                                variant=''
                                size='sm'
                                disabled={
                                  !workflowId.trim() ||
                                  workflowIdError ||
                                  fetchingWorkflow ||
                                  loading ||
                                  isReadonly
                                }
                                onClick={handleFetchWorkflow}
                                className='h-7 px-2 text-xs'
                              >
                                {fetchingWorkflow ? (
                                  <>
                                    <Loader2 className='h-3 w-3 animate-spin mr-1' />
                                    Searching...
                                  </>
                                ) : (
                                  'Search for Actions'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                        {workflowIdError && (
                          <p
                            id='workflow-id-error'
                            className='text-xs text-red-600 dark:text-red-400 ml-1 flex items-center gap-1'
                          >
                            <AlertCircle className='h-3 w-3' />
                            {workflowIdError}
                          </p>
                        )}
                        <p className='text-xs text-muted-foreground ml-1'>
                          Numeric HubSpot workflow identifier
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Selection Section */}
                  {showActionSelection && workflowActions.length > 1 && (
                    <div className='bg-card rounded-xl p-6 border shadow-sm'>
                      <h3 className='text-lg font-semibold flex items-center gap-2 mb-4'>
                        <Settings className='h-5 w-5 text-muted-foreground' />
                        Select Action
                      </h3>
                      <p className='text-sm text-muted-foreground mb-4'>
                        Multiple actions found in this workflow. Please select
                        the action you want to manage.
                      </p>
                      <div className='space-y-3'>
                        {workflowActions.map((action) => (
                          <div
                            key={action.action_id}
                            className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                              selectedActionId === action.action_id
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:bg-muted/50'
                            }`}
                            onClick={() =>
                              handleActionSelection(action.action_id)
                            }
                          >
                            <div className='flex items-center gap-3'>
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  selectedActionId === action.action_id
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                }`}
                              >
                                {selectedActionId === action.action_id && (
                                  <div className='w-2 h-2 rounded-full bg-white' />
                                )}
                              </div>
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <span className='font-mono text-sm font-medium'>
                                    Action ID: {action.action_id}
                                  </span>
                                  <div className='flex items-center gap-1 text-muted-foreground'>
                                    {getLanguageIcon(action.runtime)}
                                    <span className='text-xs'>
                                      {getLanguageName(action.runtime)}
                                    </span>
                                  </div>
                                </div>
                                <p className='text-xs text-muted-foreground'>
                                  Type: {action.type}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Authentication Section */}
                  <div className='bg-card rounded-xl p-6 border shadow-sm'>
                    <h3 className='text-lg font-semibold flex items-center gap-2 mb-4'>
                      <ShieldCheck className='h-5 w-5 text-muted-foreground' />
                      Authentication
                    </h3>

                    {hasCicdSecret ? (
                      <div className='space-y-4'>
                        <div className='flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg'>
                          <Lock className='h-5 w-5 text-green-600 dark:text-green-400' />
                          <div className='flex-1'>
                            <p className='font-medium text-green-800 dark:text-green-200'>
                              CICD Secret Available
                            </p>
                            <p className='text-sm text-green-600 dark:text-green-400'>
                              Using secret:{' '}
                              <span className='font-mono bg-green-100 dark:bg-green-900 px-2 py-1 rounded'>
                                {cicdSecret.name}
                              </span>
                            </p>
                          </div>
                          <CheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          CICD-scoped secret detected and will be used for
                          secure authentication.
                        </p>
                      </div>
                    ) : hasExistingToken && !replaceToken ? (
                      <div className='space-y-4'>
                        <div className='flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg'>
                          <Lock className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                          <div className='flex-1'>
                            <p className='font-medium text-blue-800 dark:text-blue-200'>
                              Token Configured
                            </p>
                            <p className='text-sm text-blue-600 dark:text-blue-400'>
                              Stored token:{' '}
                              <span className='font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded'>
                                {maskedToken}
                              </span>
                            </p>
                          </div>
                          <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => setReplaceToken(true)}
                            className='h-8 px-3'
                          >
                            <RefreshCcw className='h-4 w-4 mr-2' />
                            Replace
                          </Button>
                        </div>
                        <p className='text-sm text-muted-foreground'>
                          HubSpot token is stored securely and will be used for
                          authentication.
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        <div className='flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg'>
                          <Unlock className='h-5 w-5 text-amber-600 dark:text-amber-400' />
                          <div className='flex-1'>
                            <p className='font-medium text-amber-800 dark:text-amber-200'>
                              Token Required
                            </p>
                            <p className='text-sm text-amber-600 dark:text-amber-400'>
                              Please provide your HubSpot automation token
                            </p>
                          </div>
                        </div>
                        <Input
                          type='password'
                          disabled={loading}
                          className='h-11 px-4 font-mono text-sm bg-background'
                          placeholder='pat-na1_automation_token...'
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                        />
                        <p className='text-sm text-muted-foreground mt-2'>
                          Requires automation scope. Token will be encrypted and
                          stored securely.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Workflow Status */}
                  {workflowStatus && (
                    <div className='bg-card rounded-xl p-6 border shadow-sm'>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold flex items-center gap-2'>
                          {statusLoading ? (
                            <Loader2 className='h-5 w-5 animate-spin' />
                          ) : (
                            getStatusIcon(workflowStatus.status)
                          )}
                          Workflow Status
                        </h3>
                      </div>

                      <div
                        className={`p-4 rounded-lg border-2 ${getStatusColor(workflowStatus.status)}`}
                      >
                        <div className='flex items-start gap-3'>
                          <div
                            className={`p-2 rounded-full ${getStatusColor(workflowStatus.status)}`}
                          >
                            {getStatusIcon(workflowStatus.status)}
                          </div>
                          <div className='flex-1'>
                            <p className='font-semibold text-base mb-2'>
                              {getStatusText(workflowStatus.status)}
                            </p>
                            <p className='text-sm opacity-80'>
                              {getRecommendation(
                                workflowStatus.status,
                                workflowStatus.action_found,
                                workflowStatus.has_hash_marker,
                              )}
                            </p>
                            {/* {workflowStatus.action_found && (
                            <div className='mt-3 text-xs'>
                              <span className='inline-flex items-center gap-1 bg-blue-100 dark:bg-white text-red-600 px-2 py-1 rounded'>
                                <Info className='h-3 w-3' />
                                Action found at index{' '}
                                {workflowStatus.action_index}
                              </span>
                            </div>
                          )} */}
                          </div>
                        </div>
                      </div>

                      {workflowStatus.can_promote && (
                        <div className='mt-4 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg'>
                          <div className='flex items-center gap-2 text-green-800 dark:text-green-200'>
                            <Rocket className='h-4 w-4' />
                            <span className='text-sm font-medium'>
                              Ready to deploy
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <SheetFooter className='px-6 py-4 border-t bg-background/95 backdrop-blur-sm'>
                <div className='flex justify-between gap-3'>
                  <Button
                    variant='outline'
                    disabled={!canSave || loading}
                    onClick={handleSave}
                    className='h-11 px-6'
                  >
                    {loading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Settings className='mr-2 h-4 w-4' />
                        Save Configuration
                      </>
                    )}
                  </Button>

                  <Button
                    ref={lastFocusableRef}
                    disabled={!canPush || pushing}
                    onClick={handlePush}
                    className='h-11 px-6'
                  >
                    {pushing ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Deploying...
                      </>
                    ) : (
                      <>
                        <Rocket className='mr-2 h-4 w-4' />
                        {getButtonText()}
                      </>
                    )}
                  </Button>
                </div>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>

        {/* Force Push Confirmation Dialog */}
        <Dialog open={showForceConfirm} onOpenChange={setShowForceConfirm}>
          <DialogContent className='max-w-lg'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-3 text-xl'>
                <div className='p-2 bg-amber-100 dark:bg-amber-950 rounded-full'>
                  <AlertCircle className='h-6 w-6 text-amber-600 dark:text-amber-400' />
                </div>
                Force Deploy Required
              </DialogTitle>
              <DialogDescription className='text-base'>
                This appears to be the first time setting up this action with
                CI/CD. A force deploy is required to initialize the action in
                your HubSpot workflow.
              </DialogDescription>
            </DialogHeader>

            <div className='py-6 space-y-4'>
              <div className='space-y-3'>
                <div className='flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg'>
                  <div className='w-2 h-2 bg-amber-500 rounded-full' />
                  <span className='text-sm'>
                    This will create or update the action in your workflow
                  </span>
                </div>
                <div className='flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg'>
                  <div className='w-2 h-2 bg-blue-500 rounded-full' />
                  <span className='text-sm'>
                    Current source code will be deployed to HubSpot
                  </span>
                </div>
                <div className='flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-lg'>
                  <div className='w-2 h-2 bg-gray-500 rounded-full' />
                  <span className='text-sm text-muted-foreground'>
                    Make sure your workflow ID and action ID are correct
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowForceConfirm(false)}
                disabled={pushing}
                className='h-11 px-6'
              >
                Cancel
              </Button>
              <Button
                onClick={performPush}
                disabled={pushing}
                className='h-11 px-6 bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700'
              >
                {pushing ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Force Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className='mr-2 h-4 w-4' />
                    Force Deploy
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  );
}
