'use client';

import { useEffect, useState } from 'react';
import { SettingsPage } from '../settings-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DownloadCloud,
  Edit3,
  CheckCircle,
  XCircle,
  Loader2,
  Code2,
  FileCode,
  Terminal,
  ExternalLink,
  Info,
} from 'lucide-react';
import { IoLogoJavascript, IoLogoPython } from 'react-icons/io5';
import { toast } from 'sonner';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { discoverWorkflows } from '@/lib/import/discover-workflows';

/* -------------------------------------
   Language icon mapping
------------------------------------- */

function getLanguageIcon(language) {
  switch (language?.toUpperCase()) {
    case 'PYTHON39':
      return <IoLogoPython className='h-3 w-3 text-blue-400' />;
    case 'JAVASCRIPT':
    case 'NODE':
    case 'NODE20X':
      return <IoLogoJavascript className='h-3 w-3 text-yellow-400' />;
    default:
      return <FileCode className='h-3 w-3' />;
  }
}

/* -------------------------------------
   Processed status icon
------------------------------------- */

function getProcessedIcon(processed) {
  return processed ? (
    <CheckCircle className='h-3 w-3 text-green-500' />
  ) : (
    <XCircle className='h-3 w-3 text-red-500' />
  );
}

/* -------------------------------------
   Results skeleton
------------------------------------- */

