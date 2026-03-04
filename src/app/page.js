"use client"

import { useEffect } from "react"
import { createSupabaseBrowserClient } from "~/lib/supabase/browser"
import { PageHeader } from "../components/page-header"
import { AnimatedGrid } from "./home-components/animated-grid"
import { HeroSection } from "./sections/hero-section"
import { ProblemSection } from "./sections/problem-section"
import { SolutionSection } from "./sections/solution-section"
import { ImportSection } from "./sections/import-section"
import { BuildSection } from "./sections/build-section"
import { DeploySection } from "./sections/deploy-section"
import { VisibilitySection } from "./sections/visibility-section"
import { TeamsSection } from "./sections/teams-section"
import { PilotSection } from "./sections/pilot-section"
import { CTASection } from "./sections/cta-section"
import { Footer } from "./sections/footer"

export default function LandingPage() {
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const handleHashAuth = async () => {
      const hash = window.location.hash;

      if (!hash || !hash.includes('access_token')) return;

      const params = new URLSearchParams(hash.substring(1));

      const access_token = params.get('access_token');
      const refresh_token = params.get('refresh_token');

      if (!access_token || !refresh_token) return;

      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (!error) {
        window.location.replace('/dashboard');
      }
    };

    handleHashAuth();
  }, []);

  return (
    <main className="relative min-h-screen bg-background overflow-x-hidden">
      {/* Background effects */}
      <AnimatedGrid />

      {/* Header */}
      <PageHeader />

      {/* Sections */}
      <div className="relative z-10">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <ImportSection />
        <BuildSection />
        <DeploySection />
        <VisibilitySection />
        <TeamsSection />
        <PilotSection />
        <CTASection />
        <Footer />
      </div>
    </main>
  )
}