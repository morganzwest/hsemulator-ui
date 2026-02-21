'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAccount } from '@/contexts/AccountContext';

export function AccountSwitcher() {
  const { accounts, loading, activeAccount, switchAccount } = useAccount();

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
    <Select value={activeAccount?.id} onValueChange={switchAccount}>
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
