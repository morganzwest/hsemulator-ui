"use client";
import { Check, Copy } from "lucide-react"
import { useInView } from "motion/react";
import { useTheme } from "next-themes"
import * as React from "react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

function CopyButton({
  content,
  size = "default",
  variant = "default",
  className,
  onCopy
}) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      onCopy?.(content)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Button
      className={cn("h-8 w-8 p-0", className)}
      onClick={handleCopy}
      size={size}
      variant={variant}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}


function CodeEditor({
  children: code,
  lang,
  themes = { light: "github-light", dark: "github-dark" },
  duration = 5,
  delay = 0,
  className,
  header = true,
  dots = true,
  icon,
  cursor = false,
  inView = false,
  inViewMargin = "0px",
  inViewOnce = true,
  copyButton = false,
  writing = true,
  title,
  onDone,          // ✅ add back
  onCopy,
  ...props
}) {
  const { resolvedTheme } = useTheme()

  const containerRef = React.useRef(null) // ✅ observe the container
  const editorRef = React.useRef(null)

  const hasStartedRef = React.useRef(false)
  const intervalRef = React.useRef(null)
  const timeoutRef = React.useRef(null)

  const [visibleCode, setVisibleCode] = React.useState("")
  const [highlightedCode, setHighlightedCode] = React.useState("")
  const [isDone, setIsDone] = React.useState(false)

  const inViewResult = useInView(containerRef, {
    once: inViewOnce,
    margin: inViewMargin,
  })
  const isInView = !inView || inViewResult

  // ✅ reset start flag whenever code changes or when we can start again
  React.useEffect(() => {
    hasStartedRef.current = false
    setVisibleCode("")
    setHighlightedCode("")
    setIsDone(false)

    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }, [code, writing])

  React.useEffect(() => {
    if (!isInView) return
    if (!code?.length) return

    // If writing disabled: show full code immediately
    if (!writing) {
      setVisibleCode(code)
      setIsDone(true)
      onDone?.()
      return
    }

    if (hasStartedRef.current) return
    hasStartedRef.current = true

    const characters = Array.from(code)
    let index = 0
    const intervalMs = (duration * 1000) / Math.max(characters.length, 1)

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (index < characters.length) {
          setVisibleCode(prev => prev + characters[index++])
          editorRef.current?.scrollTo({
            top: editorRef.current.scrollHeight,
          })
        } else {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsDone(true)
          onDone?.()
        }
      }, intervalMs)
    }, delay * 1000)

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isInView, code, writing, duration, delay, onDone])

  React.useEffect(() => {
    if (!isDone) return

    const highlight = async () => {
      const { codeToHtml } = await import("shiki")
      const html = await codeToHtml(code, {
        lang,
        themes,
        defaultColor: resolvedTheme === "dark" ? "dark" : "light",
      })
      setHighlightedCode(html)
    }

    highlight()
  }, [isDone, code, lang, themes, resolvedTheme])

  return (
    <div
      ref={containerRef}  // ✅ move inView ref here
      className={cn(
        "relative bg-muted/50 w-[600px] h-[400px] border border-border overflow-hidden flex flex-col rounded-xl",
        className
      )}
      {...props}
    >
      {/* header unchanged... */}

      <div
        ref={editorRef}
        className="flex-1 overflow-auto p-4 font-mono text-sm"
      >
        {!isDone ? (
          <pre className="whitespace-pre-wrap text-[13px] font-mono [font-variant-ligatures:none]">
            {visibleCode}
            {cursor && <span className="animate-pulse">|</span>}
          </pre>
        ) : (
          <div
            className="[&>pre,_&_code]:!bg-transparent"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        )}
      </div>
    </div>
  )
}


export { CodeEditor, CopyButton }
