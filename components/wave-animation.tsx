"use client"

import { useEffect, useRef } from "react"

interface WaveAnimationProps {
  speed?: number
  intensity?: number
  type?: "waveform" | "particles" | "synth"
}

export default function WaveAnimation({ speed = 1, intensity = 1, type = "synth" }: WaveAnimationProps) {
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

    // Synth wave animation
    const drawSynthWave = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Clear canvas with a subtle gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, "rgba(13, 13, 13, 1)")
      gradient.addColorStop(1, "rgba(13, 13, 13, 0.8)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Draw grid lines
      ctx.lineWidth = 0.3
      ctx.strokeStyle = "rgba(139, 92, 246, 0.1)" // Violet color

      // Horizontal grid lines
      const gridSpacingY = 30
      for (let y = 0; y < height; y += gridSpacingY) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
        ctx.stroke()
      }

      // Vertical grid lines
      const gridSpacingX = 30
      for (let x = 0; x < width; x += gridSpacingX) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.stroke()
      }

      // Draw multiple wave layers
      const waveColors = [
        "rgba(139, 92, 246, 0.6)", // Violet
        "rgba(99, 102, 241, 0.5)", // Indigo
        "rgba(59, 130, 246, 0.4)", // Blue
        "rgba(168, 85, 247, 0.3)", // Purple
      ]

      const centerY = height * 0.5

      waveColors.forEach((color, i) => {
        const amplitude = 20 + i * 10 * intensity
        const frequency = 0.02 - i * 0.003
        const waveSpeed = 0.03 * (1 + i * 0.2) * speed
        const verticalShift = (i - 1.5) * 40

        ctx.beginPath()
        ctx.moveTo(0, centerY)

        // Draw the wave
        for (let x = 0; x < width; x += 2) {
          const dx = x / width
          const offsetY = Math.sin(dx * Math.PI * 10 * frequency + time * waveSpeed) * amplitude

          // Add some harmonic distortion for more complex waveform
          const harmonic1 = Math.sin(dx * Math.PI * 20 * frequency + time * waveSpeed * 1.1) * amplitude * 0.3
          const harmonic2 = Math.sin(dx * Math.PI * 30 * frequency + time * waveSpeed * 0.9) * amplitude * 0.15

          const y = centerY + offsetY + harmonic1 + harmonic2 + verticalShift
          ctx.lineTo(x, y)
        }

        // Complete the path to create a closed shape
        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()

        // Fill with gradient
        const waveGradient = ctx.createLinearGradient(0, centerY - amplitude, 0, height)
        waveGradient.addColorStop(0, color)
        waveGradient.addColorStop(1, "rgba(13, 13, 13, 0)")
        ctx.fillStyle = waveGradient
        ctx.fill()
      })

      // Add floating particles
      const particleCount = 50
      const particleSize = 1.5

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"

      for (let i = 0; i < particleCount; i++) {
        const x = (Math.sin(time * 0.001 * i) + 1) * 0.5 * width
        const y = (Math.cos(time * 0.002 * i) + 1) * 0.5 * height
        const size = Math.max(0.5, particleSize * (Math.sin(time * 0.003 * i) + 1.5))

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Add glow effect at certain points
      const glowCount = 3
      for (let i = 0; i < glowCount; i++) {
        const x = (Math.sin(time * 0.0005 * (i + 1)) + 1) * 0.5 * width
        const y = (Math.cos(time * 0.0007 * (i + 1)) + 1) * 0.3 * height + height * 0.2

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100 + Math.sin(time * 0.001) * 20)
        gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)")
        gradient.addColorStop(0.5, "rgba(99, 102, 241, 0.1)")
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, 150, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Audio waveform animation
    const drawWaveform = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw multiple waveforms
      const waveCount = 128
      const gap = width / waveCount

      // Draw center line
      ctx.strokeStyle = "rgba(139, 92, 246, 0.2)"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height / 2)
      ctx.lineTo(width, height / 2)
      ctx.stroke()

      // Draw waveform bars
      for (let i = 0; i < waveCount; i++) {
        // Generate a height based on multiple sine waves for more organic movement
        const x = i * gap

        // Create a complex waveform by combining multiple frequencies
        const t = time * speed * 0.05
        const wave1 = Math.sin(i * 0.2 + t) * 0.5
        const wave2 = Math.sin(i * 0.1 + t * 1.3) * 0.3
        const wave3 = Math.sin(i * 0.05 + t * 0.7) * 0.2

        // Combine waves and add some randomness
        let amplitude = (wave1 + wave2 + wave3) * 0.6 + 0.4
        amplitude = Math.max(0.1, Math.min(1, amplitude)) // Clamp between 0.1 and 1

        // Scale by intensity
        amplitude *= intensity

        const barHeight = amplitude * height * 0.4

        // Calculate gradient colors based on amplitude
        const hue = 270 - amplitude * 30 // Violet to blue
        const saturation = 70 + amplitude * 30
        const lightness = 50 + amplitude * 20

        // Draw bar
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.2 + amplitude * 0.6})`

        // Top bar
        ctx.fillRect(x, height / 2 - barHeight, gap - 1, barHeight)

        // Bottom bar (mirrored)
        ctx.fillRect(x, height / 2, gap - 1, barHeight)

        // Add glow effect for higher amplitude bars
        if (amplitude > 0.7) {
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.1})`
          ctx.beginPath()
          ctx.arc(x + gap / 2, height / 2, barHeight * 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    // Particle animation
    const drawParticles = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Create a semi-transparent background effect
      ctx.fillStyle = "rgba(13, 13, 13, 0.1)"
      ctx.fillRect(0, 0, width, height)

      const particleCount = 100

      for (let i = 0; i < particleCount; i++) {
        // Calculate position based on time and particle index
        const angle = (i / particleCount) * Math.PI * 2
        const radiusBase = Math.min(width, height) * 0.3

        // Create wave effect in the radius
        const waveOffset = Math.sin(time * speed * 0.01 + i * 0.1) * 50 * intensity
        const radius = Math.max(10, radiusBase + waveOffset)

        const x = width / 2 + Math.cos(angle + time * speed * 0.001 * i * 0.1) * radius
        const y = height / 2 + Math.sin(angle + time * speed * 0.001 * i * 0.1) * radius

        // Size varies with time
        const size = Math.max(0.5, 1 + Math.sin(time * 0.01 + i) * 2)

        // Color varies based on position
        const hue = (angle / (Math.PI * 2)) * 60 + 240 // Blue to violet range
        const saturation = 70 + Math.sin(time * 0.001 + i) * 30
        const lightness = 50 + Math.sin(time * 0.002 + i * 0.5) * 20

        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.7)`

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        // Add connecting lines between nearby particles
        if (i > 0) {
          const prevAngle = ((i - 1) / particleCount) * Math.PI * 2
          const prevWaveOffset = Math.sin(time * speed * 0.01 + (i - 1) * 0.1) * 50 * intensity
          const prevRadius = Math.max(10, radiusBase + prevWaveOffset)

          const prevX = width / 2 + Math.cos(prevAngle + time * speed * 0.001 * (i - 1) * 0.1) * prevRadius
          const prevY = height / 2 + Math.sin(prevAngle + time * speed * 0.001 * (i - 1) * 0.1) * prevRadius

          // Calculate distance
          const dx = x - prevX
          const dy = y - prevY
          const distance = Math.sqrt(dx * dx + dy * dy)

          // Only connect if they're close enough
          if (distance < 50) {
            ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.5 - distance / 100})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(prevX, prevY)
            ctx.lineTo(x, y)
            ctx.stroke()
          }
        }
      }
    }

    // Animation loop
    const animate = () => {
      time += 1

      if (type === "waveform") {
        drawWaveform()
      } else if (type === "particles") {
        drawParticles()
      } else {
        drawSynthWave()
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [speed, intensity, type])

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
