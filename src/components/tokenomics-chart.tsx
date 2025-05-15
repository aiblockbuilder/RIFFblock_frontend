"use client"

import { useEffect, useRef } from "react"

export default function TokenomicsChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = 300
    canvas.height = 300

    // Chart data with the updated tokenomics information
    const data = [
      {
        label: "Community Rewards & Staking",
        value: 30,
        color: "#8b5cf6",
        description: "Staking (Rifflords), tipping boosts, seasonal bounties, leaderboard prizes",
      },
      {
        label: "Artist Incentive Fund",
        value: 20,
        color: "#6366f1",
        description: "Upload bounties, featured drops, artist onboarding, riff creation grants",
      },
      {
        label: "Platform Development",
        value: 15,
        color: "#3b82f6",
        description: "Tech/dev work, smart contract audits, hosting, mobile, upgrades",
      },
      {
        label: "Team & Advisors",
        value: 15,
        color: "#a855f7",
        description: "With vesting (12-month cliff, 36-month linear vesting)",
      },
      {
        label: "Partnerships & Ecosystem",
        value: 10,
        color: "#ec4899",
        description: "Exchange listings, DAW partnerships, collabs, brand outreach",
      },
      {
        label: "Initial Liquidity Pool",
        value: 5,
        color: "#06b6d4",
        description: "Launch liquidity on Uniswap/Sunswap, trading support",
      },
      {
        label: "Airdrops & Early Users",
        value: 3,
        color: "#10b981",
        description: "Beta testers, early musicians, promo giveaways",
      },
      {
        label: "DAO Treasury",
        value: 2,
        color: "#f59e0b",
        description: "Governance, future community grants and project voting",
      },
    ]

    // Calculate total
    const total = data.reduce((sum, item) => sum + item.value, 0)

    // Draw chart
    let currentAngle = 0
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) * 0.8

    // Draw segments
    data.forEach((item) => {
      // Calculate segment angle
      const segmentAngle = (item.value / total) * 2 * Math.PI

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle)
      ctx.closePath()

      // Fill segment
      ctx.fillStyle = item.color
      ctx.fill()

      // Add segment border
      ctx.lineWidth = 2
      ctx.strokeStyle = "#0d0d0d"
      ctx.stroke()

      // Update current angle
      currentAngle += segmentAngle
    })

    // Draw inner circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius * 0.5, 0, 2 * Math.PI)
    ctx.fillStyle = "#0d0d0d"
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = "#27272a"
    ctx.stroke()

    // Add RIFF text in center
    ctx.font = "bold 24px sans-serif"
    ctx.fillStyle = "#ffffff"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText("RIFF", centerX, centerY)
    ctx.font = "12px sans-serif"
    ctx.fillText("100B Supply", centerX, centerY + 20)

    // Create legend
    const legendEl = document.createElement("div")
    legendEl.className = "grid grid-cols-2 gap-3 mt-6"

    data.forEach((item) => {
      const itemEl = document.createElement("div")
      itemEl.className = "flex items-center gap-2"

      const colorBox = document.createElement("div")
      colorBox.className = "w-3 h-3 rounded-sm shrink-0"
      colorBox.style.backgroundColor = item.color

      const labelEl = document.createElement("div")
      labelEl.className = "text-sm"

      const nameSpan = document.createElement("span")
      nameSpan.className = "text-zinc-200"
      nameSpan.textContent = `${item.label}: `

      const percentSpan = document.createElement("span")
      percentSpan.className = "text-zinc-400"
      percentSpan.textContent = `${item.value}%`

      labelEl.appendChild(nameSpan)
      labelEl.appendChild(percentSpan)

      itemEl.appendChild(colorBox)
      itemEl.appendChild(labelEl)
      legendEl.appendChild(itemEl)
    })

    canvas.parentNode?.appendChild(legendEl)

    return () => {
      if (legendEl.parentNode) {
        legendEl.parentNode.removeChild(legendEl)
      }
    }
  }, [])

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-xl font-bold mb-4">RIFF Token Distribution</h3>
      <canvas ref={canvasRef} className="max-w-full" />
    </div>
  )
}
