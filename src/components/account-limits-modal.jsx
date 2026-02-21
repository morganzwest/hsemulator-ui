'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Briefcase, ArrowUp, Play } from 'lucide-react';
import { formatLimitNumber } from '@/lib/utils/number-formatting';

export function AccountLimitsModal({ open, onOpenChange, limits }) {
  if (!limits) return null;

  const portalUsagePercent =
    limits.max_portals > 0
      ? (limits.actual_portals / limits.max_portals) * 100
      : 0;
  const userUsagePercent =
    limits.max_users > 0 ? (limits.actual_users / limits.max_users) * 100 : 0;
  const executionUsagePercent =
    limits.max_executions > 0
      ? (limits.current_month_executions / limits.max_executions) * 100
      : 0;

  const maxPortals = formatLimitNumber(limits.max_portals);
  const maxUsers = formatLimitNumber(limits.max_users);
  const maxExecutions = formatLimitNumber(limits.max_executions);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Account Limits
          </DialogTitle>
          <DialogDescription>
            Current usage and limits for your {limits.plan} plan
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Plan Badge */}
          <div className='flex justify-center'>
            <Badge
              variant={limits.plan === 'pro' ? 'default' : 'secondary'}
              className='text-sm px-3 py-1'
            >
              {limits.plan.charAt(0).toUpperCase() + limits.plan.slice(1)} Plan
            </Badge>
          </div>

          {/* Portals Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Briefcase className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Portals</span>
              </div>
              <span className='text-sm text-muted-foreground'>
                {limits.actual_portals} /{' '}
                <span title={maxPortals.tooltip}>{maxPortals.value}</span>
              </span>
            </div>
            <Progress value={portalUsagePercent} className='h-2' />
            <div className='text-xs text-muted-foreground'>
              {limits.portals_remaining} portal
              {limits.portals_remaining !== 1 ? 's' : ''} remaining
            </div>
          </div>

          {/* Users Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Team Members</span>
              </div>
              <span className='text-sm text-muted-foreground'>
                {limits.actual_users} /{' '}
                <span title={maxUsers.tooltip}>{maxUsers.value}</span>
              </span>
            </div>
            <Progress value={userUsagePercent} className='h-2' />
            <div className='text-xs text-muted-foreground'>
              {limits.users_remaining} member
              {limits.users_remaining !== 1 ? 's' : ''} remaining
            </div>
          </div>

          {/* Executions Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Play className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium'>Monthly Executions</span>
              </div>
              <span className='text-sm text-muted-foreground'>
                {limits.current_month_executions} /{' '}
                <span title={maxExecutions.tooltip}>{maxExecutions.value}</span>
              </span>
            </div>
            {limits.max_executions && (
              <>
                <Progress value={executionUsagePercent} className='h-2' />
                <div className='text-xs text-muted-foreground'>
                  {limits.executions_remaining} execution
                  {limits.executions_remaining !== 1 ? 's' : ''} remaining this
                  month
                </div>
              </>
            )}
            {!limits.max_executions && (
              <div className='text-xs text-muted-foreground'>
                Unlimited executions for your plan
              </div>
            )}
          </div>

          {/* Upgrade CTA */}
          {(limits.portals_remaining === 0 ||
            limits.users_remaining === 0 ||
            limits.executions_remaining === 0) && (
            <div className='rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4'>
              <div className='flex items-center gap-2 text-amber-800 dark:text-amber-200'>
                <ArrowUp className='h-4 w-4' />
                <span className='text-sm font-medium'>Upgrade Your Plan</span>
              </div>
              <p className='text-xs text-amber-700 dark:text-amber-300 mt-1'>
                You've reached your limits. Upgrade to add more portals, team
                members, and executions.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {(limits.portals_remaining === 0 ||
            limits.users_remaining === 0 ||
            limits.executions_remaining === 0) && (
            <Button onClick={() => (window.location.href = '/pricing')}>
              Upgrade Plan
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
