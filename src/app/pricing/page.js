"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { BillingToggle } from "./components/BillingToggle"
import { PricingCard } from "./components/PricingCard"
import { TrustBadges } from "./components/TrustBadges"
import { Testimonials } from "./components/Testimonials"
import { DetailedComparison } from "./components/DetailedComparison"
import { AddOnsTable } from "./components/AddOnsTable"
import { pricingPlans, trustBadges, testimonials } from "./data/pricing-config"


function CTASection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-20"
    >
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Badge variant="secondary" className="mb-6">
          Limited Time Offer
        </Badge>
        <h1 className="mb-6 text-5xl font-bold tracking-tight">
          Start your free 14-day trial
        </h1>
        <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
          No credit card required. Full access to all features during your trial period.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/get-started">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="#pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </motion.section>
  )
}

function PricingSection() {
  const currentPlans = pricingPlans.monthly

  return (
    <section id="pricing" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 text-5xl font-bold tracking-tight">
            Choose your plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Start with our simple plans or compare detailed features below
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {currentPlans.map((plan, index) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function TrialCTA() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="py-20 bg-muted/20"
    >
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Badge variant="secondary" className="mb-6">
          No Risk Trial
        </Badge>
        <h2 className="mb-6 text-4xl font-bold tracking-tight">
          Ready to experience HSEmulator?
        </h2>
        <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto">
          Start your 14-day free trial today. No credit card required. Full access to all features.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/get-started">
              Start free trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="#detailed-pricing">See detailed comparison</Link>
          </Button>
        </div>
      </div>
    </motion.section>
  )
}

function DetailedPricingSection() {
  return (
    <section id="detailed-pricing" className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 text-5xl font-bold tracking-tight">
            Detailed feature comparison
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Compare every feature and limit to find the perfect plan for your needs
          </p>
        </motion.div>

        <DetailedComparison />
      </div>
    </section>
  )
}

function AddOnsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-6 text-5xl font-bold tracking-tight">
            Add-ons & Extras
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Enhance your plan with additional resources and features
          </p>
        </motion.div>

        <AddOnsTable />
      </div>
    </section>
  )
}

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center py-2">
            <video
              src="/wordmark.mp4"
              className="h-8 w-auto"
              autoPlay
              muted
              playsInline
              loop={false}
            />
          </div>
          <Button size="sm" asChild>
            <Link href="/get-started">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero CTA */}
      <CTASection />

      {/* Simple Pricing */}
      <PricingSection />

      {/* Trial CTA */}
      <TrialCTA />

      {/* Detailed Pricing */}
      <DetailedPricingSection />

      {/* Add-ons */}
      <AddOnsSection />

      {/* Testimonials */}
      <Testimonials testimonials={testimonials} />

      {/* Final CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="py-20 bg-muted/20"
      >
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="mb-6 text-4xl font-bold tracking-tight">
            Ready to transform your development workflow?
          </h2>
          <p className="mb-8 text-xl text-muted-foreground">
            Join thousands of developers who&apos;ve already accelerated their projects with HSEmulator.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/get-started">
                Start your free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/contact-sales">
                Talk to sales
              </Link>
            </Button>
          </div>

          {/* Additional trust elements */}
          <div className="mt-12 flex justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Cancel anytime
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
