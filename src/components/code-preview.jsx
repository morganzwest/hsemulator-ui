"use client"

import * as React from "react"
import { Terminal, Play, Check, Copy } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function CopyButton({ content, className }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn("h-8 w-8 p-0", className)}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  )
}

export function CodePreview({
  title = "action.js",
  lang = "javascript",
  code = `exports.main = async (event) => {
  if (!event.inputFields.email) {
    throw new Error("Missing email")
  }

  return {
    status: "ok",
    email: event.inputFields.email,
  }
}`,
  duration = 4,
  delay = 0,
  cursor = true,
  copyButton = false,
}) {
  const { resolvedTheme } = useTheme()
  const runIdRef = React.useRef(0)

  const editorRef = React.useRef(null)
  const intervalRef = React.useRef(null)
  const timeoutRef = React.useRef(null)

  const [visibleCode, setVisibleCode] = React.useState("")
  const [highlightedHtml, setHighlightedHtml] = React.useState("")
  const [doneTyping, setDoneTyping] = React.useState(false)
  const [showOutput, setShowOutput] = React.useState(false)

  // Typing animation (single writer, run-safe)
  React.useEffect(() => {
    if (!code?.length) return

    runIdRef.current += 1
    const runId = runIdRef.current

    setVisibleCode("")
    setHighlightedHtml("")
    setDoneTyping(false)
    setShowOutput(false)

    const chars = Array.from(code)
    let index = 0
    const intervalMs = (duration * 1000) / Math.max(chars.length, 1)

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (runIdRef.current !== runId) {
          clearInterval(intervalRef.current)
          return
        }

        if (index < chars.length) {
          setVisibleCode(prev => prev + chars[index++])
          editorRef.current?.scrollTo({
            top: editorRef.current.scrollHeight,
          })
        } else {
          clearInterval(intervalRef.current)
          setDoneTyping(true)
          setShowOutput(true)
        }
      }, intervalMs)
    }, delay * 1000)

    return () => {
      clearTimeout(timeoutRef.current)
      clearInterval(intervalRef.current)
      runIdRef.current += 1
    }
  }, [code, duration, delay])

  // Highlight once typing is complete
  React.useEffect(() => {
    if (!doneTyping) return

    let cancelled = false

    const highlight = async () => {
      const { codeToHtml } = await import("shiki")
      const html = await codeToHtml(code, {
        lang,
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: resolvedTheme === "dark" ? "dark" : "light",
      })
      if (!cancelled) setHighlightedHtml(html)
    }

    highlight()
    return () => {
      cancelled = true
    }
  }, [doneTyping, code, lang, resolvedTheme])

  return (
    <div className="mx-auto mt-24 max-w-6xl px-6">
      <div className="overflow-hidden rounded-xl border bg-background shadow-sm">
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
                {copyButton ? <CopyButton content={code} /> : <div className="h-8 w-8" />}
              </div>

              <div ref={editorRef} className="h-[360px] overflow-auto p-4 font-mono text-sm">
                {!doneTyping ? (
                  <pre className="whitespace-pre-wrap [font-variant-ligatures:none]">
                    {visibleCode}
                    {cursor && <span className="animate-pulse">|</span>}
                  </pre>
                ) : (
                  <div
                    className="[&>pre,_&_code]:!bg-transparent [&>pre,_&_code]:border-none"
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Output */}
          <div
            className={cn(
              "border-t bg-muted/40 p-6 text-sm transition-opacity duration-500 lg:border-l lg:border-t-0",
              showOutput ? "opacity-100" : "opacity-0"
            )}
          >
            <pre className="whitespace-pre-wrap font-mono">
<span className="text-green-600">✓ Execution succeeded</span>

{`{
  "status": "ok",
  "email": "user@example.com"
}

Assertions passed
Snapshot saved
Execution time: 42ms`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
