'use client';

import * as React from 'react';
import {
  AlertCircle,
  TrendingUp,
  ExternalLink,
  Briefcase,
  Users,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createPricingReferral } from '@/lib/account-limits';

export function LimitReachedDialog({
  open,
  onOpenChange,
  type,
  current,
  max,
  plan = 'Professional',
}) {
  const getTypeIcon = () => {
    switch (type) {
      case 'portal':
        return Briefcase;
      case 'user':
        return Users;
      default:
        return AlertCircle;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'portal':
        return 'Portals';
      case 'user':
        return 'Team Members';
      default:
        return 'Resources';
    }
  };

  const getRemaining = () => {
    return Math.max(0, max - current);
  };

  const getUsagePercent = () => {
    return max > 0 ? (current / max) * 100 : 0;
  };

  const isLimitReached = getRemaining() === 0;

  const getUpgradeMessage = () => {
    switch (type) {
      case 'portal':
        return 'Unlock unlimited portals and advanced features to scale your business.';
      case 'user':
        return 'Add more team members and collaborate more effectively.';
      default:
        return 'Upgrade your plan to access more features and increase your limits.';
    }
  };
  const getTitle = () => {
    switch (type) {
      case 'portal':
        return 'Portal Limit Reached';
      case 'user':
        return 'User Limit Reached';
      default:
        return 'Limit Reached';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'portal':
        return `You have created ${current} of ${max} portals available in your current plan.`;
      case 'user':
        return `You have added ${current} of ${max} users available in your current plan.`;
      default:
        return `You have reached the limit for ${type}.`;
    }
  };

  const getPlaceholderContent = () => {
    switch (type) {
      case 'portal':
        return 'Upgrade your plan to create more portals and unlock additional features for your team.';
      case 'user':
        return 'Upgrade your plan to add more team members and collaborate more effectively.';
      default:
        return 'Upgrade your plan to increase your limits and access more features.';
    }
  };

  const handleUsage = () => {
    // Handle usage button click - could navigate to usage dashboard
    console.log('Usage clicked for type:', type);
    onOpenChange(false);
  };

  const handleIncreaseLimits = () => {
    // Generate pricing URL with tracking parameters
    const pricingUrl = createPricingReferral({
      source: `${type}_limit`,
      operation: type,
      feature: `create_${type}`,
      location: 'limit_reached_dialog',
    });

    // Navigate to pricing page
    window.location.href = pricingUrl;
  };

  const renderTypeIcon = () => {
    const props = { className: 'size-4 text-muted-foreground' };
    switch (type) {
      case 'portal':
        return <Briefcase {...props} />;
      case 'user':
        return <Users {...props} />;
      default:
        return <AlertCircle {...props} />;
    }
  };
  const typeLabel = getTypeLabel();
  const remaining = getRemaining();
  const usagePercent = getUsagePercent();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertCircle className='size-5 text-orange-500' />
            {type === 'portal' ? 'Portal Limit Reached' : 'User Limit Reached'}
          </DialogTitle>
          <DialogDescription>
            You have reached the limit for {typeLabel.toLowerCase()} in your
            current plan.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {/* Usage Section */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                {renderTypeIcon()}
                <span className='text-sm font-medium'>{typeLabel}</span>
              </div>
              <span className='text-sm text-muted-foreground'>
                {current} / {max}
              </span>
            </div>
            <Progress value={usagePercent} className='h-2' />
            <div className='text-xs text-muted-foreground'>
              {remaining} {typeLabel.toLowerCase()}
              {remaining !== 1 ? 's' : ''} remaining
            </div>
          </div>

          {/* Upgrade CTA Section */}
          {isLimitReached && (
            <div className='rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4'>
              <div className='flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-2'>
                <AlertCircle className='size-4' />
                <span className='text-sm font-medium'>Upgrade Your Plan</span>
              </div>
              <p className='text-xs text-amber-700 dark:text-amber-300'>
                {getUpgradeMessage()}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={handleUsage}>
            <TrendingUp data-icon='inline-start' />
            View Usage
          </Button>
          <Button onClick={handleIncreaseLimits}>
            <ExternalLink data-icon='inline-start' />
            Upgrade Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
