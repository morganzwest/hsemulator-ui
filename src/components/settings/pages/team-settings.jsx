'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
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
import { getActiveAccountId } from '~/lib/account-state';
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

/* -------------------------------------------------- */

const ROLES = ['client', 'consultant', 'developer', 'owner'];

const ROLE_DESCRIPTIONS = {
  owner: 'Full administrative control, billing, and workspace management.',
  consultant:
    'Can manage client data, workflows, and operational configuration.',
  developer:
    'Can create and modify actions, automations, and technical settings.',
  client: 'Limited visibility. Can view permitted data and updates only.',
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
      <p className='text-sm font-medium'>No team members</p>
      <p className='text-xs text-muted-foreground'>
        Users and pending invitations will appear here.
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

export function TeamMembersSettingsPage({ portalId }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [removingId, setRemovingId] = useState(null);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [inviteToRevoke, setInviteToRevoke] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('client');

  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  const [accountId, setAccountId] = useState(null);
  const [accountError, setAccountError] = useState(null);

  // Initialize account ID safely
  useEffect(() => {
    try {
      const id = getActiveAccountId();
      setAccountId(id);
      setAccountError(null);
    } catch (error) {
      console.error('Account state not initialized:', error.message);
      setAccountError(error.message);
      setAccountId(null);
    }
  }, []);

  async function confirmRemove() {
    if (!memberToRemove) return;

    try {
      setRemovingId(memberToRemove.profile_id);

      const { error } = await supabase
        .from('portal_members')
        .delete()
        .eq('portal_uuid', portalId)
        .eq('profile_id', memberToRemove.profile_id);

      if (error) throw error;

      await loadData();
      toast.success('User removed');
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
        .from('portal_invites')
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

  const resolveCurrentUserRole = useCallback(async () => {
    if (!portalId) return;

    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return;

    const userId = authData.user.id;
    setCurrentUserId(userId);

    const { data, error } = await supabase
      .from('portal_members')
      .select('role')
      .eq('portal_uuid', portalId)
      .eq('profile_id', userId)
      .single();

    if (error) return;

    if (data) setCurrentUserRole(data.role);
  }, [portalId, supabase]);

  const loadData = useCallback(async () => {
    if (!portalId) return;

    const { data: membersData, error: membersError } = await supabase
      .from('portal_members')
      .select(
        `
        portal_uuid,
        role,
        profile_id,
        profile:profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      `,
      )
      .eq('portal_uuid', portalId);

    if (membersError) {
      toast.error(membersError.message);
      return;
    }

    const { data: invitesData, error: invitesError } = await supabase
      .from('portal_invites')
      .select('*')
      .eq('portal_uuid', portalId)
      .is('accepted_at', null);

    if (invitesError) {
      toast.error(invitesError.message);
      return;
    }

    setMembers(membersData ?? []);
    setInvites(invitesData ?? []);
  }, [portalId, supabase]);

  // Load data when account ID is available
  useEffect(() => {
    if (accountId && portalId) {
      resolveCurrentUserRole();
      loadData();
    }
  }, [accountId, portalId, resolveCurrentUserRole, loadData]);

  async function handleInvite() {
    if (!email || !portalId) return;

    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke(
        'invite-portal-member',
        {
          body: {
            portal_uuid: portalId,
            email: email.trim().toLowerCase(),
            full_name: fullName.trim() || null,
            role,
          },
        },
      );

      if (error) throw error;

      setFullName('');
      setEmail('');
      setRole('client');

      await loadData();
      toast.success('Invite sent');
    } catch (err) {
      toast.error(err.message ?? 'Invite failed');
    }

    setLoading(false);
  }

  async function handleRoleChange(profileId, newRole) {
    try {
      setUpdatingId(profileId);

      const { data, error } = await supabase
        .from('portal_members')
        .update({ role: newRole })
        .eq('portal_uuid', portalId)
        .eq('profile_id', profileId)
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

  const sortedInvites = [...invites].sort((a, b) =>
    a.email.localeCompare(b.email),
  );

  const hasData = sortedMembers.length || sortedInvites.length;
  const isOwner = currentUserRole === 'owner';

  // Show loading state while account is being initialized
  if (accountError) {
    return (
      <SettingsPage
        title='Team members'
        description='Manage workspace users and permissions.'
      >
        <div className='rounded-md border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 p-6 text-center'>
          <p className='text-sm text-red-800 dark:text-red-200'>
            Account information is not available. Please refresh the page or try
            relogging.
          </p>
          <p className='text-xs text-red-600 dark:text-red-400 mt-2'>
            Error: {accountError}
          </p>
        </div>
      </SettingsPage>
    );
  }

  if (!accountId) {
    return (
      <SettingsPage
        title='Team members'
        description='Manage workspace users and permissions.'
      >
        <div className='rounded-md border p-6 text-center'>
          <p className='text-sm text-muted-foreground'>
            Loading account information...
          </p>
        </div>
      </SettingsPage>
    );
  }

  return (
    <SettingsPage
      title='Team members'
      description='Manage workspace users and permissions.'
    >
      <section className='space-y-6 rounded-lg border p-6'>
        {/* Invite Bar */}

        <div className='space-y-2'>
          <Label>Invite user</Label>

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
              Active Members
            </p>

            {sortedMembers.map((m) => {
              const displayName = m.profile.full_name ?? m.profile.email;
              const isSelf = m.profile_id === currentUserId;

              return (
                <div
                  key={m.profile.id}
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
                        disabled={removingId === m.profile_id}
                        className='cursor-pointer opacity-0 group-hover:opacity-100 transition text-xs text-red-500 hover:text-red-600'
                      >
                        Remove
                      </button>
                    )}

                    {isOwner && !isSelf ? (
                      <Select
                        value={m.role}
                        onValueChange={(value) =>
                          handleRoleChange(m.profile_id, value)
                        }
                      >
                        <SelectTrigger
                          className='h-8 w-32 text-xs capitalize'
                          disabled={updatingId === m.profile_id}
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

        {/* Pending Invites */}

        {sortedInvites.length > 0 && (
          <div className='space-y-2'>
            <p className='text-xs font-medium text-muted-foreground'>
              Pending Invites
            </p>

            {sortedInvites.map((invite) => (
              <div
                key={invite.id}
                className='group flex items-center justify-between rounded-md border border-dashed px-3 py-2'
              >
                <div className='min-w-0'>
                  <p className='text-sm truncate'>{invite.email}</p>
                  <StatusBadge>Invite sent</StatusBadge>
                </div>

                <div className='flex items-center gap-4'>
                  {isOwner && (
                    <button
                      onClick={() => setInviteToRevoke(invite)}
                      disabled={revokingId === invite.id}
                      className='cursor-pointer opacity-0 group-hover:opacity-100 transition text-xs text-red-500 hover:text-red-600'
                    >
                      Revoke
                    </button>
                  )}

                  <span className='text-xs text-muted-foreground capitalize'>
                    {invite.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <AlertDialog
        open={!!inviteToRevoke}
        onOpenChange={() => setInviteToRevoke(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke invite</AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate the invite for{' '}
              <span className='font-medium'>{inviteToRevoke?.email}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRevokeInvite}
              disabled={revokingId === inviteToRevoke?.id}
              className='bg-red-500 text-white hover:bg-red-700'
            >
              Revoke
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately revoke workspace access for{' '}
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
