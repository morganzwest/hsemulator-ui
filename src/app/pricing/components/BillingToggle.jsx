"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'

export function BillingToggle({ onToggle }) {
  const [isAnnual, setIsAnnual] = useState(false)

  const handleToggle = () => {
    const newValue = !isAnnual
    setIsAnnual(newValue)
    onToggle(newValue)
  }

  return (
    <div className="flex items-center justify-center gap-4 mb-12">
      <span className={`text-sm font-medium transition-colors duration-300 ${
        !isAnnual ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        Monthly
      </span>
      
      <button
        onClick={handleToggle}
        className="relative inline-flex h-8 w-16 items-center rounded-full bg-muted transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        role="switch"
        aria-checked={isAnnual}
      >
        <motion.span
          className="inline-block h-6 w-6 transform rounded-full bg-primary shadow-lg transition-transform duration-300"
          animate={{ x: isAnnual ? 32 : 4 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      
      <span className={`text-sm font-medium transition-colors duration-300 ${
        isAnnual ? 'text-foreground' : 'text-muted-foreground'
      }`}>
        Annual
      </span>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isAnnual ? 1 : 0, 
          scale: isAnnual ? 1 : 0.8 
        }}
        transition={{ duration: 0.3 }}
        className="ml-2"
      >
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
          Save 20%
        </span>
      </motion.div>
    </div>
  )
}
