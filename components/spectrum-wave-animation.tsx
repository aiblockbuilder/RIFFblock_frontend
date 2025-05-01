"use client"

import { useEffect, useRef } from "react"

interface SpectrumWaveAnimationProps {
  speed?: number
  intensity?: number
}

export default function SpectrumWaveAnimation({ speed = 1, intensity = 1 }: SpectrumWaveAnimationProps) {
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

    // Generate beat-like wave data
    const generateBeatWaveData = (width: number, time: number) => {
      const data = []
      const segments = 12 // Number of wave segments
      const segmentWidth = width / segments

      // Create base wave segments with sharp peaks and valleys
      for (let i = 0; i < segments; i++) {
        // Create different wave patterns for different segments
        const segmentType = i % 3 // 3 different segment types
        const segmentOffset = time * speed * 0.1 + i * 0.5

        // Number of points in this segment
        const pointCount = Math.floor(segmentWidth / 3) // 3px spacing between lines

        for (let j = 0; j < pointCount; j++) {
          const x = i * segmentWidth + j * 3
          const position = j / pointCount

          // Base wave value
          let value = 0

          if (segmentType === 0) {
            // Sharp peaks
            value = Math.pow(Math.sin(position * Math.PI * 2 + segmentOffset), 3) * 0.8
          } else if (segmentType === 1) {
            // Gradual rise and sharp fall (sawtooth-like)
            const sawtoothPos = (position + segmentOffset) % 1
            value =
              sawtoothPos < 0.8
                ? sawtoothPos * 1.25 - 0.5 // Rising part
                : (1 - sawtoothPos) * 5 - 0.5 // Sharp falling part
          } else {
            // Pulse-like pattern
            const pulsePos = (position * 3 + segmentOffset) % 1
            value = pulsePos < 0.2 ? 0.8 : -0.3
          }

          // Add some variation based on time
          value += Math.sin(time * 0.01 + i) * 0.2

          // Add some randomness for natural feel
          value += Math.random() * 0.1 - 0.05

          // Clamp values
          value = Math.max(-1, Math.min(1, value))

          data.push({ x, value })
        }
      }

      return data
    }

    // Draw the vertical line waveform animation
    const drawVerticalLineWaveform = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Clear canvas with dark blue background
      const bgGradient = ctx.createLinearGradient(0, 0, width, 0)
      bgGradient.addColorStop(0, "#000a1f")
      bgGradient.addColorStop(0.5, "#000a1f")
      bgGradient.addColorStop(1, "#000a1f")
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // Generate wave data
      const waveData = generateBeatWaveData(width, time)

      // Center Y position
      const centerY = height * 0.5

      // Maximum amplitude
      const maxAmplitude = height * 0.25 * intensity

      // Draw each vertical line
      waveData.forEach((point) => {
        const x = point.x
        const waveHeight = point.value * maxAmplitude

        // Calculate line height based on wave
        const lineHeight = Math.abs(waveHeight) * 1.5 // Make lines taller for more impact

        // Calculate color based on position (blue to purple gradient)
        const colorPosition = x / width // 0 to 1 across the screen

        // Create gradient for the line
        const lineGradient = ctx.createLinearGradient(x, centerY - lineHeight, x, centerY + lineHeight)

        // Blue to purple gradient with teal in the middle
        if (colorPosition < 0.33) {
          // Blue side
          lineGradient.addColorStop(0, `rgba(0, 200, 255, ${0.1 + Math.abs(point.value) * 0.9})`)
          lineGradient.addColorStop(0.5, `rgba(0, 220, 255, ${0.3 + Math.abs(point.value) * 0.7})`)
          lineGradient.addColorStop(1, `rgba(0, 200, 255, ${0.1 + Math.abs(point.value) * 0.9})`)
        } else if (colorPosition < 0.66) {
          // Teal middle
          lineGradient.addColorStop(0, `rgba(0, 180, 220, ${0.1 + Math.abs(point.value) * 0.9})`)
          lineGradient.addColorStop(0.5, `rgba(0, 200, 220, ${0.3 + Math.abs(point.value) * 0.7})`)
          lineGradient.addColorStop(1, `rgba(0, 180, 220, ${0.1 + Math.abs(point.value) * 0.9})`)
        } else {
          // Purple side
          lineGradient.addColorStop(0, `rgba(150, 0, 255, ${0.1 + Math.abs(point.value) * 0.9})`)
          lineGradient.addColorStop(0.5, `rgba(180, 0, 255, ${0.3 + Math.abs(point.value) * 0.7})`)
          lineGradient.addColorStop(1, `rgba(150, 0, 255, ${0.1 + Math.abs(point.value) * 0.9})`)
        }

        // Set line style
        ctx.strokeStyle = lineGradient
        ctx.lineWidth = 1

        // Add glow effect for brighter areas
        if (Math.abs(point.value) > 0.7) {
          ctx.shadowColor = colorPosition < 0.5 ? "rgba(0, 200, 255, 0.8)" : "rgba(180, 0, 255, 0.8)"
          ctx.shadowBlur = 8
        } else {
          ctx.shadowBlur = 0
        }

        // Draw the vertical line
        ctx.beginPath()
        ctx.moveTo(x, centerY - lineHeight)
        ctx.lineTo(x, centerY + lineHeight)
        ctx.stroke()
      })
    }

    // Animation loop
    const animate = () => {
      time += 1
      drawVerticalLineWaveform()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [speed, intensity])

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
