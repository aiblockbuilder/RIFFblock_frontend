"use client"

import { motion } from "framer-motion"
import { Upload, Disc, Coins } from "lucide-react"

export default function AboutSection() {
  const steps = [
    {
      title: "Upload",
      description: "Upload your musical ideas",
      icon: Upload,
      color: "violet",
      borderColor: "border-violet-500/50"
    },
    {
      title: "Mint",
      description: "Create NFTs from your music",
      icon: Disc,
      color: "blue",
      borderColor: "border-blue-500/50"
    },
    {
      title: "Monetize",
      description: "Earn from your creativity",
      icon: Coins,
      color: "indigo",
      borderColor: "border-indigo-500/50"
    },
  ]

  return (
    <div className="w-full py-16">
      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        {/* Left side - Text content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-4xl font-bold">About RIFFblock</h2>
          <p className="text-lg text-zinc-300 leading-relaxed">
            RIFFblock empowers musicians to upload, mint, and monetize short musical ideas as NFTs. Our platform bridges
            the gap between creativity and blockchain technology, allowing artists to earn directly from their work
            without intermediaries.
          </p>
          <p className="text-zinc-400">
            By tokenizing musical snippets, artists can build a portfolio of digital assets that fans can collect,
            trade, and support. This creates new revenue streams and deeper connections with audiences.
          </p>
        </motion.div>

        {/* Right side - 3-step visual flow */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 transform -translate-y-1/2 z-0"></div>

          {/* Glowing line (animated) */}
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-violet-500 via-blue-500 to-violet-500 transform -translate-y-1/2 z-10"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            style={{ boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)" }}
          ></motion.div>

          <div className="flex justify-between items-center relative z-20">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                whileHover={{
                  y: -5,
                  boxShadow:
                    step.color === "violet"
                      ? "0 10px 25px -5px rgba(139, 92, 246, 0.3)"
                      : step.color === "blue"
                        ? "0 10px 25px -5px rgba(59, 130, 246, 0.3)"
                        : "0 10px 25px -5px rgba(99, 102, 241, 0.3)",
                }}
                className={`bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-800 hover:${step.borderColor} transition-all w-[30%]`}
              >
                <div className="flex flex-col items-center text-center">
                  <div
                    className={`w-16 h-16 bg-${step.color}-500/20 rounded-full flex items-center justify-center mb-4`}
                  >
                    <step.icon className={`h-8 w-8 text-${step.color}-400`} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-zinc-400 text-sm">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
