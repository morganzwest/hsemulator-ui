'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import {
  getActiveAccount,
  getAvailableAccounts,
  setActiveAccount,
  initAccountState,
} from '~/lib/account-state';

const supabase = createSupabaseBrowserClient();

export function AccountSwitcher() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load accounts on mount
  useEffect(() => {
    async function loadAccounts() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        // Get accounts where user is a member
        const { data: accountUsers } = await supabase
          .from('account_users')
          .select(
            `
            account_id,
            role,
            account:accounts (
              id,
              name,
              plan
            )
          `,
          )
          .eq('user_id', user.id);

        if (accountUsers && accountUsers.length > 0) {
          const userAccounts = accountUsers.map((au) => au.account);
          console.log('[AccountSwitcher] Found accounts:', userAccounts);
          setAccounts(userAccounts);
          initAccountState(userAccounts);
        } else {
          // No accounts found - this shouldn't happen with the new trigger
          // but handle it gracefully
          console.log('No accounts found for user, creating default account');
          const { data: newAccount } = await supabase
            .from('accounts')
            .insert({
              name:
                user.user_metadata?.full_name ||
                user.email?.split('@')[0] ||
                'Default Account',
              plan: 'free',
            })
            .select()
            .single();

          if (newAccount) {
            await supabase.from('account_users').insert({
              account_id: newAccount.id,
              user_id: user.id,
              role: 'owner',
            });

            setAccounts([newAccount]);
            initAccountState([newAccount]);
          }
        }
      } catch (error) {
        console.error('Failed to load accounts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  });

  const activeAccount = useMemo(() => {
    try {
      return getActiveAccount();
    } catch {
      return accounts[0]; // Fallback to first account
    }
  }, [accounts]);

  if (loading) {
    return <div className='h-9 w-32 rounded-md bg-muted animate-pulse' />;
  }

  if (accounts.length <= 1) {
    return (
      <div className='text-sm font-medium text-muted-foreground'>
        {activeAccount?.name || 'Account'}
      </div>
    );
  }

  return (
    <Select
      value={activeAccount?.id}
      onValueChange={(accountId) => {
        setActiveAccount(accountId);
        window.location.reload(); // Reload to refresh all data
      }}
    >
      <SelectTrigger className='h-9 w-48'>
        <SelectValue placeholder='Select account'>
          {activeAccount?.name || 'Account'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            <div className='flex items-center gap-2'>
              <span>{account.name}</span>
              {account.plan === 'pro' && (
                <span className='text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded'>
                  Pro
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
