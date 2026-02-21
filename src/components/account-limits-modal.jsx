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
import { Users, Briefcase, ArrowUp } from 'lucide-react';

export function AccountLimitsModal({ open, onOpenChange, limits }) {
  if (!limits) return null;

  const portalUsagePercent = limits.max_portals > 0 ? (limits.actual_portals / limits.max_portals) * 100 : 0;
  const userUsagePercent = limits.max_users > 0 ? (limits.actual_users / limits.max_users) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Account Limits
          </DialogTitle>
          <DialogDescription>
            Current usage and limits for your {limits.plan} plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Badge */}
          <div className="flex justify-center">
            <Badge variant={limits.plan === 'pro' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
              {limits.plan.charAt(0).toUpperCase() + limits.plan.slice(1)} Plan
            </Badge>
          </div>

          {/* Portals Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Portals</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {limits.actual_portals} / {limits.max_portals}
              </span>
            </div>
            <Progress value={portalUsagePercent} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {limits.portals_remaining} portal{limits.portals_remaining !== 1 ? 's' : ''} remaining
            </div>
          </div>

          {/* Users Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Team Members</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {limits.actual_users} / {limits.max_users}
              </span>
            </div>
            <Progress value={userUsagePercent} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {limits.users_remaining} member{limits.users_remaining !== 1 ? 's' : ''} remaining
            </div>
          </div>

          {/* Upgrade CTA */}
          {(limits.portals_remaining === 0 || limits.users_remaining === 0) && (
            <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800 p-4">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm font-medium">Upgrade Your Plan</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                You've reached your limits. Upgrade to add more portals and team members.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {(limits.portals_remaining === 0 || limits.users_remaining === 0) && (
            <Button onClick={() => window.location.href = '/pricing'}>
              Upgrade Plan
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
