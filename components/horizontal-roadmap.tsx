"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Coins, ShoppingCart, Handshake } from "lucide-react"

export default function HorizontalRoadmap() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)

  const roadmapItems = [
    {
      phase: "Phase 1",
      title: "Token Sale",
      description: "Initial token offering, smart contract audit, exchange listings, and community building.",
      icon: Coins,
      status: "completed",
      date: "Q2 2025",
    },
    {
      phase: "Phase 2",
      title: "NFT Marketplace Launch",
      description: "Beta platform launch, artist onboarding, first NFT drops, and mobile app development.",
      icon: ShoppingCart,
      status: "in-progress",
      date: "Q3 2025",
    },
    {
      phase: "Phase 3",
      title: "Collaboration & Staking",
      description: "Staking mechanism, royalty distribution system, governance features, and cross-chain integration.",
      icon: Handshake,
      status: "upcoming",
      date: "Q4 2025",
    },
  ]

  return (
    <div className="w-full py-8">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">RIFFblock Roadmap</h2>

      {/* Mobile View (Vertical) */}
      <div className="md:hidden space-y-8">
        {roadmapItems.map((item, index) => (
          <motion.div
            key={index}
            className="relative bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-800 hover:border-violet-500/30 transition-all"
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.2)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-zinc-900 border border-zinc-700">
              <item.icon className="h-4 w-4 text-violet-400" />
            </div>
            <div className="mt-2 text-center">
              <div
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                  item.status === "completed"
                    ? "bg-green-500/20 text-green-400"
                    : item.status === "in-progress"
                      ? "bg-blue-500/20 text-blue-400"
                      : "bg-zinc-700/20 text-zinc-400"
                }`}
              >
                {item.date}
              </div>
              <h3 className="text-lg font-bold">{item.phase}</h3>
              <p className="text-violet-300 font-medium mb-2">{item.title}</p>
              <p className="text-zinc-400 text-sm">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop View (Horizontal) */}
      <div className="hidden md:block relative">
        {/* Timeline Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 transform -translate-y-1/2 z-0"></div>

        {/* Glowing Line (animated) */}
        <motion.div
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-500 via-blue-500 to-violet-500 transform -translate-y-1/2 z-10"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "easeInOut" }}
          style={{ boxShadow: "0 0 10px rgba(139, 92, 246, 0.7)" }}
        ></motion.div>

        <div className="flex justify-between items-center relative z-20">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={index}
              className="w-[30%] bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-800 hover:border-violet-500/50 transition-all"
              whileHover={{
                y: -10,
                boxShadow: "0 15px 30px -5px rgba(139, 92, 246, 0.3)",
                borderColor: "rgba(139, 92, 246, 0.5)",
              }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    hoveredCard === index ? "bg-violet-500/30 border-violet-400" : "bg-zinc-900 border-zinc-700"
                  }`}
                  animate={
                    hoveredCard === index
                      ? {
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            "0 0 0 rgba(139, 92, 246, 0)",
                            "0 0 20px rgba(139, 92, 246, 0.7)",
                            "0 0 10px rgba(139, 92, 246, 0.5)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 1, repeat: hoveredCard === index ? Number.POSITIVE_INFINITY : 0 }}
                >
                  <item.icon className={`h-5 w-5 ${hoveredCard === index ? "text-white" : "text-violet-400"}`} />
                </motion.div>
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                    item.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : item.status === "in-progress"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-zinc-700/20 text-zinc-400"
                  }`}
                >
                  {item.date}
                </div>
                <h3 className="text-xl font-bold">{item.phase}</h3>
                <p className="text-violet-300 font-medium mb-3">{item.title}</p>
                <p className="text-zinc-400 text-sm">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
