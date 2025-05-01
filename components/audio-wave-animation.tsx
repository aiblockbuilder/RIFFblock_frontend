"use client"

import { useEffect, useRef } from "react"

interface AudioWaveAnimationProps {
  intensity?: number
  speed?: number
}

export default function AudioWaveAnimation({ intensity = 1, speed = 1 }: AudioWaveAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharper rendering
    const setCanvasDimensions = () => {
      const devicePixelRatio = window.devicePixelRatio || 1

      // Get the actual viewport dimensions
      canvas.width = window.innerWidth * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio

      // Set the display size (css pixels)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`

      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    // Initial setup
    setCanvasDimensions()

    // Update on resize
    const handleResize = () => {
      setCanvasDimensions()
    }

    window.addEventListener("resize", handleResize)

    let animationFrameId: number
    let time = 0

    // Wave parameters
    const waveColors = [
      { color: "rgba(139, 92, 246, 0.6)", shadow: "rgba(139, 92, 246, 0.2)" }, // Violet
      { color: "rgba(59, 130, 246, 0.5)", shadow: "rgba(59, 130, 246, 0.15)" }, // Blue
      { color: "rgba(45, 212, 191, 0.4)", shadow: "rgba(45, 212, 191, 0.1)" }, // Teal
    ]

    // Audio wave animation
    const drawAudioWaves = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Create a semi-transparent background effect for trail
      ctx.fillStyle = "rgba(13, 13, 13, 0.1)"
      ctx.fillRect(0, 0, width, height)

      // Draw multiple wave layers
      waveColors.forEach((colorSet, waveIndex) => {
        // Different parameters for each wave
        const centerY = height * (0.4 + waveIndex * 0.1)
        const amplitude = 20 + waveIndex * 15 * intensity
        const frequency = 0.01 - waveIndex * 0.002
        const waveSpeed = 0.02 * (1 + waveIndex * 0.2) * speed

        // Draw the main wave
        ctx.beginPath()
        ctx.moveTo(0, centerY)

        // Create smooth wave
        for (let x = 0; x < width; x += 2) {
          const dx = x / width

          // Create complex waveform by combining multiple sine waves
          const wave1 = Math.sin(dx * Math.PI * 10 * frequency + time * waveSpeed) * amplitude
          const wave2 = Math.sin(dx * Math.PI * 20 * frequency + time * waveSpeed * 1.3) * amplitude * 0.3
          const wave3 = Math.sin(dx * Math.PI * 5 * frequency + time * waveSpeed * 0.7) * amplitude * 0.2

          const y = centerY + wave1 + wave2 + wave3

          ctx.lineTo(x, y)
        }

        // Complete the path
        ctx.lineTo(width, centerY)

        // Set line style
        ctx.strokeStyle = colorSet.color
        ctx.lineWidth = 1.5

        // Add glow effect
        ctx.shadowColor = colorSet.shadow
        ctx.shadowBlur = 15
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.stroke()

        // Reset shadow for next wave
        ctx.shadowBlur = 0
      })

      // Add floating particles that follow the waves
      const particleCount = 30

      for (let i = 0; i < particleCount; i++) {
        const waveIndex = i % waveColors.length
        const centerY = height * (0.4 + waveIndex * 0.1)
        const amplitude = 20 + waveIndex * 15 * intensity

        // Position particles along the wave
        const x = (time * speed * 0.1 + i * (width / particleCount)) % width
        const dx = x / width

        // Calculate y position based on the same wave function
        const frequency = 0.01 - waveIndex * 0.002
        const waveSpeed = 0.02 * (1 + waveIndex * 0.2) * speed

        const wave1 = Math.sin(dx * Math.PI * 10 * frequency + time * waveSpeed) * amplitude
        const wave2 = Math.sin(dx * Math.PI * 20 * frequency + time * waveSpeed * 1.3) * amplitude * 0.3
        const wave3 = Math.sin(dx * Math.PI * 5 * frequency + time * waveSpeed * 0.7) * amplitude * 0.2

        const y = centerY + wave1 + wave2 + wave3

        // Particle size pulsates
        const size = 2 + Math.sin(time * 0.05 + i) * 1

        // Draw glowing particle
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = waveColors[waveIndex].color
        ctx.shadowColor = waveColors[waveIndex].shadow
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Add occasional pulse rings
      if (Math.random() < 0.02) {
        const ringX = Math.random() * width
        const ringY = Math.random() * height * 0.6 + height * 0.2
        const maxRadius = 50 + Math.random() * 100

        // Add to animation queue
        pulseRings.push({
          x: ringX,
          y: ringY,
          radius: 0,
          maxRadius: maxRadius,
          color: waveColors[Math.floor(Math.random() * waveColors.length)].color,
          alpha: 0.7,
        })
      }

      // Draw and update pulse rings
      pulseRings.forEach((ring, index) => {
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2)
        ctx.strokeStyle = ring.color.replace(/[\d.]+\)$/g, `${ring.alpha})`)
        ctx.lineWidth = 1
        ctx.stroke()

        // Update ring
        ring.radius += 1 * speed
        ring.alpha -= 0.01 * speed

        // Remove faded rings
        if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) {
          pulseRings.splice(index, 1)
        }
      })
    }

    // Store pulse rings
    const pulseRings: Array<{
      x: number
      y: number
      radius: number
      maxRadius: number
      color: string
      alpha: number
    }> = []

    // Animation loop
    const animate = () => {
      time += 1
      drawAudioWaves()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [intensity, speed])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100%",
        display: "block",
      }}
    />
  )
}
