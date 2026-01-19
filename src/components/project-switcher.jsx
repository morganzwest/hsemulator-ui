'use client'

import { ChevronDown } from "lucide-react"

export function ProjectSwitcher({ projects }) {
  return (
    <button className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
      <span>{projects[0].name}</span>
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </button>
  )
}
