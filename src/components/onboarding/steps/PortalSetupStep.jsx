'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import IconPicker from '../components/IconPicker';
import ColorPicker from '../components/ColorPicker';
import PortalPreviewCard from '../components/PortalPreviewCard';

export default function PortalSetupStep({
  user,
  profile,
  data,
  onDataChange,
  onNext,
  onPrevious,
}) {
  const [portalId, setPortalId] = useState(data?.portal_id || '');
  const [portalName, setPortalName] = useState(data?.portal_name || '');
  const [selectedIcon, setSelectedIcon] = useState(data?.icon || 'briefcase');
  const [selectedColor, setSelectedColor] = useState(data?.color || 'blue');

  useEffect(() => {
    const data = {
      portal_id: portalId,
      portal_name: portalName,
      icon: selectedIcon,
      color: selectedColor,
    };
    onDataChange(data);
  }, [portalId, portalName, selectedIcon, selectedColor, onDataChange]);

  const handlePortalIdChange = (value) => {
    // Only allow numbers, max 10 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 10);
    setPortalId(numericValue);
  };

  const canProceed = portalId.length > 0 && portalName.trim().length > 0;

  return (
    <div className='w-full min-h-screen bg-background flex items-center justify-center px-4'>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='w-full max-w-4xl'
      >
        <div className='grid lg:grid-cols-2 gap-8 items-start'>
          {/* Left Column - Form */}
          <div className='space-y-8'>
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-12 h-12 bg-primary rounded-xl flex items-center justify-center'>
                  <Globe className='w-6 h-6 text-primary-foreground' />
                </div>
                <div>
                  <h1 className='text-3xl font-bold'>
                    Set up your first portal
                  </h1>
                  <p className='text-muted-foreground'>
                    Connect your HubSpot workspace
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Form Fields */}
            <motion.div
              className='space-y-6'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Portal ID */}
              <div className='space-y-2'>
                <Label htmlFor='portalId'>Portal ID</Label>
                <Input
                  id='portalId'
                  type='text'
                  value={portalId}
                  onChange={(e) => handlePortalIdChange(e.target.value)}
                  placeholder='1234567890'
                  className='h-12 font-mono'
                  maxLength={10}
                />
                <p className='text-xs text-muted-foreground'>
                  Enter your HubSpot Portal ID (numbers only, max 10 digits)
                </p>
              </div>

              {/* Portal Name */}
              <div className='space-y-2'>
                <Label htmlFor='portalName'>Portal Name</Label>
                <Input
                  id='portalName'
                  type='text'
                  value={portalName}
                  onChange={(e) => setPortalName(e.target.value)}
                  placeholder='My Company Portal'
                  className='h-12'
                />
              </div>

              {/* Icon Selection */}
              <div className='space-y-3'>
                <Label>Choose Icon</Label>
                <IconPicker
                  selectedIcon={selectedIcon}
                  onIconChange={setSelectedIcon}
                />
              </div>

              {/* Color Selection */}
              <div className='space-y-3'>
                <Label>Choose Color</Label>
                <ColorPicker
                  selectedColor={selectedColor}
                  onColorChange={setSelectedColor}
                />
              </div>
            </motion.div>

            {/* Navigation */}
            <motion.div
              className='flex items-center justify-between pt-4'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Button variant='outline' onClick={onPrevious} className='px-8'>
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back
              </Button>
              <Button onClick={onNext} disabled={!canProceed} className='px-8'>
                Continue
                <ArrowRight className='w-4 h-4 ml-2' />
              </Button>
            </motion.div>
          </div>

          {/* Right Column - Preview */}
          <motion.div
            className='lg:sticky lg:top-8'
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-center'>
                Portal Preview
              </h3>
              <PortalPreviewCard
                portalId={portalId || '1234567890'}
                portalName={portalName || 'Portal Name'}
                icon={selectedIcon}
                color={selectedColor}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
