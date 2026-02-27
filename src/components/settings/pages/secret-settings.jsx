'use client';

import { useEffect, useState } from 'react';
import { SettingsPage } from '../settings-page';
import { SecretRow } from '~/components/secret-row';
import { NewSecretRow } from '~/components/new-secret-row';
import { fetchPortalSecrets } from '@/lib/settings/secrets';
import { ShieldCheck } from 'lucide-react';
import { getAccountLimits } from '@/lib/account-limits';
import { InfoNotice, SettingsNotice } from '../settings-notice';

/* -------------------------------------
   Skeleton row
------------------------------------- */

function SecretSkeleton() {
  return <div className='h-11 rounded-md bg-muted/40 animate-pulse' />;
}

/* -------------------------------------
   Empty state
------------------------------------- */

function EmptySecretsState() {
  return (
    <div className='rounded-md border border-dashed p-8 text-center space-y-2'>
      <p className='text-sm font-medium'>No secrets yet</p>
      <p className='text-xs text-muted-foreground max-w-sm mx-auto'>
        Add environment variables to securely share API keys and credentials
        across all actions in this portal.
      </p>
    </div>
  );
}

/* -------------------------------------
   Page
------------------------------------- */

export function PortalSecretsSettingsPage({ portalId }) {
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountLimits, setAccountLimits] = useState(null);

  function handleDeleted(secretId) {
    setSecrets((prev) => prev.filter((s) => s.id !== secretId));
  }

  useEffect(() => {
    if (!portalId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const [secretsData, limitsData] = await Promise.all([
          fetchPortalSecrets(portalId),
          getAccountLimits(),
        ]);

        if (!cancelled) {
          setSecrets(secretsData || []);
          setAccountLimits(limitsData);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [portalId]);

  function addSecret(secret) {
    setSecrets((prev) => [...prev, secret]);
  }

  return (
    <SettingsPage
      title='Environment variables'
      description='Encrypted values injected into all actions in this portal.'
    >
      <section className='space-y-6 rounded-lg border p-4 md:p-6'>
        {/* Multi-portal info - only show if account has access to multiple portals */}
        {accountLimits && accountLimits.actual_portals > 1 && (
          <SettingsNotice
            variant='default'
            title='Secrets are stored per portal'
            description='Environment variables and secrets are specific to each portal and are not shared across multiple portals. Each portal maintains its own separate set of secrets for security and isolation.'
          />
        )}

        <div className='space-y-1'>
          <h3 className='text-sm font-semibold'>Secrets</h3>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <ShieldCheck className='h-3.5 w-3.5' />
            Values are encrypted at rest and never shown again after saving.
          </div>
        </div>

        <div className='space-y-4'>
          {loading && (
            <>
              <SecretSkeleton />
              <SecretSkeleton />
              <SecretSkeleton />
            </>
          )}

          {!loading && secrets.length === 0 && <EmptySecretsState />}

          {!loading &&
            secrets.map((secret) => (
              <SecretRow
                key={secret.id}
                secret={secret}
                onDeleted={handleDeleted}
              />
            ))}

          {!loading && (
            <NewSecretRow
              portalId={portalId}
              onCreated={addSecret}
              secrets={secrets}
            />
          )}
        </div>
      </section>
    </SettingsPage>
  );
}