function ResultsSkeleton() {
  return (
    <div className='rounded-md border'>
      <div className='grid grid-cols-12 gap-3 p-3 border-b bg-muted/50 font-medium text-xs'>
        <div className='col-span-5'>Name</div>
        <div className='col-span-3 text-center'>Processed</div>
        <div className='col-span-2 text-center'>Language</div>
        <div className='col-span-2 text-center'>Link</div>
      </div>
      {[...Array(5)].map((_, index) => (
        <div
          key={index}
          className='grid grid-cols-12 gap-3 p-3 border-b last:border-b-0 items-center'
        >
          <div className='col-span-5'>
            <div className='h-3 w-20 bg-muted rounded animate-pulse' />
          </div>
          <div className='col-span-3 flex justify-center'>
            <div className='h-3 w-3 bg-muted rounded animate-pulse' />
          </div>
          <div className='col-span-2 flex justify-center'>
            <div className='h-3 w-3 bg-muted rounded animate-pulse' />
          </div>
          <div className='col-span-2 flex justify-center'>
            <div className='h-3 w-3 bg-muted rounded animate-pulse' />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyResultsState() {
  return (
    <div className='rounded-md border border-dashed p-8 text-center space-y-3'>
      <DownloadCloud className='h-8 w-8 mx-auto text-muted-foreground mb-2' />
      <p className='text-sm font-medium mb-1'>No workflows found</p>
      <p className='text-xs text-muted-foreground max-w-sm mx-auto flex items-center gap-1'>
        <Info className='h-3 w-3' />
        Try adjusting your portal credentials or check if workflows exist in the
        target portal.
      </p>
    </div>
  );
}

/* -------------------------------------
   Import Settings Page
------------------------------------- */

export function ImportSettingsPage({ portalId }) {
  const [portalData, setPortalData] = useState(null);
  const [cicdSecret, setCicdSecret] = useState(null);
  const [secrets, setSecrets] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [results, setResults] = useState(null);

  // Form states
  const [portalIdInput, setPortalIdInput] = useState('');
  const [selectedSecretId, setSelectedSecretId] = useState('');

  const hasExistingData = portalData?.id && portalData?.cicd_token;
  const hasCicdSecret = Boolean(cicdSecret);
  const isReadonly = hasExistingData && !isEditing;

  /* ---------------------------------
     Load portal data on mount
  --------------------------------- */

  useEffect(() => {
    if (!portalId) return;

    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const supabase = createSupabaseBrowserClient();

        // Get current user
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          setCurrentUserId(authData.user.id);
        }

        // Load portal data and CICD-scoped secret (similar to fetchCICDConfig pattern)
        const [
          { data: portalData, error: portalError },
          { data: cicdSecret, error: cicdSecretError },
        ] = await Promise.all([
          supabase
            .from('portals')
            .select('id, cicd_token, uuid')
            .eq('uuid', portalId)
            .single(),
          supabase
            .from('secrets')
            .select('id, name, scope')
            .eq('portal_id', portalId)
            .eq('scope', 'cicd')
            .maybeSingle(),
        ]);

        if (!cancelled) {
          if (!portalError) {
            setPortalData(portalData);
            setPortalIdInput(portalData.id?.toString() || '');
          }

          if (!cicdSecretError && cicdSecret) {
            setCicdSecret(cicdSecret);
            setSelectedSecretId(cicdSecret.id);
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        if (!cancelled) {
          toast.error('Failed to load portal data');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [portalId]);

  /* ---------------------------------
     Handle workflow discovery
  --------------------------------- */

  async function handleDiscover() {
    if (!portalIdInput.trim() || (!selectedSecretId && !hasCicdSecret)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setImporting(true);
    try {
      const response = await discoverWorkflows({
        secret_id: selectedSecretId || cicdSecret?.id,
        portal_id: portalId,
        owner_id: currentUserId, // Current user's ID, not portal ID
        portal_id_int: parseInt(portalIdInput, 10),
        process_actions: true,
      });

      setResults(response);
      toast.success(`Found ${response.total_workflows} workflows`);
    } catch (err) {
      console.error('Discovery failed:', err);
      toast.error(err.message || 'Failed to discover workflows');
    } finally {
      setImporting(false);
    }
  }

  /* ---------------------------------
     Handle edit mode toggle
  --------------------------------- */

  function handleEdit() {
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    // Reset to original values
    setPortalIdInput(portalData?.id?.toString() || '');
    // Reset secret to auto-filled CICD secret if available
    if (cicdSecret) {
      setSelectedSecretId(cicdSecret.id);
    } else {
      setSelectedSecretId('');
    }
  }

  if (loading) {
    return (
      <SettingsPage
        title='Import Workflows'
        description='Discover and import workflows from external portals.'
      >
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin' />
        </div>
      </SettingsPage>
    );
  }

  return (
    <SettingsPage
      title='Import Workflows'
      description='Discover and import workflows from external portals using portal credentials.'
    >
      <div className='space-y-6'>
        {/* Portal Configuration */}
        <section className='space-y-6 rounded-lg border p-4 md:p-6'>
          <div className='space-y-1'>
            <h3 className='text-sm font-semibold'>Portal Configuration</h3>
            <p className='text-xs text-muted-foreground'>
              Enter portal credentials to discover available workflows
            </p>
          </div>

          {isReadonly && (
            <div className='flex justify-end'>
              <Button variant='outline' size='sm' onClick={handleEdit}>
                <Edit3 className='h-4 w-4 mr-2' />
                Change
              </Button>
            </div>
          )}

          <div className='space-y-4'>
            {/* Portal ID Field */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='portal-id'>Portal ID</Label>
                {isReadonly && (
                  <Button variant='outline' size='sm' onClick={handleEdit}>
                    <Edit3 className='h-4 w-4 mr-2' />
                    Edit
                  </Button>
                )}
              </div>
              <Input
                id='portal-id'
                type='number'
                disabled={true}
                placeholder='12345678'
                value={portalIdInput}
                onChange={(e) => setPortalIdInput(e.target.value)}
                className='bg-muted/40'
                style={{
                  MozAppearance: 'textfield',
                  WebkitAppearance: 'none',
                }}
              />
            </div>

            {/* Secret Selection Field */}
            <div className='space-y-2'>
              <Label htmlFor='secret-select'>Authentication Secret</Label>
              {hasCicdSecret && !isEditing ? (
                <div className='flex items-center justify-between p-3 border rounded-md bg-muted/40'>
                  <span className='font-mono text-sm'>{cicdSecret.name}</span>
                  <Badge variant='secondary' className='text-xs'>
                    CICD
                  </Badge>
                </div>
              ) : (
                <>
                  <Select
                    value={selectedSecretId}
                    onValueChange={setSelectedSecretId}
                    disabled={isReadonly}
                  >
                    <SelectTrigger className={isReadonly ? 'bg-muted/40' : ''}>
                      <SelectValue placeholder='Select a secret for authentication' />
                    </SelectTrigger>
                    <SelectContent>
                      {secrets.map((secret) => (
                        <SelectItem key={secret.id} value={secret.id}>
                          {secret.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {secrets.length === 0 && (
                    <p className='text-xs text-muted-foreground'>
                      No secrets available. Please create a secret first.
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Actions */}
            <div className='flex gap-2 pt-2'>
              {isEditing ? (
                <>
                  <Button
                    onClick={handleDiscover}
                    disabled={
                      importing ||
                      !portalIdInput.trim() ||
                      !cicdToken.trim() ||
                      !selectedSecretId
                    }
                  >
                    {importing ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        Discovering...
                      </>
                    ) : (
                      <>
                        <DownloadCloud className='h-4 w-4 mr-2' />
                        Discover Workflows
                      </>
                    )}
                  </Button>
                  <Button variant='outline' onClick={handleCancel}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleDiscover}
                  disabled={
                    importing ||
                    !portalIdInput.trim() ||
                    (!selectedSecretId && !hasCicdSecret)
                  }
                >
                  {importing ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      Discovering...
                    </>
                  ) : (
                    <>
                      <DownloadCloud className='h-4 w-4 mr-2' />
                      Discover Workflows
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Results Table */}
        {results && (
          <section className='space-y-6 rounded-lg border p-4 md:p-6'>
            <div className='space-y-1'>
              <h3 className='text-sm font-semibold'>
                Discovery Results ({results.total_workflows} workflows)
              </h3>
              <p className='text-xs text-muted-foreground'>
                {results.total_code_actions} code actions found
              </p>
            </div>

            <div className='space-y-4'>
              {importing ? (
                <ResultsSkeleton />
              ) : results.actions?.length > 0 ? (
                <div className='rounded-md border'>
                  <div className='grid grid-cols-12 gap-3 p-3 border-b bg-muted/50 font-medium text-xs'>
                    <div className='col-span-5'>Name</div>
                    <div className='col-span-3 text-center'>Processed</div>
                    <div className='col-span-2 text-center'>Language</div>
                    <div className='col-span-2 text-center'>Link</div>
                  </div>
                  {results.actions.map((action, index) => (
                    <div
                      key={`${action.id}-${index}`}
                      className='grid grid-cols-12 gap-3 p-3 border-b last:border-b-0 items-center hover:bg-muted/20 transition-colors'
                    >
                      <div
                        className='col-span-5 font-mono text-xs truncate'
                        title={action.name}
                      >
                        {action.name}
                      </div>
                      <div className='col-span-3 flex justify-center'>
                        {getProcessedIcon(action.processed)}
                      </div>
                      <div className='col-span-2 flex justify-center'>
                        {getLanguageIcon(action.language)}
                      </div>
                      <div className='col-span-2 flex justify-center'>
                        <a
                          href={`https://app-eu1.hubspot.com/workflows/${portalIdInput}/platform/flow/${action.id}/edit`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50'
                          title='Open workflow in HubSpot'
                        >
                          <ExternalLink className='h-3 w-3' />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyResultsState />
              )}
            </div>
          </section>
        )}
      </div>
    </SettingsPage>
  );
}
