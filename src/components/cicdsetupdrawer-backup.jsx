'use client';

import { useEffect, useState } from 'react';
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
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  fetchCICDConfig,
  saveCICDConfig,
  promoteAction,
  checkWorkflowStatus,
} from '@/lib/cicd/cicd';

export function CICDSetupDrawer({
  open,
  onOpenChange,
  actionId,
  portalId,
  sourceCode,
}) {
  const [workflowId, setWorkflowId] = useState('');
  const [secretName, setSecretName] = useState('');
  const [token, setToken] = useState('');
  const [maskedToken, setMaskedToken] = useState('');
  const [replaceToken, setReplaceToken] = useState(false);
  const [cicdSecret, setCicdSecret] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [showForceConfirm, setShowForceConfirm] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);

  const hasExistingToken = Boolean(maskedToken);
  const hasCicdSecret = Boolean(cicdSecret);
  const hasAllFields = workflowId.trim() && secretName.trim();
  const isReadonly = hasAllFields && !isEditing;

  /* --------------------------------
     Load config on open
  -------------------------------- */

  useEffect(() => {
    if (!open) return;

    setLoading(true);

    fetchCICDConfig(actionId, portalId)
      .then((config) => {
        setWorkflowId(config.workflowId || '');
        setSecretName(config.secretName || '');
        setMaskedToken(
          config.token ? `${config.token.slice(0, 8)}•••••••` : '',
        );
        setCicdSecret(config.cicdSecret);
        setToken('');
        setReplaceToken(false);
        setIsEditing(false);
        setWorkflowStatus(null);
        setStatusChecked(false); // Reset status check state
      })
      .catch(() => {
        toast.error('Failed to load CI/CD configuration');
      })
      .finally(() => setLoading(false));
  }, [open, actionId, portalId]);

  /* --------------------------------
     Derived state
  -------------------------------- */

  const canSave =
    workflowId.trim() &&
    secretName.trim() &&
    (!hasCicdSecret && !replaceToken ? false : true) &&
    (!replaceToken || token.length);

  const canPush =
    workflowId.trim() &&
    secretName.trim() &&
    (hasCicdSecret || hasExistingToken) &&
    statusChecked; // Only allow push after status is checked

  /* --------------------------------
     Actions
  -------------------------------- */

  async function handleSave() {
    setLoading(true);

    try {
      await saveCICDConfig({
        actionId,
        portalId,
        workflowId,
        secretName,
        token: replaceToken ? token : undefined,
      });

      toast.success('CI/CD configuration saved');
      setToken('');
      setReplaceToken(false);
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to save CI/CD configuration');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    console.debug('=== CICD Sheet useEffect Check ===');
    console.debug('workflowId.trim():', workflowId.trim());
    console.debug('secretName.trim():', secretName.trim());
    console.debug('cicdSecret?.id:', cicdSecret?.id);
    console.debug('isEditing:', isEditing);
    console.debug(
      'Condition result:',
      workflowId.trim() && secretName.trim() && cicdSecret?.id && !isEditing,
    );

    // Only check status if we have all required fields AND we're not currently editing
    if (
      workflowId.trim() &&
      secretName.trim() &&
      cicdSecret?.id &&
      !isEditing
    ) {
      console.debug('✓ Condition passed, setting timeout...');
      const timeoutId = setTimeout(async () => {
        // Final check before making the call
        console.debug('About to call checkWorkflowStatus with:', {
          workflowId,
          cicdSecretId: cicdSecret.id,
          searchKey: secretName,
        });

        if (
          !workflowId.trim() ||
          !secretName.trim() ||
          !cicdSecret?.id ||
          isEditing
        ) {
          console.debug('✗ Pre-call validation failed, returning');
          return;
        }

        console.debug(
          '✓ Pre-call validation passed, calling checkWorkflowStatus...',
        );
        setStatusLoading(true);
        try {
          const status = await checkWorkflowStatus({
            workflowId,
            cicdSecretId: cicdSecret.id,
            searchKey: secretName,
            sourceCode,
          });
          console.log('✓ checkWorkflowStatus succeeded:', status);
          setWorkflowStatus(status);
          setStatusChecked(true);
        } catch (err) {
          console.error('Failed to check workflow status:', err);
          // Don't show toast for validation errors, just log them
          if (!err.message.includes('Missing required parameters')) {
            toast.error('Failed to check workflow status');
          }
        } finally {
          setStatusLoading(false);
        }
      }, 500); // Debounce
      return () => clearTimeout(timeoutId);
    } else {
      console.debug('✗ Condition failed, clearing status');
      // Clear status when fields are incomplete or we're editing
      setWorkflowStatus(null);
    }
  }, [workflowId, secretName, cicdSecret?.id, sourceCode, isEditing]);

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

  async function performPush() {
    setPushing(true);

    try {
      const res = await promoteAction({
        workflowId,
        secretName,
        hubspotToken: hasCicdSecret ? null : token,
        sourceCode,
        cicdSecretId: cicdSecret?.id,
        force: showForceConfirm,
      });

      if (res.status === 'noop') {
        toast.info('Workflow already up to date');
      } else {
        toast.success('Action promoted to HubSpot');
        // Refresh status after successful promotion
        setStatusChecked(false);
        setWorkflowStatus(null);
      }
      setShowForceConfirm(false);
    } catch (err) {
      toast.error(err.message || 'Promotion failed');
    } finally {
      setPushing(false);
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case 'in_sync':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'out_of_sync':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'unmanaged':
      case 'not_found':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case 'in_sync':
        return <CheckCircle className='h-5 w-5' />;
      case 'out_of_sync':
        return <AlertCircle className='h-5 w-5' />;
      case 'unmanaged':
      case 'not_found':
        return <AlertCircle className='h-5 w-5' />;
      default:
        return <Info className='h-5 w-5' />;
    }
  }

  function getButtonText() {
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
        return 'No action found with this search key. Force deploy to create new action.';
      case 'not_found':
        if (actionFound) {
          return 'Action found but status check failed. Try refreshing or contact support.';
        }
        return 'No action found in workflow. Check workflow ID and search key, then force deploy.';
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
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side='right' className='w-full max-w-2xl sm:max-w-lg'>
          <div className='flex flex-col h-full'>
            {/* Header */}
            <SheetHeader className='px-6 py-4 border-b bg-background/95 backdrop-blur-sm'>
              <div className='flex items-center justify-between'>
                <SheetTitle className='flex items-center gap-3 text-xl'>
                  <div className='p-2 bg-primary/10 rounded-lg'>
                    <Workflow className='h-6 w-6 text-primary' />
                  </div>
                  CI/CD Configuration
                </SheetTitle>
                <SheetClose asChild>
                  <Button variant='ghost' size='icon' className='h-8 w-8'>
                    <X className='h-4 w-4' />
                  </Button>
                </SheetClose>
              </div>
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
                          disabled={loading || isReadonly}
                          className={`h-11 px-4 pr-10 font-mono text-sm transition-all duration-200 ${
                            isReadonly
                              ? 'bg-muted/50 border-muted-300 text-muted-foreground cursor-not-allowed'
                              : 'bg-background border-input focus:ring-2 focus:ring-primary focus:border-primary'
                          }`}
                          inputMode='numeric'
                          placeholder='123456789'
                          value={workflowId}
                          onChange={(e) =>
                            setWorkflowId(e.target.value.replace(/\D/g, ''))
                          }
                        />
                        {workflowId.trim() && (
                          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                            <div className='w-5 h-5 rounded-full bg-green-500 flex items-center justify-center'>
                              <Check className='h-3 w-3 text-white' />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground ml-1'>
                        Numeric HubSpot workflow identifier
                      </p>
                    </div>

                    {/* Search Secret Field */}
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <Label className='text-sm font-medium text-foreground'>
                          Search Secret Name
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
                          disabled={loading || isReadonly}
                          className={`h-11 px-4 pr-10 font-mono text-sm transition-all duration-200 ${
                            isReadonly
                              ? 'bg-muted/50 border-muted-300 text-muted-foreground cursor-not-allowed'
                              : 'bg-background border-input focus:ring-2 focus:ring-primary focus:border-primary'
                          }`}
                          placeholder='HUBSPOT_PRIVATE_APP_TOKEN'
                          value={secretName}
                          onChange={(e) => setSecretName(e.target.value)}
                        />
                        {secretName.trim() && (
                          <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                            <div className='w-5 h-5 rounded-full bg-green-500 flex items-center justify-center'>
                              <Check className='h-3 w-3 text-white' />
                            </div>
                          </div>
                        )}
                      </div>
                      <p className='text-xs text-muted-foreground ml-1'>
                        Secret name to locate the target action
                      </p>
                    </div>
                  </div>
                </div>

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
                        CICD-scoped secret detected and will be used for secure
                        authentication.
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
              CI/CD. A force deploy is required to initialize the action in your
              HubSpot workflow.
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
                  Make sure your workflow ID and search key are correct
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
  );
}
