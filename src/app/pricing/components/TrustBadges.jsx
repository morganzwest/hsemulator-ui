"use client"

import { motion } from 'framer-motion'

export function TrustBadges({ badges }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="py-16 bg-muted/20"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Trusted by leading companies</h2>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade security and compliance you can count on
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-8">
          {badges.map((badge, index) => (
            <motion.div
              key={badge.name}
              variants={itemVariants}
              className="flex items-center gap-3 px-6 py-4 bg-background rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className="font-medium text-sm">{badge.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
