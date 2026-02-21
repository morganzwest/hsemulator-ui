'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { getActiveAccountId } from '@/lib/account-state';
import {
  checkLimitsWithUpgradeInfo,
  getLimitErrorMessage,
  AccountLimitError,
} from '@/lib/account-limits';
import { formatLimitNumber } from '@/lib/utils/number-formatting';

const supabase = createSupabaseBrowserClient();

export function InviteUserSheet({ open, onOpenChange }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleInvite() {
    if (!email || !fullName) return;

    setLoading(true);

    try {
      // Check account limits before inviting user
      const limitCheck = await checkLimitsWithUpgradeInfo('user');

      if (!limitCheck.canProceed) {
        if (limitCheck.error) {
          toast.error(limitCheck.error);
        }
        if (limitCheck.upgradeUrl) {
          // Optionally redirect to upgrade page
          window.location.href = limitCheck.upgradeUrl;
        }
        setLoading(false);
        return;
      }

      const accountId = getActiveAccountId();

      // Check if user is already invited or member
      const { data: existingInvite } = await supabase
        .from('portal_invites')
        .select('id')
        .eq('email', email)
        .eq(
          'portal_uuid',
          (
            await supabase
              .from('portals')
              .select('uuid')
              .eq('account_id', accountId)
              .limit(1)
              .single()
          ).data?.uuid,
        )
        .single();

      if (existingInvite) {
        toast.error('User already invited to this portal');
        setLoading(false);
        return;
      }

      // Get current user for invited_by field
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to invite users');
        setLoading(false);
        return;
      }

      // Get the portal UUID for the account
      const { data: portal } = await supabase
        .from('portals')
        .select('uuid')
        .eq('account_id', accountId)
        .limit(1)
        .single();

      if (!portal) {
        toast.error('No portal found for this account');
        setLoading(false);
        return;
      }

      // Create the invitation
      const { error: inviteError } = await supabase
        .from('portal_invites')
        .insert({
          portal_uuid: portal.uuid,
          email: email.toLowerCase().trim(),
          role,
          invited_by: user.id,
          full_name: fullName.trim(),
        });

      if (inviteError) {
        console.error(inviteError);

        // Handle limit exceeded errors from database triggers
        if (inviteError.message?.includes('User limit exceeded')) {
          const limits = await getAccountLimits(accountId);
          const maxUsers = formatLimitNumber(limits.max_users);
          toast.error(
            `User limit reached (<span title="${maxUsers.tooltip}">${maxUsers.value}</span>). Upgrade your plan to add more users.`,
          );
        } else {
          toast.error('Failed to send invitation: ' + inviteError.message);
        }

        setLoading(false);
        return;
      }

      toast.success(`Invitation sent to ${email}`);

      // Reset form
      setEmail('');
      setFullName('');
      setRole('member');
      onOpenChange(false);
    } catch (error) {
      console.error('Error inviting user:', error);

      if (error instanceof AccountLimitError) {
        toast.error(getLimitErrorMessage(error));
      } else {
        toast.error('Failed to invite user. Please try again.');
      }

      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-[400px] sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle>Invite User</SheetTitle>
          <SheetDescription>
            Invite a team member to join your workspace.
          </SheetDescription>
        </SheetHeader>

        <div className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='fullName'>Full Name</Label>
            <Input
              id='fullName'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder='John Doe'
              disabled={loading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='john@example.com'
              disabled={loading}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='role'>Role</Label>
            <Select value={role} onValueChange={setRole} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder='Select a role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='member'>Member</SelectItem>
                <SelectItem value='admin'>Admin</SelectItem>
                <SelectItem value='owner'>Owner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button
            onClick={handleInvite}
            disabled={loading || !email || !fullName}
          >
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
