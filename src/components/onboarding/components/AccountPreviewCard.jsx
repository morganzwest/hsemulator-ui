'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building,
  Briefcase,
  Users,
  Rocket,
  Building2,
  Handshake,
  TrendingUp,
  Factory,
  Globe,
  Target,
} from 'lucide-react';

const ACCOUNT_TYPE_ICONS = {
  startup: Rocket,
  sme: Building,
  'mid-market': Building2,
  enterprise: Factory,
  'crm-partner': Handshake,
};

const ACCOUNT_TYPE_LABELS = {
  startup: 'Startup',
  sme: 'SME',
  'mid-market': 'Mid-Market',
  enterprise: 'Enterprise',
  'crm-partner': 'CRM Partner',
};

const COMPANY_SIZE_ICONS = {
  '1-10': Users,
  '11-25': Users,
  '26-50': Users,
  '50-100': Users,
  '100-250': Users,
  '250+': Users,
};

const COMPANY_SIZE_LABELS = {
  '1-10': '1-10 employees',
  '11-25': '11-25 employees',
  '26-50': '26-50 employees',
  '50-100': '50-100 employees',
  '100-250': '100-250 employees',
  '250+': '250+ employees',
};

const COMPANY_SIZE_COLORS = {
  '1-10': 'bg-green-900/50 text-green-300 border-green-700',
  '11-25': 'bg-blue-900/50 text-blue-300 border-blue-700',
  '26-50': 'bg-purple-900/50 text-purple-300 border-purple-700',
  '50-100': 'bg-orange-900/50 text-orange-300 border-orange-700',
  '100-250': 'bg-pink-900/50 text-pink-300 border-pink-700',
  '250+': 'bg-red-900/50 text-red-300 border-red-700',
};

export default function AccountPreviewCard({
  accountName,
  industry,
  accountType,
  employeeRange,
}) {
  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className='w-full max-w-sm bg-linear-to-br  shadow-lg hover:shadow-xl transition-all duration-300 bg-white/5'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div className='w-14 h-14 rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center text-sm font-bold shadow-lg'>
              {getInitials(accountName)}
            </div>
            <div className='flex-1 min-w-0'>
              <h3 className='font-bold text-base truncate text-white'>
                {accountName || 'Account Name'}
              </h3>
              {industry && (
                <div className='flex items-center text-xs text-gray-400 mt-1'>
                  <Globe className='w-3 h-3 mr-1 shrink-0' />
                  <span className='truncate'>{industry}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className='pt-0 space-y-4'>
        {/* Account Type Badge */}
        {accountType && (
          <div className='flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10'>
            <div className='flex items-center space-x-2'>
              {ACCOUNT_TYPE_ICONS[accountType] &&
                React.createElement(ACCOUNT_TYPE_ICONS[accountType], {
                  className: 'w-4 h-4 text-primary',
                })}
              <span className='text-sm font-medium text-gray-300'>Type</span>
            </div>
            <Badge
              variant='outline'
              className='bg-primary/20 text-primary border-primary/30 font-medium'
            >
              {ACCOUNT_TYPE_LABELS[accountType] || accountType}
            </Badge>
          </div>
        )}

        {/* Company Size Badge */}
        {employeeRange && (
          <div className='flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10'>
            <div className='flex items-center space-x-2'>
              <Users className='w-4 h-4 text-gray-400' />
              <span className='text-sm font-medium text-gray-300'>Size</span>
            </div>
            <Badge
              className={`font-medium border ${COMPANY_SIZE_COLORS[employeeRange] || 'bg-gray-700 text-gray-300 border-gray-600'}`}
            >
              {COMPANY_SIZE_LABELS[employeeRange] || employeeRange}
            </Badge>
          </div>
        )}

        {/* Status Footer */}
        <div className='pt-3 border-t border-white/10'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-gray-500'>Account Setup</span>
            <div className='flex items-center space-x-1 text-green-300'>
              <Target className='w-3 h-3' />
              <span className='font-medium'>Ready</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
