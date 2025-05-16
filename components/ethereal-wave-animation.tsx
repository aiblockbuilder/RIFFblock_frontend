"use client"

import { useEffect, useRef } from "react"

interface EtherealWaveAnimationProps {
  speed?: number
  intensity?: number
}

export default function EtherealWaveAnimation({ speed = 1, intensity = 1 }: EtherealWaveAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for ultra-high resolution
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

    // Create wave layers
    const waveLayers = [
      {
        speed: 0.2 * speed,
        amplitude: 0.05 * intensity,
        frequency: 0.005,
        y: 0.7, // Position from top (0-1)
        verticalSpeed: 0.03 * speed, // Speed of vertical oscillation
        verticalAmplitude: 0.02 * intensity, // Amplitude of vertical oscillation
        verticalPhase: 0, // Phase offset for vertical motion
        color: {
          start: [255, 100, 200], // Pink
          end: [130, 80, 255], // Purple
        },
        opacity: 0.4,
      },
      {
        speed: 0.15 * speed,
        amplitude: 0.04 * intensity,
        frequency: 0.008,
        y: 0.5,
        verticalSpeed: 0.02 * speed,
        verticalAmplitude: 0.015 * intensity,
        verticalPhase: 1.3, // Different phase for natural variation
        color: {
          start: [100, 70, 255], // Indigo
          end: [180, 100, 255], // Magenta
        },
        opacity: 0.5,
      },
      {
        speed: 0.1 * speed,
        amplitude: 0.06 * intensity,
        frequency: 0.01,
        y: 0.3,
        verticalSpeed: 0.025 * speed,
        verticalAmplitude: 0.018 * intensity,
        verticalPhase: 2.7, // Different phase for natural variation
        color: {
          start: [50, 130, 255], // Blue
          end: [200, 100, 255], // Pink/Purple
        },
        opacity: 0.6,
      },
    ]

    // Create particles
    const particles: {
      x: number
      y: number
      size: number
      speed: number
      opacity: number
      color: [number, number, number]
      twinkleSpeed: number
    }[] = []

    // Initialize particles
    const initParticles = () => {
      const particleCount = Math.floor(window.innerWidth * window.innerHeight * 0.00015) // Sparse density
      particles.length = 0

      for (let i = 0; i < particleCount; i++) {
        const colorType = Math.random()
        let color: [number, number, number]

        if (colorType < 0.4) {
          color = [255, 255, 255] // White
        } else if (colorType < 0.6) {
          color = [255, 200, 100] // Soft gold
        } else if (colorType < 0.8) {
          color = [255, 150, 220] // Warm pink
        } else {
          color = [150, 200, 255] // Soft blue
        }

        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: 0.5 + Math.random() * 1.5,
          speed: 0.1 + Math.random() * 0.2,
          opacity: 0.1 + Math.random() * 0.5,
          color,
          twinkleSpeed: 0.01 + Math.random() * 0.02,
        })
      }
    }

    initParticles()

    // Draw background gradient
    const drawBackground = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Create a rich space-like gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height)
      gradient.addColorStop(0, "rgba(30, 15, 60, 1)") // Dark indigo
      gradient.addColorStop(0.3, "rgba(40, 20, 80, 1)") // Rich purple
      gradient.addColorStop(0.6, "rgba(20, 30, 80, 1)") // Deep blue
      gradient.addColorStop(1, "rgba(10, 10, 40, 1)") // Very dark blue

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }

    // Draw particles
    const drawParticles = () => {
      particles.forEach((particle) => {
        // Move particle slowly upward
        particle.y -= particle.speed

        // Reset if off screen
        if (particle.y < -10) {
          particle.y = window.innerHeight + 10
          particle.x = Math.random() * window.innerWidth
        }

        // Twinkle effect - vary opacity sinusoidally
        const twinkle = 0.5 + Math.sin(time * particle.twinkleSpeed) * 0.5
        const opacity = particle.opacity * twinkle

        // Draw particle with glow
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

        // Add glow effect
        const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 4)
        glow.addColorStop(0, `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, ${opacity})`)
        glow.addColorStop(1, `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, 0)`)

        ctx.fillStyle = glow
        ctx.fill()

        // Draw the bright center
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${particle.color[0]}, ${particle.color[1]}, ${particle.color[2]}, ${opacity * 1.5})`
        ctx.fill()
      })
    }

    // Draw a single ethereal wave layer
    const drawWaveLayer = (layer: (typeof waveLayers)[0]) => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Calculate vertical oscillation for the entire wave
      // This creates the rising and falling effect of the entire waveform
      const verticalOscillation =
        Math.sin(time * layer.verticalSpeed + layer.verticalPhase) * height * layer.verticalAmplitude +
        Math.sin(time * layer.verticalSpeed * 0.7 + layer.verticalPhase * 1.3) * height * layer.verticalAmplitude * 0.5

      // Base y position with vertical oscillation applied
      const yBase = height * layer.y + verticalOscillation

      // Create path for the wave
      ctx.beginPath()

      // Start below the canvas to ensure full coverage
      ctx.moveTo(0, height)

      // Draw the wave path
      for (let x = 0; x <= width; x += 5) {
        // Create multiple overlapping sine waves for organic feel
        const wave1 = Math.sin(x * layer.frequency + time * layer.speed) * height * layer.amplitude
        const wave2 = Math.sin(x * layer.frequency * 2 + time * layer.speed * 0.8) * height * layer.amplitude * 0.5
        const wave3 = Math.sin(x * layer.frequency * 0.5 + time * layer.speed * 1.2) * height * layer.amplitude * 0.3

        // Add breathing effect
        const breathing = Math.sin(time * 0.05) * height * 0.01

        // Add subtle vertical variation along the wave
        // This creates micro-movements in the peaks and valleys
        const microVertical =
          Math.sin(x * 0.01 + time * 0.03) * height * 0.005 * intensity +
          Math.cos(x * 0.02 + time * 0.02) * height * 0.003 * intensity

        // Combine waves with breathing and vertical effects
        const y = yBase + wave1 + wave2 + wave3 + breathing + microVertical

        ctx.lineTo(x, y)
      }

      // Complete the path to the bottom of the canvas
      ctx.lineTo(width, height)
      ctx.lineTo(0, height)
      ctx.closePath()

      // Create gradient for the wave
      const gradient = ctx.createLinearGradient(
        0,
        yBase - height * layer.amplitude * 2,
        0,
        yBase + height * layer.amplitude * 2,
      )

      // Calculate interpolated colors based on position
      const startColor = layer.color.start
      const endColor = layer.color.end

      // Add multiple color stops for richer gradient
      gradient.addColorStop(0, `rgba(${startColor[0]}, ${startColor[1]}, ${startColor[2]}, 0)`)
      gradient.addColorStop(0.2, `rgba(${startColor[0]}, ${startColor[1]}, ${startColor[2]}, ${layer.opacity * 0.3})`)
      gradient.addColorStop(0.4, `rgba(${endColor[0]}, ${endColor[1]}, ${endColor[2]}, ${layer.opacity * 0.7})`)
      gradient.addColorStop(0.6, `rgba(${startColor[0]}, ${startColor[1]}, ${startColor[2]}, ${layer.opacity * 0.5})`)
      gradient.addColorStop(0.8, `rgba(${endColor[0]}, ${endColor[1]}, ${endColor[2]}, ${layer.opacity * 0.3})`)
      gradient.addColorStop(1, `rgba(${endColor[0]}, ${endColor[1]}, ${endColor[2]}, 0)`)

      // Fill the wave with gradient
      ctx.fillStyle = gradient
      ctx.fill()

      // Add subtle glow along the top edge of the wave
      ctx.beginPath()
      for (let x = 0; x <= width; x += 5) {
        const wave1 = Math.sin(x * layer.frequency + time * layer.speed) * height * layer.amplitude
        const wave2 = Math.sin(x * layer.frequency * 2 + time * layer.speed * 0.8) * height * layer.amplitude * 0.5
        const wave3 = Math.sin(x * layer.frequency * 0.5 + time * layer.speed * 1.2) * height * layer.amplitude * 0.3
        const breathing = Math.sin(time * 0.05) * height * 0.01
        const microVertical =
          Math.sin(x * 0.01 + time * 0.03) * height * 0.005 * intensity +
          Math.cos(x * 0.02 + time * 0.02) * height * 0.003 * intensity
        const y = yBase + wave1 + wave2 + wave3 + breathing + microVertical

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      // Set line style for the glow
      ctx.strokeStyle = `rgba(${endColor[0]}, ${endColor[1]}, ${endColor[2]}, ${layer.opacity * 1.5})`
      ctx.lineWidth = 2
      ctx.stroke()

      // Add extra highlight for the wave crest
      ctx.beginPath()
      for (let x = 0; x <= width; x += 10) {
        const wave1 = Math.sin(x * layer.frequency + time * layer.speed) * height * layer.amplitude
        const wave2 = Math.sin(x * layer.frequency * 2 + time * layer.speed * 0.8) * height * layer.amplitude * 0.5
        const wave3 = Math.sin(x * layer.frequency * 0.5 + time * layer.speed * 1.2) * height * layer.amplitude * 0.3
        const breathing = Math.sin(time * 0.05) * height * 0.01
        const microVertical =
          Math.sin(x * 0.01 + time * 0.03) * height * 0.005 * intensity +
          Math.cos(x * 0.02 + time * 0.02) * height * 0.003 * intensity
        const y = yBase + wave1 + wave2 + wave3 + breathing + microVertical

        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      // Set line style for the highlight
      ctx.strokeStyle = `rgba(255, 255, 255, ${layer.opacity * 0.3})`
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // Main draw function
    const draw = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background
      drawBackground()

      // Draw particles (behind waves)
      drawParticles()

      // Draw wave layers from back to front
      waveLayers.forEach(drawWaveLayer)
    }

    // Animation loop
    const animate = () => {
      time += 0.01 * speed // Very slow time increment for subtle movement
      draw()
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
