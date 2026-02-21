'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { initAccountState, getActiveAccount, getAvailableAccounts, setActiveAccount } from '@/lib/account-state';

const supabase = createSupabaseBrowserClient();

const AccountContext = createContext(null);

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}

export function AccountProvider({ children }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [activeAccount, setActiveAccountState] = useState(null);

  // Initialize accounts on mount
  useEffect(() => {
    async function initializeAccounts() {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Get accounts where user is a member
        const { data: accountUsers } = await supabase
          .from('account_users')
          .select(`
            account_id,
            role,
            account:accounts (
              id,
              name,
              plan
            )
          `)
          .eq('user_id', user.id);

        if (accountUsers && accountUsers.length > 0) {
          const userAccounts = accountUsers.map((au) => au.account);
          console.log('[AccountProvider] Found accounts:', userAccounts);
          setAccounts(userAccounts);
          
          // Initialize the account state module
          const activeAccountId = initAccountState(userAccounts);
          const active = userAccounts.find(a => a.id === activeAccountId);
          setActiveAccountState(active);
          
          setInitialized(true);
        } else {
          // No accounts found - create default account
          console.log('[AccountProvider] No accounts found, creating default account');
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

            const userAccounts = [newAccount];
            setAccounts(userAccounts);
            initAccountState(userAccounts);
            setActiveAccountState(newAccount);
            setInitialized(true);
          }
        }
      } catch (error) {
        console.error('[AccountProvider] Failed to initialize accounts:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    initializeAccounts();
  }, []);

  const switchAccount = useCallback(async (accountId) => {
    try {
      await setActiveAccount(accountId);
      const newActiveAccount = accounts.find(a => a.id === accountId);
      setActiveAccountState(newActiveAccount);
      
      // Reload to refresh all data
      window.location.reload();
    } catch (error) {
      console.error('[AccountProvider] Failed to switch account:', error);
      setError(error.message);
    }
  }, [accounts]);

  const value = {
    accounts,
    loading,
    error,
    initialized,
    activeAccount,
    switchAccount,
    // Convenience methods that match the old API
    getActiveAccountId: () => activeAccount?.id,
    getActiveAccount: () => activeAccount,
    getAvailableAccounts: () => accounts,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}
