"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'

export function ViewToggle({ onViewChange }) {
  const [view, setView] = useState('simplified')

  const handleViewChange = (newView) => {
    setView(newView)
    onViewChange(newView)
  }

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      <button
        onClick={() => handleViewChange('simplified')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
          view === 'simplified'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        Simplified View
      </button>
      <button
        onClick={() => handleViewChange('detailed')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
          view === 'detailed'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
      >
        Detailed Comparison
      </button>
    </div>
  )
}
