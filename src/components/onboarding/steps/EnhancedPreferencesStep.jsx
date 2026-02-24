'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Moon, Sun, Monitor, ArrowRight, ArrowLeft, Zap, Shield, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

const PRIORITY_FEATURES = [
  { 
    id: 'performance', 
    label: 'Performance Monitoring', 
    description: 'Track execution metrics and optimization',
    icon: Zap 
  },
  { 
    id: 'security', 
    label: 'Security Testing', 
    description: 'Automated security vulnerability scans',
    icon: Shield 
  },
  { 
    id: 'analytics', 
    label: 'Advanced Analytics', 
    description: 'Deep insights and reporting',
    icon: BarChart3 
  }
];

export default function EnhancedPreferencesStep({
  user,
  profile,
  data,
  onDataChange,
  onNext,
  onPrevious,
}) {
  const [preferences, setPreferences] = useState({
    theme: 'system',
    email_notifications: true,
    push_notifications: false,
    weekly_digest: true,
    product_updates: false,
    auto_save: true,
    show_tips: true,
    priority_features: [],
    ...data,
    ...profile?.preferences,
  });

  useEffect(() => {
    onDataChange(preferences);
  }, [preferences, onDataChange]);

  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const togglePriorityFeature = (featureId) => {
    setPreferences((prev) => ({
      ...prev,
      priority_features: prev.priority_features.includes(featureId)
        ? prev.priority_features.filter(id => id !== featureId)
        : [...prev.priority_features, featureId]
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='space-y-6 max-w-2xl mx-auto'
    >
      {/* Header */}
      <div className='text-center space-y-2'>
        <div className='mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center'>
          <Settings className='w-6 h-6 text-primary' />
        </div>
        <h3 className='text-2xl font-bold'>Personalize your experience</h3>
        <p className='text-muted-foreground'>
          Set your preferences and choose priority features
        </p>
      </div>

      {/* Priority Features */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Features</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {PRIORITY_FEATURES.map((feature) => (
            <div key={feature.id} className="flex items-start space-x-3">
              <Checkbox
                id={feature.id}
                checked={preferences.priority_features.includes(feature.id)}
                onCheckedChange={() => togglePriorityFeature(feature.id)}
              />
              <div className="flex-1 space-y-1">
                <Label 
                  htmlFor={feature.id} 
                  className="flex items-center gap-2 font-medium cursor-pointer"
                >
                  <feature.icon className="w-4 h-4" />
                  {feature.label}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Theme Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Monitor className='w-5 h-5' />
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label>Theme</Label>
            <RadioGroup
              value={preferences.theme}
              onValueChange={(value) => updatePreference('theme', value)}
            >
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='light' id='light' />
                <Label htmlFor='light' className='flex items-center gap-2'>
                  <Sun className='w-4 h-4' />
                  Light
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='dark' id='dark' />
                <Label htmlFor='dark' className='flex items-center gap-2'>
                  <Moon className='w-4 h-4' />
                  Dark
                </Label>
              </div>
              <div className='flex items-center space-x-2'>
                <RadioGroupItem value='system' id='system' />
                <Label htmlFor='system' className='flex items-center gap-2'>
                  <Monitor className='w-4 h-4' />
                  System
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Bell className='w-5 h-5' />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='email_notifications'>Email Notifications</Label>
              <p className='text-sm text-muted-foreground'>
                Receive important updates via email
              </p>
            </div>
            <Switch
              id='email_notifications'
              checked={preferences.email_notifications}
              onCheckedChange={(checked) =>
                updatePreference('email_notifications', checked)
              }
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='weekly_digest'>Weekly Digest</Label>
              <p className='text-sm text-muted-foreground'>
                Receive a summary of your activity each week
              </p>
            </div>
            <Switch
              id='weekly_digest'
              checked={preferences.weekly_digest}
              onCheckedChange={(checked) =>
                updatePreference('weekly_digest', checked)
              }
            />
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='product_updates'>Product Updates</Label>
              <p className='text-sm text-muted-foreground'>
                Get notified about new features and improvements
              </p>
            </div>
            <Switch
              id='product_updates'
              checked={preferences.product_updates}
              onCheckedChange={(checked) =>
                updatePreference('product_updates', checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className='flex items-center justify-between pt-4'>
        <Button variant='outline' onClick={onPrevious}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button onClick={onNext}>
          Continue
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}
