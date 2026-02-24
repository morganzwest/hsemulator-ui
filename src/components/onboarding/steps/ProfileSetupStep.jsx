'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Code, Zap, Users, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import ProfilePreviewCard from '../components/ProfilePreviewCard';

const ROLES = [
  { value: 'developer', label: 'Developer', icon: Code },
  { value: 'admin', label: 'CRM Admin', icon: Zap },
  { value: 'cto', label: 'Leadership', icon: Users },
  { value: 'other', label: 'Other', icon: Settings },
];

export default function ProfileSetupStep({
  user,
  profile,
  data,
  onDataChange,
  onNext,
  onPrevious,
}) {
  const [fullName, setFullName] = useState(
    data?.full_name ||
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      '',
  );
  const [role, setRole] = useState(data?.role || profile?.role || 'developer');

  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url;
  const email = user?.email || profile?.email;

  useEffect(() => {
    onDataChange({
      full_name: fullName,
      role,
    });
  }, [fullName, role, onDataChange]);

  return (
    <div className='w-full min-h-screen flex items-center justify-center px-4'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='w-full max-w-4xl'
      >
        <div className='grid lg:grid-cols-2 gap-8 items-start'>
          {/* Left Column - Form */}
          <div className='space-y-8'>
            {/* Form Fields */}
            <motion.div
              className='space-y-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Full Name */}
              <div className='space-y-2'>
                <Label htmlFor='fullName'>Full Name</Label>
                <Input
                  id='fullName'
                  type='text'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder='Enter your full name'
                  className='h-12'
                  autoComplete='name'
                />
              </div>

              {/* Role Selection */}
              <div className='space-y-3'>
                <Label>Your Role</Label>
                <RadioGroup
                  value={role}
                  onValueChange={setRole}
                  className='grid grid-cols-2 gap-3'
                >
                  {ROLES.map((r) => {
                    const IconComponent = r.icon;
                    return (
                      <div key={r.value} className='relative'>
                        <RadioGroupItem
                          value={r.value}
                          id={r.value}
                          className='sr-only'
                        />
                        <Label
                          htmlFor={r.value}
                          className={`
                            flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
                            transition-all duration-200 hover:border-primary/50 hover:bg-accent/50
                            ${
                              role === r.value
                                ? 'border-primary bg-primary/10 shadow-sm'
                                : 'border-border bg-background'
                            }
                          `}
                        >
                          <IconComponent className='w-6 h-6 mb-2 text-primary' />
                          <span className='text-sm font-medium'>{r.label}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Preview */}
          <motion.div
            className='lg:sticky lg:top-8'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className=''>
              <ProfilePreviewCard
                fullName={fullName}
                email={email}
                role={role}
                avatarUrl={avatarUrl}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
