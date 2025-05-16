"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, Clock, ArrowRight } from "lucide-react"

export default function Roadmap() {
  const [activePhase, setActivePhase] = useState(1)

  const phases = [
    {
      id: 1,
      title: "Phase 1: Token Sale",
      date: "Q2 2023",
      status: "completed",
      items: ["Initial token offering", "Smart contract audit", "Exchange listings", "Community building"],
    },
    {
      id: 2,
      title: "Phase 2: Marketplace Launch",
      date: "Q3 2023",
      status: "in-progress",
      items: ["Beta platform launch", "Artist onboarding", "First NFT drops", "Mobile app development"],
    },
    {
      id: 3,
      title: "Phase 3: Staking & Royalties",
      date: "Q4 2023",
      status: "upcoming",
      items: ["Staking mechanism", "Royalty distribution system", "Governance features", "Cross-chain integration"],
    },
    {
      id: 4,
      title: "Phase 4: Global Expansion",
      date: "Q1 2024",
      status: "upcoming",
      items: [
        "Major partnerships",
        "Live events integration",
        "Advanced analytics",
        "Decentralized autonomous organization",
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div className="flex overflow-x-auto pb-4 hide-scrollbar">
        <div className="flex space-x-2">
          {phases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setActivePhase(phase.id)}
              className={`flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activePhase === phase.id
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800/50"
              }`}
            >
              {phase.status === "completed" ? (
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              ) : phase.status === "in-progress" ? (
                <Clock className="mr-2 h-4 w-4 text-blue-400" />
              ) : (
                <ArrowRight className="mr-2 h-4 w-4 text-zinc-500" />
              )}
              {phase.title}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
          {phases.map((phase, index) => (
            <div
              key={phase.id}
              className={`absolute h-full rounded-full transition-all duration-500 ${
                phase.status === "completed"
                  ? "bg-green-500"
                  : phase.status === "in-progress"
                    ? "bg-blue-500"
                    : "bg-zinc-700"
              }`}
              style={{
                left: `${(index / phases.length) * 100}%`,
                width: `${(1 / phases.length) * 100}%`,
                transform: phase.status === "upcoming" ? "scaleX(0.3)" : "scaleX(1)",
                transformOrigin: "left",
              }}
            />
          ))}
        </div>

        <div className="pt-8">
          {phases.map((phase) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: activePhase === phase.id ? 1 : 0,
                y: activePhase === phase.id ? 0 : 20,
                display: activePhase === phase.id ? "block" : "none",
              }}
              transition={{ duration: 0.3 }}
              className="bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-800"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-xl font-bold">{phase.title}</h3>
                  <p className="text-zinc-400">{phase.date}</p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    phase.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : phase.status === "in-progress"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-zinc-700/20 text-zinc-400"
                  }`}
                >
                  {phase.status === "completed"
                    ? "Completed"
                    : phase.status === "in-progress"
                      ? "In Progress"
                      : "Upcoming"}
                </div>
              </div>
              <ul className="space-y-2">
                {phase.items.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div
                      className={`mt-1 w-4 h-4 rounded-full flex items-center justify-center ${
                        phase.status === "completed"
                          ? "bg-green-500/20"
                          : phase.status === "in-progress"
                            ? "bg-blue-500/20"
                            : "bg-zinc-700/20"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          phase.status === "completed"
                            ? "bg-green-500"
                            : phase.status === "in-progress"
                              ? "bg-blue-500"
                              : "bg-zinc-700"
                        }`}
                      />
                    </div>
                    <span className="text-zinc-300">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
