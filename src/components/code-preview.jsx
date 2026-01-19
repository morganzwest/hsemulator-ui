"use client"

import * as React from "react"
import { Terminal, Play, Check, Copy } from "lucide-react"
import { useTheme } from "next-themes"
import { useInView } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/* ----------------------------------------
   CopyButton (bug-fixed: timeout cleanup)
---------------------------------------- */

function CopyButton({ content, className, onCopy }) {
  const [copied, setCopied] = React.useState(false)
  const resetRef = React.useRef(null)

  React.useEffect(() => {
    return () => {
      if (resetRef.current) clearTimeout(resetRef.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      onCopy?.(content)

      if (resetRef.current) clearTimeout(resetRef.current)
      resetRef.current = setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={handleCopy}
      className={cn("h-8 w-8 p-0", className)}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
}

/* ----------------------------------------
   CodePreview (in-view + typing + live highlight + dynamic processedAt)
---------------------------------------- */

export function CodePreview({
  title = "action.js",
  lang = "javascript",
  code = `exports.main = async (event) => {
  const start = Date.now()

  const email = event.inputFields?.email
  if (!email) {
    throw new Error("Missing required field: email")
  }

  const domain = email.split("@")[1]

  const hash = crypto
    .createHash("sha256")
    .update(email)
    .digest("hex")
    .slice(0, 12)

  console.log("Processing contact", {
    email,
    domain,
    correlationId: event.correlationId,
  })

  const result = {
    id: \`contact_\${hash}\`,
    email,
    domain,
    processedAt: new Date().toISOString(),
    durationMs: Date.now() - start,
  }

  return result
}`,
  duration = 4,
  delay = 0,
  cursor = true,
  copyButton = false,
  themes = {
    light: "github-light",
    dark: "github-dark",
  },
  onCopy,
}) {
  const { resolvedTheme } = useTheme()

  const editorRef = React.useRef(null)
  const containerRef = React.useRef(null)

  // framer-motion: object ref + boolean
  const isInView = useInView(containerRef, { once: true, margin: "0px" })

  const [visibleCode, setVisibleCode] = React.useState("")
  const [highlightedCode, setHighlightedCode] = React.useState("")
  const [isDone, setIsDone] = React.useState(false)
  const [executionMeta, setExecutionMeta] = React.useState(null)

  const intervalRef = React.useRef(null)
  const timeoutRef = React.useRef(null)

  /* ----------------------------------------
     Typing animation (bug-fixed: clear interval on unmount + reruns)
  ---------------------------------------- */

  React.useEffect(() => {
    if (!code || !isInView) return

    // reset run state
    setVisibleCode("")
    setHighlightedCode("")
    setIsDone(false)
    setExecutionMeta(null)

    // cancel any previous run
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    timeoutRef.current = null
    intervalRef.current = null

    const chars = Array.from(code)
    let index = 0
    const totalMs = Math.max(0, duration) * 1000
    const intervalMs = totalMs / Math.max(chars.length, 1)

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (index < chars.length) {
          setVisibleCode(prev => prev + chars[index++])

          editorRef.current?.scrollTo({
            top: editorRef.current.scrollHeight,
            behavior: "smooth",
          })
        } else {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsDone(true)

          // capture completion metadata once (dynamic processedAt)
          setExecutionMeta({
            processedAt: new Date().toISOString(),
            durationMs: Math.floor(Math.random() * 25) + 25, // 25–49ms
            idSuffix: Math.random().toString(16).slice(2, 14), // pseudo hash for display
          })
        }
      }, intervalMs)
    }, Math.max(0, delay) * 1000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
      timeoutRef.current = null
      intervalRef.current = null
    }
  }, [code, duration, delay, isInView])

  /* ----------------------------------------
     Live Shiki highlight (bug-fixed: ignore stale async updates)
  ---------------------------------------- */

  React.useEffect(() => {
    if (!visibleCode || !isInView) return

    let cancelled = false

    const highlight = async () => {
      try {
        const { codeToHtml } = await import("shiki")

        const html = await codeToHtml(visibleCode, {
          lang,
          themes,
          defaultColor: resolvedTheme === "dark" ? "dark" : "light",
        })

        if (!cancelled) setHighlightedCode(html)
      } catch (err) {
        console.error(`Failed to highlight ${lang}`, err)
      }
    }

    highlight()
    return () => {
      cancelled = true
    }
  }, [visibleCode, lang, resolvedTheme, themes, isInView])

  const outputText = React.useMemo(() => {
    if (!executionMeta) return ""

    const id = `contact_${executionMeta.idSuffix}`
    const processedAt = executionMeta.processedAt
    const durationMs = executionMeta.durationMs

    return `{
  "id": "${id}",
  "email": "user@example.com",
  "domain": "example.com",
  "processedAt": "${processedAt}",
  "durationMs": ${durationMs}
}

Logs:
• Validated input payload
• Derived email domain
• Generated deterministic contact ID
• Returned structured response

Assertions passed
Snapshot updated
Execution budget: 50ms`
  }, [executionMeta])

  return (
    <div ref={containerRef} className="mx-auto mt-24 max-w-6xl px-6">
      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <Play className="h-3 w-3" />
            {title}
          </span>
          <span className="flex items-center gap-2">
            <Terminal className="h-3 w-3" />
            Runtime
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Code */}
          <div className="p-6">
            <div className="rounded-xl border bg-muted/40">
              <div className="flex items-center justify-between border-b bg-muted px-4 py-2">
                <div className="flex gap-2">
                  <div className="size-2 rounded-full bg-red-500" />
                  <div className="size-2 rounded-full bg-yellow-500" />
                  <div className="size-2 rounded-full bg-green-500" />
                </div>

                <div className="text-[13px] text-muted-foreground">{title}</div>

                {copyButton ? (
                  <CopyButton
                    content={code}
                    onCopy={onCopy}
                    className="-me-2 bg-transparent hover:bg-black/5 dark:hover:bg-white/10"
                  />
                ) : (
                  <div className="h-8 w-8" />
                )}
              </div>

              <div
                ref={editorRef}
                className="h-[360px] overflow-auto p-4 font-mono text-sm"
              >
                <div
                  className={cn(
                    "[&>pre,_&_code]:!bg-transparent [&>pre,_&_code]:border-none [&_code]:!text-[13px]",
                    cursor &&
                      !isDone &&
                      "[&_.line:last-of-type::after]:content-['|'] [&_.line:last-of-type::after]:animate-pulse"
                  )}
                  dangerouslySetInnerHTML={{ __html: highlightedCode }}
                />
              </div>
            </div>
          </div>

          {/* Output */}
          <div
            className={cn(
              "border-t bg-muted/40 p-6 text-sm transition-opacity duration-500 lg:border-l lg:border-t-0",
              isDone ? "opacity-100" : "opacity-0"
            )}
          >
            <pre className="whitespace-pre-wrap font-mono">
              <span className="text-green-600">✓ Execution succeeded</span>
              {"\n\n"}
              {outputText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
