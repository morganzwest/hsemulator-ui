'use client';

import { useState, useMemo, useEffect } from 'react';
import { SettingsPage } from '../settings-page';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { getActiveAccountId } from '~/lib/account-state';

/* -------------------------------------------------- */

const ROLES = ['member', 'admin', 'owner'];

const ROLE_DESCRIPTIONS = {
  owner: 'Full administrative control, billing, and account management.',
  admin:
    'Can manage users, portals, and most account settings.',
  member:
    'Can access assigned portals and view account information.',
};

function StatusBadge({ children }) {
  return (
    <div className='flex items-center gap-2 text-xs text-amber-500'>
      <div className='h-2 w-2 rounded-full bg-amber-500' />
      <span>{children}</span>
    </div>
  );
}

function EmptyMembersState() {
  return (
    <div className='rounded-md border border-dashed p-10 text-center space-y-2'>
      <p className='text-sm font-medium'>No account members</p>
      <p className='text-xs text-muted-foreground'>
        Account members will appear here.
      </p>
    </div>
  );
}

function Avatar({ profile }) {
  const displayName = profile.full_name ?? profile.email;
  const initial = displayName?.charAt(0)?.toUpperCase();

  if (profile.avatar_url) {
    return (
      <img
        src={profile.avatar_url}
        alt={displayName}
        className='h-8 w-8 rounded-full object-cover bg-muted'
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div className='h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs'>
      {initial}
    </div>
  );
}

/* -------------------------------------------------- */

export function AccountMembersSettingsPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [removingId, setRemovingId] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [inviteToRevoke, setInviteToRevoke] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');

  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const accountId = getActiveAccountId();

  async function confirmRemove() {
    if (!memberToRemove) return;

    try {
      setRemovingId(memberToRemove.user_id);

      const { error } = await supabase
        .from('account_users')
        .delete()
        .eq('account_id', accountId)
        .eq('user_id', memberToRemove.user_id);

      if (error) throw error;

      await loadData();
      toast.success('User removed from account');
    } catch (err) {
      toast.error(err.message ?? 'Failed to remove user');
    }

    setRemovingId(null);
    setMemberToRemove(null);
  }

  async function confirmRevokeInvite() {
    if (!inviteToRevoke) return;

    try {
      setRevokingId(inviteToRevoke.id);

      const { error } = await supabase
        .from('account_invites')
        .delete()
        .eq('id', inviteToRevoke.id);

      if (error) throw error;

      await loadData();
      toast.success('Invite revoked');
    } catch (err) {
      toast.error(err.message ?? 'Failed to revoke invite');
    }

    setRevokingId(null);
    setInviteToRevoke(null);
  }

  async function resolveCurrentUserRole() {
    if (!accountId) return;

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    const userId = authData.user.id;
    setCurrentUserId(userId);

    const { data, error } = await supabase
      .from('account_users')
      .select('role')
      .eq('account_id', accountId)
      .eq('user_id', userId)
      .single();

    if (error) return;

    if (data) setCurrentUserRole(data.role);
  }

  async function loadData() {
    if (!accountId) return;

    const { data: membersData, error: membersError } = await supabase
      .from('account_users')
      .select(`
        account_id,
        role,
        user_id,
        profile:profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      `)
      .eq('account_id', accountId);

    if (membersError) {
      toast.error(membersError.message);
      return;
    }

    setMembers(membersData ?? []);
  }

  useEffect(() => {
    resolveCurrentUserRole();
    loadData();
  }, [accountId]);

  async function handleInvite() {
    if (!email || !accountId) return;

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke(
        'invite-account-member',
        {
          body: {
            account_id: accountId,
            email: email.trim().toLowerCase(),
            full_name: fullName.trim() || null,
            role,
          },
        },
      );

      if (error) throw error;

      setFullName('');
      setEmail('');
      setRole('member');

      await loadData();
      toast.success('Invite sent');
    } catch (err) {
      toast.error(err.message ?? 'Invite failed');
    }

    setLoading(false);
  }

  async function handleRoleChange(userId, newRole) {
    try {
      setUpdatingId(userId);

      const { data, error } = await supabase
        .from('account_users')
        .update({ role: newRole })
        .eq('account_id', accountId)
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      if (!data?.length) throw new Error('Update rejected');

      await loadData();
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.message ?? 'Failed to update role');
    }

    setUpdatingId(null);
  }

  const sortedMembers = [...members].sort((a, b) => {
    const nameA = (a.profile.full_name ?? a.profile.email).toLowerCase();
    const nameB = (b.profile.full_name ?? b.profile.email).toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const hasData = sortedMembers.length;
  const isOwner = currentUserRole === 'owner';

  return (
    <SettingsPage
      title='Account members'
      description='Manage account users and permissions.'
    >
      <section className='space-y-6 rounded-lg border p-6'>
        {/* Invite Bar */}

        <div className='space-y-2'>
          <Label>Invite user to account</Label>

          <div className='rounded-md border bg-muted/40 p-3'>
            <div className='flex gap-2'>
              <Input
                placeholder='email@company.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='h-9'
              />

              <Input
                placeholder='Name (optional)'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className='h-9'
              />

              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className='h-9 w-32'>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {ROLES.slice()
                    .sort()
                    .map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleInvite}
                disabled={loading || !email.trim()}
                className='h-9 px-3'
              >
                Invite
              </Button>
            </div>

            <p className='text-xs text-muted-foreground mt-2'>
              {ROLE_DESCRIPTIONS[role]}
            </p>
          </div>
        </div>

        {/* Empty */}

        {!hasData && <EmptyMembersState />}

        {/* Active Members */}

        {sortedMembers.length > 0 && (
          <div className='space-y-2'>
            <p className='text-xs font-medium text-muted-foreground'>
              Account Members
            </p>

            {sortedMembers.map((m) => {
              const displayName = m.profile.full_name ?? m.profile.email;
              const isSelf = m.user_id === currentUserId;

              return (
                <div
                  key={m.user_id}
                  className='group flex items-center justify-between rounded-md border px-3 py-2 hover:bg-muted/40'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <Avatar profile={m.profile} />

                    <div className='min-w-0'>
                      <div className='flex items-center gap-2'>
                        <p className='text-sm truncate'>{displayName}</p>

                        {isSelf && (
                          <span className='text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground'>
                            You
                          </span>
                        )}
                      </div>

                      <p className='text-xs text-muted-foreground truncate'>
                        {m.profile.email}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    {isOwner && !isSelf && (
                      <button
                        onClick={() => setMemberToRemove(m)}
                        disabled={removingId === m.user_id}
                        className='cursor-pointer opacity-0 group-hover:opacity-100 transition text-xs text-red-500 hover:text-red-600'
                      >
                        Remove
                      </button>
                    )}

                    {isOwner && !isSelf ? (
                      <Select
                        value={m.role}
                        onValueChange={(value) =>
                          handleRoleChange(m.user_id, value)
                        }
                      >
                        <SelectTrigger
                          className='h-8 w-32 text-xs capitalize'
                          disabled={updatingId === m.user_id}
                        >
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          {ROLES.slice()
                            .sort()
                            .map((r) => (
                              <SelectItem key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className='text-xs text-muted-foreground capitalize'>
                        {m.role}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Remove Member Dialog */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove account member</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately revoke account access for{' '}
              <span className='font-medium'>
                {memberToRemove?.profile.full_name ??
                  memberToRemove?.profile.email}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              className='bg-red-500 text-white hover:bg-red-700'
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsPage>
  );
}
