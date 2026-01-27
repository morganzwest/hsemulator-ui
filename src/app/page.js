"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { CodePreview } from "@/components/code-preview"
import { useState } from "react"
import { Copy, Check } from "lucide-react"

export function InstallCommand() {
  const command = "winget install novocy.hsemulator"
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-1">
      <p className="text-sm font-medium text-muted-foreground">
        Get started locally
      </p>

      <Button
        type="button"
        variant="ghost"
        onClick={handleCopy}
        aria-label="Copy winget install command"
        className="
          group
          flex items-center gap-3
          px-4 py-2
          font-mono text-sm
          text-foreground/80
          transition
          hover:bg-muted/60
          focus-visible:ring-2
          focus-visible:ring-ring
        "
      >
        <span className="whitespace-nowrap text-xs">~ {command}</span>

        {copied ? (
          <Check
            className="h-4 w-4 text-green-500 transition"
            aria-hidden="true"
          />
        ) : (
          <Copy
            className="h-4 w-4 text-muted-foreground transition group-hover:text-foreground"
            aria-hidden="true"
          />
        )}
      </Button>
    </div>
  )
}


export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-sm font-semibold tracking-tight">
            HSEmulator
          </span>
          <Button size="sm" asChild>
            <Link href="/get-started">Get started</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-32 pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6">
            Hosted • Production-ready • Developer-first
          </Badge>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl leading-[1.4]"
          >
            Ship HubSpot custom code
            <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              without guesswork
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="mb-10 text-lg text-muted-foreground"
          >
            A hosted runtime for executing, validating, and promoting
            HubSpot custom code actions with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center gap-4"
          >
            <Button size="lg" asChild>
              <Link href="/get-started">
                Get started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4, ease: "easeOut" }}
          >
            <InstallCommand />
          </motion.div>
        </div>
      </section>

      {/* Code Preview (self-contained) */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <CodePreview />
      </motion.section>

      {/* Final CTA */}
      <section className="border-t bg-muted/30 py-20 mt-28">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-2xl font-semibold">
            Ready to ship with confidence?
          </h2>
          <p className="mb-6 text-muted-foreground">
            Create an account and start running your actions today.
          </p>
          <Button size="lg" asChild>
            <Link href="/get-started">
              Create your account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  )
}