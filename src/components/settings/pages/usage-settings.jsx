'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowUp, Briefcase, Users, Play } from 'lucide-react';
import { formatLimitNumber } from '@/lib/utils/number-formatting';
import {
  getAccountLimits,
  getExecutionUsageHistory,
  getUpgradeUrl,
} from '@/lib/account-limits';
import { getActiveAccountId } from '@/lib/account-state';
import { UsageChart } from '@/components/usage-chart';
import { Skeleton } from '@/components/ui/skeleton';

export function UsageSettingsPage() {
  const [limits, setLimits] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    async function fetchLimits() {
      if (!accountId) return;

      try {
        setLoading(true);
        const data = await getAccountLimits(accountId);
        setLimits(data);
        setError(null);
      } catch (err) {
        console.error('[UsageSettings] Failed to fetch limits:', err);
        setError(err.message || 'Failed to load usage data');
      } finally {
        setLoading(false);
      }
    }

    fetchLimits();
  }, [accountId]);

  useEffect(() => {
    async function fetchHistory() {
      if (!accountId) return;

      try {
        setHistoryLoading(true);
        const data = await getExecutionUsageHistory(accountId, 6); // Always get 6 months
        setExecutionHistory(data);
      } catch (err) {
        console.error(
          '[UsageSettings] Failed to fetch execution history:',
          err,
        );
        // Don't show error for history, just log it
      } finally {
        setHistoryLoading(false);
      }
    }

    fetchHistory();
  }, [accountId]);

  const handleUpgrade = () => {
    if (limits?.plan) {
      window.location.href = getUpgradeUrl(limits.plan);
    }
  };

  if (accountError) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-3 text-destructive'>
            <AlertCircle className='h-5 w-5' />
            <div>
              <p className='font-medium'>Account not available</p>
              <p className='text-sm text-muted-foreground'>{accountError}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className='pb-3'>
                <Skeleton className='h-5 w-20' />
                <Skeleton className='h-4 w-32' />
              </CardHeader>
              <CardContent>
                <Skeleton className='h-8 w-16 mb-2' />
                <Skeleton className='h-2 w-full' />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-48' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-75 w-full' />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-3 text-destructive'>
            <AlertCircle className='h-5 w-5' />
            <div>
              <p className='font-medium'>Failed to load usage data</p>
              <p className='text-sm text-muted-foreground'>{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!limits) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <p className='text-center text-muted-foreground'>
            No usage data available
          </p>
        </CardContent>
      </Card>
    );
  }

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

  const hasReachedLimit =
    limits.portals_remaining === 0 ||
    limits.users_remaining === 0 ||
    limits.executions_remaining === 0;

  return (
    <div className='space-y-6'>
      {/* Plan Badge */}
      {/* <div className='flex justify-center'>
        <Badge
          variant={limits.plan === 'professional' ? 'default' : 'secondary'}
          className='text-sm px-3 py-1'
        >
          {limits.plan.charAt(0).toUpperCase() + limits.plan.slice(1)} Plan
        </Badge>
      </div> */}

      {/* Usage Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Portals Card */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <Briefcase className='h-4 w-4 text-muted-foreground' />
              <CardTitle className='text-sm font-medium'>Portals</CardTitle>
            </div>
            <CardDescription className='text-xs'>
              Workspaces in your account
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-baseline gap-1'>
              <span className='text-2xl font-bold'>
                {limits.actual_portals}
              </span>
              <span className='text-sm text-muted-foreground'>
                / <span title={maxPortals.tooltip}>{maxPortals.value}</span>
              </span>
            </div>
            <Progress value={portalUsagePercent} className='h-2' />
            <div className='text-xs text-muted-foreground'>
              {limits.portals_remaining} portal
              {limits.portals_remaining === 1 ? '' : 's'} remaining
            </div>
          </CardContent>
        </Card>

        {/* Team Members Card */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <Users className='h-4 w-4 text-muted-foreground' />
              <CardTitle className='text-sm font-medium'>
                Team Members
              </CardTitle>
            </div>
            <CardDescription className='text-xs'>
              Users in your account
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-baseline gap-1'>
              <span className='text-2xl font-bold'>{limits.actual_users}</span>
              <span className='text-sm text-muted-foreground'>
                / <span title={maxUsers.tooltip}>{maxUsers.value}</span>
              </span>
            </div>
            <Progress value={userUsagePercent} className='h-2' />
            <div className='text-xs text-muted-foreground'>
              {limits.users_remaining} member
              {limits.users_remaining === 1 ? '' : 's'} remaining
            </div>
          </CardContent>
        </Card>

        {/* Executions Card */}
        <Card>
          <CardHeader className='pb-3'>
            <div className='flex items-center gap-2'>
              <Play className='h-4 w-4 text-muted-foreground' />
              <CardTitle className='text-sm font-medium'>
                Monthly Executions
              </CardTitle>
            </div>
            <CardDescription className='text-xs'>
              Action runs this month
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div className='flex items-baseline gap-1'>
              <span className='text-2xl font-bold'>
                {limits.current_month_executions}
              </span>
              <span className='text-sm text-muted-foreground'>
                /{' '}
                <span title={maxExecutions.tooltip}>{maxExecutions.value}</span>
              </span>
            </div>
            {limits.max_executions && (
              <>
                <Progress value={executionUsagePercent} className='h-2' />
                <div className='text-xs text-muted-foreground'>
                  {limits.executions_remaining} execution
                  {limits.executions_remaining === 1 ? '' : 's'} remaining this
                  month
                </div>
              </>
            )}
            {!limits.max_executions && (
              <div className='text-xs text-muted-foreground'>
                Unlimited executions for your plan
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upgrade CTA */}
      {hasReachedLimit && (
        <Card className='border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-800/70'>
          <CardContent className=''>
            <div className='flex items-center gap-3 text-amber-800 dark:text-amber-200'>
              <AlertCircle className='h-5 w-5' />
              <div className='flex-1'>
                <p className='font-medium'>Upgrade Your Plan</p>
                <p className='text-sm text-amber-700 dark:text-amber-300'>
                  You&apos;ve reached your limits. Upgrade to add more portals,
                  team members, and executions.
                </p>
              </div>
              <Button variant='outline' onClick={handleUpgrade} size='sm'>
                <ArrowUp className='h-4 w-4 mr-2' />
                Contact Sales
              </Button>
              <Button onClick={handleUpgrade} size='sm'>
                <ArrowUp className='h-4 w-4 mr-2' />
                Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Usage Chart */}
      <UsageChart data={executionHistory} loading={historyLoading} />
    </div>
  );
}
