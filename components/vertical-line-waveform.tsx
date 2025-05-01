"use client"

import { useEffect, useRef } from "react"

interface VerticalLineWaveformProps {
  speed?: number
  intensity?: number
}

export default function VerticalLineWaveform({ speed = 1, intensity = 1 }: VerticalLineWaveformProps) {
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

    // Draw the vertical line waveform animation
    const drawVerticalLineWaveform = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Clear canvas with very dark navy background
      ctx.fillStyle = "#000814"
      ctx.fillRect(0, 0, width, height)

      // Line parameters
      const lineSpacing = 2 // Space between vertical lines (smaller for denser texture)
      const lineCount = Math.ceil(width / lineSpacing)
      const centerY = height * 0.5

      // Reduced amplitude for minimal shifts
      const maxAmplitude = height * 0.15 * intensity

      // Wave parameters - slower movement
      const waveSpeed = speed * 0.3
      const waveOffset = time * waveSpeed * 0.05

      // Draw vertical lines
      for (let i = 0; i < lineCount; i++) {
        const x = i * lineSpacing

        // Calculate wave height at this position
        // Create a smooth, gentle wave by combining multiple sine waves with low amplitudes
        const wavePos1 = (x / width) * 6 + waveOffset
        const wavePos2 = (x / width) * 3 + waveOffset * 0.7
        const wavePos3 = (x / width) * 9 + waveOffset * 0.4

        // Combine waves with different frequencies and amplitudes
        const wave1 = Math.sin(wavePos1) * 0.5
        const wave2 = Math.sin(wavePos2) * 0.3
        const wave3 = Math.sin(wavePos3) * 0.2

        // Add a very subtle breathing effect
        const breathingEffect = Math.sin(time * 0.005) * 0.1

        // Combine all effects with reduced intensity for subtlety
        const waveHeight = (wave1 + wave2 + wave3 + breathingEffect) * maxAmplitude

        // Calculate line height based on wave
        const lineHeight = Math.abs(waveHeight) * 1.2

        // Calculate color based on position (blue to purple/pink gradient)
        const colorPosition = x / width // 0 to 1 across the screen

        // Create gradient for the line
        const lineGradient = ctx.createLinearGradient(x, centerY - lineHeight, x, centerY + lineHeight)

        // Electric blue to purple to soft pink gradient
        if (colorPosition < 0.33) {
          // Electric blue
          lineGradient.addColorStop(0, `rgba(32, 156, 255, ${0.1 + Math.abs(wave1) * 0.5})`)
          lineGradient.addColorStop(0.5, `rgba(64, 190, 255, ${0.2 + Math.abs(wave1) * 0.6})`)
          lineGradient.addColorStop(1, `rgba(32, 156, 255, ${0.1 + Math.abs(wave1) * 0.5})`)
        } else if (colorPosition < 0.66) {
          // Purple
          lineGradient.addColorStop(0, `rgba(120, 87, 255, ${0.1 + Math.abs(wave1) * 0.5})`)
          lineGradient.addColorStop(0.5, `rgba(140, 100, 255, ${0.2 + Math.abs(wave1) * 0.6})`)
          lineGradient.addColorStop(1, `rgba(120, 87, 255, ${0.1 + Math.abs(wave1) * 0.5})`)
        } else {
          // Soft pink
          lineGradient.addColorStop(0, `rgba(255, 105, 180, ${0.1 + Math.abs(wave1) * 0.5})`)
          lineGradient.addColorStop(0.5, `rgba(255, 130, 200, ${0.2 + Math.abs(wave1) * 0.6})`)
          lineGradient.addColorStop(1, `rgba(255, 105, 180, ${0.1 + Math.abs(wave1) * 0.5})`)
        }

        // Set line style - thinner lines for more density
        ctx.strokeStyle = lineGradient
        ctx.lineWidth = 1

        // Add soft glow effect
        ctx.shadowColor =
          colorPosition < 0.33
            ? "rgba(64, 190, 255, 0.5)"
            : colorPosition < 0.66
              ? "rgba(140, 100, 255, 0.5)"
              : "rgba(255, 130, 200, 0.5)"
        ctx.shadowBlur = 5

        // Add slight shimmer effect at peaks
        if (Math.abs(wave1) > 0.7) {
          ctx.shadowBlur = 8
          ctx.lineWidth = 1.2
        }

        // Draw the vertical line
        ctx.beginPath()
        ctx.moveTo(x, centerY - lineHeight)
        ctx.lineTo(x, centerY + lineHeight)
        ctx.stroke()
      }
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
