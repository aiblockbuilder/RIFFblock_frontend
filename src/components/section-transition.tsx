"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"

interface SectionTransitionProps {
  children: ReactNode
  className?: string
  intensity?: "subtle" | "medium" | "strong"
  direction?: "top" | "bottom" | "both"
}

export default function SectionTransition({
  children,
  className = "",
  intensity = "subtle",
  direction = "both",
}: SectionTransitionProps) {
  // Define gradient opacity based on intensity
  const getOpacity = () => {
    switch (intensity) {
      case "strong":
        return 0.15
      case "medium":
        return 0.1
      case "subtle":
      default:
        return 0.05
    }
  }

  const opacity = getOpacity()

  return (
    <div className={`relative ${className}`}>
      {/* Top gradient overlay (if needed) */}
      {(direction === "top" || direction === "both") && (
        <div
          className="absolute top-0 left-0 w-full h-32 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, rgba(13, 13, 13, ${opacity}), transparent)`,
            zIndex: 1,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-0">{children}</div>

      {/* Bottom gradient overlay (if needed) */}
      {(direction === "bottom" || direction === "both") && (
        <div
          className="absolute bottom-0 left-0 w-full h-32 pointer-events-none"
          style={{
            background: `linear-gradient(to top, rgba(13, 13, 13, ${opacity}), transparent)`,
            zIndex: 1,
          }}
        />
      )}

      {/* Subtle animated particles for visual interest */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1 }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-violet-500/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 20 - 10],
              x: [0, Math.random() * 20 - 10],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}
      </motion.div>
    </div>
  )
}
