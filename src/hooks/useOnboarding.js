'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowserClient } from '~/lib/supabase/browser';
import { toast } from 'sonner';
import {
  getOnboardingStatus,
  setOnboardingStatus,
  getOnboardingStep,
  setOnboardingStep,
  getOnboardingSource,
  setOnboardingSource,
  initializeOnboarding,
  completeOnboarding,
  ONBOARDING_STATUS,
  ONBOARDING_STEPS,
  backupProfileData,
  getBackedUpProfileData,
  markDatabaseOperationsFailed,
  hasDatabaseOperationsFailed,
  clearDatabaseFailureFlag,
  clearBackedUpProfileData
} from '@/lib/onboarding/onboardingHelpers';

export function useOnboarding(user, profile, initialStep = 0, source = 'manual') {
  const supabase = createSupabaseBrowserClient();

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(profile);

  const syncWithDatabase = useCallback(async () => {
    if (!user || !profileData) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_status: getOnboardingStatus() || ONBOARDING_STATUS.PENDING,
          onboarding_step: getOnboardingStep()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Database sync error:', error);
      }
    } catch (error) {
      console.error('Database sync error:', error);
    }
  }, [user, profileData, getOnboardingStatus, getOnboardingStep]);

  const initializeOnboardingState = useCallback(async () => {
    const localStatus = getOnboardingStatus();
    const localStep = getOnboardingStep();
    const localSource = getOnboardingSource();

    // Check for backed up profile data if database operations failed
    if (hasDatabaseOperationsFailed() && !profileData) {
      const backedUpData = getBackedUpProfileData();
      if (backedUpData) {
        console.log('Loading profile data from local storage backup');
        setProfileData(backedUpData);
      }
    }

    // If no local state, initialize with props
    if (!localStatus) {
      initializeOnboarding(source, initialStep);
      setCurrentStep(initialStep);
    } else {
      setCurrentStep(localStep);
    }

    // Sync with database if profile exists and database operations haven't failed
    if (profileData && !hasDatabaseOperationsFailed()) {
      await syncWithDatabase();
    }
  }, [source, initialStep, profileData]);

  // Initialize onboarding state
  useEffect(() => {
    if (user && !profileData) {
      initializeOnboardingState();
    }
  }, [user, profileData, initializeOnboardingState]);

  const nextStep = useCallback(async () => {
    if (currentStep >= ONBOARDING_STEPS.COMPLETE) return;

    const nextStepNumber = currentStep + 1;
    setCurrentStep(nextStepNumber);
    setOnboardingStep(nextStepNumber);

    // Update database
    if (user) {
      await updateProfileInDatabase({
        onboarding_step: nextStepNumber,
        onboarding_status: ONBOARDING_STATUS.IN_PROGRESS
      });
    }
  }, [currentStep, user]);

  const previousStep = useCallback(async () => {
    if (currentStep <= ONBOARDING_STEPS.PROFILE) return;

    const prevStepNumber = currentStep - 1;
    setCurrentStep(prevStepNumber);
    setOnboardingStep(prevStepNumber);

    // Update database
    if (user) {
      await updateProfileInDatabase({
        onboarding_step: prevStepNumber,
        onboarding_status: ONBOARDING_STATUS.IN_PROGRESS
      });
    }
  }, [currentStep, user]);

  const goToStep = useCallback(async (step) => {
    if (step < ONBOARDING_STEPS.PROFILE || step > ONBOARDING_STEPS.COMPLETE) return;

    setCurrentStep(step);
    setOnboardingStep(step);

    // Update database
    if (user) {
      await updateProfileInDatabase({
        onboarding_step: step,
        onboarding_status: ONBOARDING_STATUS.IN_PROGRESS
      });
    }
  }, [user]);

  const createOrUpdateAccount = async (accountData) => {
    if (!user) return null;

    // Check if database operations have previously failed
    if (hasDatabaseOperationsFailed()) {
      console.log('Database operations previously failed, using local storage fallback for account');
      backupProfileData({ ...profileData, account: accountData });
      return { ...accountData, id: 'fallback-id' };
    }

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Account creation error: Missing Supabase environment variables');
      toast.error('Database configuration error');
      markDatabaseOperationsFailed();
      backupProfileData({ ...profileData, account: accountData });
      return { ...accountData, id: 'fallback-id' };
    }

    try {
      setLoading(true);
      console.log('Creating/updating account with data:', accountData);

      // First, try to find an existing account with the same name
      const { data: existingAccounts, error: searchError } = await supabase
        .from('accounts')
        .select('id')
        .eq('name', accountData.name)
        .limit(1);

      if (searchError) {
        console.error('Error searching for existing account:', searchError);
        markDatabaseOperationsFailed();
        backupProfileData({ ...profileData, account: accountData });
        return { ...accountData, id: 'fallback-id' };
      }

      let accountResult;

      if (existingAccounts && existingAccounts.length > 0) {
        // Update existing account
        const { data, error } = await supabase
          .from('accounts')
          .update(accountData)
          .eq('id', existingAccounts[0].id)
          .select()
          .single();

        if (error) {
          console.error('Account update error:', error);
          markDatabaseOperationsFailed();
          backupProfileData({ ...profileData, account: accountData });
          return { ...accountData, id: 'fallback-id' };
        }
        accountResult = data;
      } else {
        // Create new account
        const { data, error } = await supabase
          .from('accounts')
          .insert(accountData)
          .select()
          .single();

        if (error) {
          console.error('Account creation error:', error);
          markDatabaseOperationsFailed();
          backupProfileData({ ...profileData, account: accountData });
          return { ...accountData, id: 'fallback-id' };
        }
        accountResult = data;
      }

      console.log('Account created/updated successfully:', accountResult);

      // Clear database failure flag on successful operation
      if (hasDatabaseOperationsFailed()) {
        clearDatabaseFailureFlag();
        clearBackedUpProfileData();
      }

      return accountResult;
    } catch (error) {
      console.error('Account creation error (unexpected):', error);
      toast.error('An unexpected error occurred while creating your account');
      markDatabaseOperationsFailed();
      backupProfileData({ ...profileData, account: accountData });
      return { ...accountData, id: 'fallback-id' };
    } finally {
      setLoading(false);
    }
  };

  const createPortal = async (portalData) => {
    if (!user) return null;

    // Check if database operations have previously failed
    if (hasDatabaseOperationsFailed()) {
      console.log('Database operations previously failed, using local storage fallback for portal');
      backupProfileData({ ...profileData, portal: portalData });
      return { ...portalData, id: 'fallback-id' };
    }

    try {
      setLoading(true);
      console.log('Creating portal with data:', portalData);

      const { data, error } = await supabase
        .from('portals')
        .insert({
          id: parseInt(portalData.portal_id),
          name: portalData.portal_name,
          icon: portalData.icon,
          color: portalData.color,
          account_id: profileData?.account_id
        })
        .select()
        .single();

      if (error) {
        console.error('Portal creation error:', error);
        markDatabaseOperationsFailed();
        backupProfileData({ ...profileData, portal: portalData });
        return { ...portalData, id: 'fallback-id' };
      }

      console.log('Portal created successfully:', data);

      // Clear database failure flag on successful operation
      if (hasDatabaseOperationsFailed()) {
        clearDatabaseFailureFlag();
        clearBackedUpProfileData();
      }

      return data;
    } catch (error) {
      console.error('Portal creation error (unexpected):', error);
      toast.error('An unexpected error occurred while creating your portal');
      markDatabaseOperationsFailed();
      backupProfileData({ ...profileData, portal: portalData });
      return { ...portalData, id: 'fallback-id' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfileInDatabase = async (updates) => {
    if (!user) {
      console.error('Profile update error: No user provided');
      return null;
    }

    // Check if database operations have previously failed
    if (hasDatabaseOperationsFailed()) {
      console.log('Database operations previously failed, using local storage fallback');
      backupProfileData({ ...profileData, ...updates });
      return { ...profileData, ...updates };
    }

    // Validate environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Profile update error: Missing Supabase environment variables');
      toast.error('Database configuration error');
      markDatabaseOperationsFailed();
      backupProfileData({ ...profileData, ...updates });
      return { ...profileData, ...updates };
    }

    try {
      setLoading(true);
      console.log('Attempting to update profile with data:', updates);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Profile update error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          updates: updates,
          userId: user.id
        });

        // Check for specific error types
        if (error.code === 'PGRST116') {
          toast.error('Profile table not found. Using local storage as fallback.');
          markDatabaseOperationsFailed();
        } else if (error.code === '42501') {
          toast.error('Permission denied. Using local storage as fallback.');
          markDatabaseOperationsFailed();
        } else if (error.code === '23502') {
          toast.error('Required field missing in profile.');
          return null;
        } else {
          toast.error(`Failed to update profile: ${error.message || 'Unknown error'}`);
          markDatabaseOperationsFailed();
        }

        // Fallback to local storage
        backupProfileData({ ...profileData, ...updates });
        return { ...profileData, ...updates };
      }

      console.log('Profile updated successfully:', data);
      setProfileData(data);

      // Clear database failure flag on successful operation
      if (hasDatabaseOperationsFailed()) {
        clearDatabaseFailureFlag();
        clearBackedUpProfileData();
      }

      return data;
    } catch (error) {
      console.error('Profile update error (unexpected):', {
        message: error.message,
        stack: error.stack,
        updates: updates,
        userId: user.id
      });
      toast.error('An unexpected error occurred while updating your profile');
      markDatabaseOperationsFailed();
      backupProfileData({ ...profileData, ...updates });
      return { ...profileData, ...updates };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = useCallback(async (profileUpdates) => {
    const updates = {
      ...profileUpdates,
      onboarding_step: currentStep,
      onboarding_status: ONBOARDING_STATUS.IN_PROGRESS
    };

    // Handle account creation/update if account data is provided
    if (profileUpdates.account_name || profileUpdates.industry || profileUpdates.account_type || profileUpdates.employee_range) {
      const accountData = {
        name: profileUpdates.account_name,
        industry: profileUpdates.industry,
        account_type: profileUpdates.account_type,
        employee_range: profileUpdates.employee_range
      };

      // Remove account fields from profile updates
      const { account_name, industry, account_type, employee_range, ...profileOnlyUpdates } = profileUpdates;

      const account = await createOrUpdateAccount(accountData);
      if (account && account.id !== 'fallback-id') {
        profileOnlyUpdates.account_id = account.id;
      }

      return await updateProfileInDatabase(profileOnlyUpdates);
    }

    // Handle portal creation if portal data is provided
    if (profileUpdates.portal_id || profileUpdates.portal_name || profileUpdates.icon || profileUpdates.color) {
      const portalData = {
        portal_id: profileUpdates.portal_id,
        portal_name: profileUpdates.portal_name,
        icon: profileUpdates.icon,
        color: profileUpdates.color
      };

      // Remove portal fields from profile updates
      const { portal_id, portal_name, icon, color, ...profileOnlyUpdates } = profileUpdates;

      await createPortal(portalData);
      return await updateProfileInDatabase(profileOnlyUpdates);
    }

    return await updateProfileInDatabase(updates);
  }, [currentStep, user, profileData, createOrUpdateAccount, createPortal, updateProfileInDatabase]);

  const completeOnboardingFlow = useCallback(async () => {
    completeOnboarding();

    if (user) {
      await updateProfileInDatabase({
        onboarding_status: ONBOARDING_STATUS.COMPLETED,
        onboarding_step: ONBOARDING_STEPS.COMPLETE
      });
    }
  }, [user]);

  const resetOnboardingFlow = useCallback(async () => {
    setCurrentStep(ONBOARDING_STEPS.PROFILE);
    initializeOnboarding('manual', ONBOARDING_STEPS.PROFILE);

    if (user) {
      await updateProfileInDatabase({
        onboarding_status: ONBOARDING_STATUS.PENDING,
        onboarding_step: ONBOARDING_STEPS.PROFILE
      });
    }
  }, [user]);

  const getStepProgress = useCallback(() => {
    const totalSteps = Object.keys(ONBOARDING_STEPS).length;
    return ((currentStep + 1) / totalSteps) * 100;
  }, [currentStep]);

  const isStepCompleted = useCallback((step) => {
    return currentStep > step;
  }, [currentStep]);

  const isCurrentStep = useCallback((step) => {
    return currentStep === step;
  }, [currentStep]);

  return {
    // State
    currentStep,
    loading,
    profileData,

    // Actions
    nextStep,
    previousStep,
    goToStep,
    updateProfile,
    completeOnboardingFlow,
    resetOnboardingFlow,

    // Helpers
    getStepProgress,
    isStepCompleted,
    isCurrentStep,

    // Constants
    ONBOARDING_STEPS,
    ONBOARDING_STATUS
  };
}
