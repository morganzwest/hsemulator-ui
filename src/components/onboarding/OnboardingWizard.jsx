'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  User,
  Code,
  Palette,
  Cog,
  Zap,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboarding } from '@/hooks/useOnboarding';
import ProfileSetupStep from './steps/ProfileSetupStep';
import AccountSetupStep from './steps/AccountSetupStep';
import PortalSetupStep from './steps/PortalSetupStep';
import EnhancedPreferencesStep from './steps/EnhancedPreferencesStep';
import EnhancedCompleteStep from './steps/EnhancedCompleteStep';
import React from 'react';

export default function OnboardingWizard({
  user,
  profile,
  initialStep = 0,
  source = 'manual',
  onComplete,
}) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setMousePosition({ x, y });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const {
    currentStep,
    loading,
    nextStep,
    previousStep,
    updateProfile,
    completeOnboardingFlow,
    getStepProgress,
    isStepCompleted,
    isCurrentStep,
    ONBOARDING_STEPS,
  } = useOnboarding(user, profile, initialStep, source);

  const getStepIcon = (step) => {
    const icons = {
      [ONBOARDING_STEPS.PROFILE]: User,
      [ONBOARDING_STEPS.ACCOUNT]: Code,
      [ONBOARDING_STEPS.PORTAL]: Cog,
      [ONBOARDING_STEPS.PREFERENCES]: Palette,
      [ONBOARDING_STEPS.COMPLETE]: CheckCircle,
    };
    return icons[step] || User;
  };

  const [stepData, setStepData] = useState({});

  const handleNext = async () => {
    // Save current step data before moving to next step
    if (currentStep === ONBOARDING_STEPS.PROFILE) {
      await updateProfile(stepData);
    } else if (currentStep === ONBOARDING_STEPS.ACCOUNT) {
      await updateProfile(stepData);
    } else if (currentStep === ONBOARDING_STEPS.PORTAL) {
      // Portal creation is handled differently - we need to create the portal
      // and then update the profile with the portal reference
      await updateProfile(stepData);
    } else if (currentStep === ONBOARDING_STEPS.PREFERENCES) {
      await updateProfile({ preferences: stepData });
    }

    if (currentStep === ONBOARDING_STEPS.COMPLETE) {
      await completeOnboardingFlow();
      onComplete();
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleStepDataChange = useCallback((data) => {
    setStepData((prev) => ({ ...prev, ...data }));
  }, []);

  const renderStep = () => {
    const stepProps = {
      user,
      profile,
      data: stepData,
      onDataChange: handleStepDataChange,
      onNext: handleNext,
      onPrevious: handlePrevious,
    };

    switch (currentStep) {
      case ONBOARDING_STEPS.PROFILE:
        return <ProfileSetupStep {...stepProps} />;
      case ONBOARDING_STEPS.ACCOUNT:
        return <AccountSetupStep {...stepProps} />;
      case ONBOARDING_STEPS.PORTAL:
        return <PortalSetupStep {...stepProps} />;
      case ONBOARDING_STEPS.PREFERENCES:
        return <EnhancedPreferencesStep {...stepProps} />;
      case ONBOARDING_STEPS.COMPLETE:
        return <EnhancedCompleteStep {...stepProps} />;
      default:
        return <ProfileSetupStep {...stepProps} />;
    }
  };

  const getStepTitle = () => {
    const titles = {
      [ONBOARDING_STEPS.PROFILE]: 'Set up your profile',
      [ONBOARDING_STEPS.ACCOUNT]: 'Configure your account',
      [ONBOARDING_STEPS.PORTAL]: 'Connect your portal',
      [ONBOARDING_STEPS.PREFERENCES]: 'Personalize your experience',
      [ONBOARDING_STEPS.COMPLETE]: "You're all set!",
    };
    return titles[currentStep] || 'Onboarding';
  };

  const getStepDescription = () => {
    const descriptions = {
      [ONBOARDING_STEPS.PROFILE]: 'Tell us a bit about yourself',
      [ONBOARDING_STEPS.ACCOUNT]: 'Configure your organization details',
      [ONBOARDING_STEPS.PORTAL]: 'Connect your HubSpot workspace',
      [ONBOARDING_STEPS.PREFERENCES]:
        'Set your preferences and priority features',
      [ONBOARDING_STEPS.COMPLETE]: 'Your workspace is ready to use',
    };
    return descriptions[currentStep] || '';
  };

  const canGoNext = () => {
    switch (currentStep) {
      case ONBOARDING_STEPS.PROFILE:
        return stepData.full_name && stepData.full_name.trim().length > 0;
      case ONBOARDING_STEPS.ACCOUNT:
        return (
          stepData.account_name &&
          stepData.account_name.trim().length > 0 &&
          stepData.industry &&
          stepData.account_type &&
          stepData.employee_range
        );
      case ONBOARDING_STEPS.PORTAL:
        return (
          stepData.portal_id &&
          stepData.portal_name &&
          stepData.portal_name.trim().length > 0 &&
          stepData.icon &&
          stepData.color
        );
      default:
        return true;
    }
  };

  const canGoPrevious = () => {
    return currentStep > ONBOARDING_STEPS.PROFILE;
  };

  const getNextButtonText = () => {
    if (currentStep === ONBOARDING_STEPS.COMPLETE) {
      return 'Go to Dashboard';
    }
    return 'Next Step';
  };

  return (
    <div
      ref={containerRef}
      className='w-full min-h-screen relative bg-black overflow-hidden'
    >
      {/* Purple hover effect background */}
      <div className='absolute inset-0 pointer-events-none'>
        <div
          className='absolute inset-0 opacity-40 pointer-events-none'
          style={{
            background: `radial-gradient(circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(139, 92, 246, 0.4) 0%, transparent 50%)`,
          }}
        />
        <motion.div
          className='absolute w-screen h-screen rounded-full pointer-events-none'
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            left: '20vw',
            top: '-10vh',
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.4, 0.15, 0.4],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className='absolute w-screen h-screen rounded-full pointer-events-none'
          style={{
            background:
              'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
            right: '10vw',
            bottom: '20vh',
          }}
          animate={{
            scale: [1, 0.8, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className='absolute w-screen h-screen rounded-full pointer-events-none'
          style={{
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
            left: '60vw',
            top: '40vh',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.08, 0.2],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className='absolute w-screen h-screen rounded-full pointer-events-none'
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.08) 0%, transparent 70%)',
            right: '10vw',
            top: '60vh',
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.05, 0.15],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Progress Bar */}
      <div className='absolute top-0 left-0 right-0 z-20 p-6'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center'>
                {React.createElement(getStepIcon(currentStep), {
                  className: 'w-5 h-5 text-primary',
                })}
              </div>
              <h2 className='text-2xl font-bold text-white'>
                {getStepTitle()}
              </h2>
            </div>
            <span className='text-sm text-gray-400'>
              Step {currentStep + 1} of {Object.keys(ONBOARDING_STEPS).length}
            </span>
          </div>
          <p className='text-gray-400 mb-6'>{getStepDescription()}</p>
          <Progress value={getStepProgress()} className='h-1' />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className='min-h-screen flex items-center justify-center px-4 w-full'
        >
          <div className='w-full max-w-4xl mx-auto'>{renderStep()}</div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className='fixed bottom-0 left-0 right-0 z-20 p-6'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <Button
            variant='outline'
            onClick={handlePrevious}
            disabled={!canGoPrevious() || loading}
            className='border-white/20 text-white hover:bg-white/10'
          >
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canGoNext() || loading}
            className='bg-white text-black hover:bg-gray-100'
          >
            {getNextButtonText()}
            {currentStep !== ONBOARDING_STEPS.COMPLETE && (
              <ChevronRight className='ml-2 h-4 w-4' />
            )}
          </Button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className='fixed bottom-8 left-0 right-0 z-20'>
        <div className='max-w-4xl mx-auto flex items-center justify-center space-x-2'>
          {Object.values(ONBOARDING_STEPS).map((step) => (
            <button
              key={step}
              onClick={() => step < currentStep && previousStep()}
              disabled={step >= currentStep}
              className={`w-2 h-2 rounded-full transition-all ${
                isCurrentStep(step)
                  ? 'bg-white w-8'
                  : isStepCompleted(step)
                    ? 'bg-white/60 cursor-pointer hover:bg-white/80'
                    : 'bg-white/20 cursor-not-allowed'
              }`}
              aria-label={`Go to step ${step + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
