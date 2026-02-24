'use client';

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Code,
  Palette,
  Cog,
  Zap,
  BarChart3,
  Users,
  Briefcase,
  Settings,
} from 'lucide-react';

const ROLE_ICONS = {
  developer: Code,
  admin: Zap,
  cto: Users,
  other: Settings,
};

const ROLE_LABELS = {
  developer: 'Developer',
  admin: 'CRM Admin',
  cto: 'Leadership',
  other: 'Other',
};

export default function ProfilePreviewCard({
  fullName,
  email,
  role,
  avatarUrl,
}) {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className='w-full max-w-sm bg-white/5 shadow hover:shadow-xl transition '>
      <CardContent className=''>
        <div className='flex items-center space-x-3'>
          {/* Avatar */}
          <div className='shrink-0'>
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt='Profile'
                width={48}
                height={48}
                className='rounded-full object-cover border-2 border-border'
              />
            ) : (
              <div className='w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold border-2 border-border'>
                {getInitials(fullName)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className='flex-1 min-w-0'>
            <h3 className='font-semibold text-sm truncate'>
              {fullName || 'Your Name'}
            </h3>
            <div className='flex items-center text-xs text-muted-foreground mt-1'>
              <Mail className='w-3 h-3 mr-1 shrink-0' />
              <span className='truncate'>{email || 'email@example.com'}</span>
            </div>
            <Badge
              variant='outline'
              className='mt-2 inline-flex items-center gap-1 text-xs'
            >
              {ROLE_ICONS[role] &&
                React.createElement(ROLE_ICONS[role], { className: 'w-3 h-3' })}
              <span>{ROLE_LABELS[role] || 'Role'}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
