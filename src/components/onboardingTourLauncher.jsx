'use client';

import { useEffect } from 'react';
import { createBasicsTour } from '~/lib/tours/basicsTour';
import { createPostCreateTour } from '~/lib/tours/postCreateTour';
import { getOnboardingStep } from '@/lib/tours/onboardingProgress';

export default function OnboardingTourLauncher() {
  useEffect(() => {
    // Prevent running if another tour already active
    if (window.__activeTour) return;

    /* -------------------------
       BASICS TOUR
    ------------------------- */

    if (!localStorage.getItem('basics_tour_seen')) {
      const basicsTour = createBasicsTour();

      window.__activeTour = basicsTour;

      setTimeout(() => {
        basicsTour.drive(getOnboardingStep());
      }, 1200);

      return;
    }

    /* -------------------------
       POST CREATE TOUR
    ------------------------- */

    const actionCreated = localStorage.getItem('action_created');
    const postSeen = localStorage.getItem('post_create_tour_seen');

    if (actionCreated && !postSeen) {
      const postTour = createPostCreateTour();

      window.__activeTour = postTour;

      const waitForEditor = setInterval(() => {
        if (document.querySelector('#editor-panel')) {
          postTour.drive();
          clearInterval(waitForEditor);

          localStorage.removeItem('action_created');
        }
      }, 120);

      return;
    }
  }, []);

  return null;
}
