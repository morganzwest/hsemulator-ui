'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseBrowserClient } from '~/lib/supabase/browser';
import { toast } from 'sonner';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import {
  getOnboardingStatus,
  setOnboardingStatus,
} from '@/lib/onboarding/onboardingHelpers';

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    initializeOnboarding();
  }, []); // Remove initializeOnboarding from dependencies

  const initializeOnboarding = async () => {
    try {
      // 1. Check authentication
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        // Not authenticated, redirect to login
        router.push('/login');
        return;
      }

      setUser(authUser);

      // 2. Check localStorage for onboarding status
      const localStatus = getOnboardingStatus();

      // 3. Check database for profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // Error other than "not found"
        console.error('Profile fetch error:', profileError);
        toast.error('Failed to load profile data');
        return;
      }

      setProfile(profileData);

      // 4. Determine routing logic
      const hasProfile = !!profileData;
      const onboardingCompleted =
        profileData?.onboarding_status === 'completed' ||
        localStatus === 'completed';

      if (hasProfile && onboardingCompleted) {
        // User has profile and completed onboarding, send to dashboard
        router.push('/dashboard');
        return;
      }

      // User needs onboarding
      setShouldShowOnboarding(true);

      // If no profile exists, create one
      if (!hasProfile) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: authUser.id,
          onboarding_status: 'pending',
          onboarding_step: 0,
          display_name:
            authUser.user_metadata?.full_name ||
            authUser.email?.split('@')[0] ||
            'User',
          preferences: {},
        });

        if (insertError) {
          console.error('Profile creation error:', insertError);
          toast.error('Failed to create profile');
        }
      }
    } catch (error) {
      console.error('Onboarding initialization error:', error);
      toast.error('Failed to initialize onboarding');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!shouldShowOnboarding) {
    return null; // Will redirect
  }

  const initialStep = searchParams.get('step')
    ? parseInt(searchParams.get('step'))
    : 0;
  const source = searchParams.get('source') || 'manual';

  return (
    <div className='min-h-screen bg-black'>
      <OnboardingWizard
        user={user}
        profile={profile}
        initialStep={initialStep}
        source={source}
        onComplete={() => {
          setOnboardingStatus('completed');
          router.push('/dashboard');
        }}
      />
    </div>
  );
}
