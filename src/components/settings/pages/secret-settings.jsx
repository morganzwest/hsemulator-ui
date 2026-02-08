'use client';

import { useEffect, useState } from 'react';
import { SettingsPage } from '../settings-page';
import { SecretRow } from '~/components/secret-row';
import { NewSecretRow } from '~/components/new-secret-row';
import { fetchPortalSecrets } from '@/lib/settings/secrets';
import { ShieldCheck } from 'lucide-react';

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

  function handleDeleted(secretId) {
    setSecrets((prev) => prev.filter((s) => s.id !== secretId));
  }

  useEffect(() => {
    if (!portalId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const data = await fetchPortalSecrets(portalId);
        if (!cancelled) {
          setSecrets(data || []);
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
        {/* Header */}
        <div className='space-y-1'>
          <h3 className='text-sm font-semibold'>Secrets</h3>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <ShieldCheck className='h-3.5 w-3.5' />
            Values are encrypted at rest and never shown again after saving.
          </div>
        </div>

        {/* Content */}
        <div className='space-y-2'>
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
            <NewSecretRow portalId={portalId} onCreated={addSecret} />
          )}
        </div>
      </section>
    </SettingsPage>
  );
}
