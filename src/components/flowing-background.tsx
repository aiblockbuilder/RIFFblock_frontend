"use client"

import { useEffect, useRef } from "react"

interface FlowingBackgroundProps {
  intensity?: number
  speed?: number
}

export default function FlowingBackground({ intensity = 1, speed = 1 }: FlowingBackgroundProps) {
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
      canvas.height = window.innerHeight * 3 * devicePixelRatio // Make canvas 3x the viewport height

      // Set the display size (css pixels)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight * 3}px`

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
    const time = 0

    // Create gradient layers
    const gradientLayers = [
      {
        colors: [
          { pos: 0.0, color: "rgba(15, 5, 25, 0.8)" }, // Dark purple
          { pos: 0.3, color: "rgba(10, 10, 30, 0.8)" }, // Dark blue-purple
          { pos: 0.6, color: "rgba(5, 15, 35, 0.8)" }, // Dark blue
          { pos: 1.0, color: "rgba(10, 5, 20, 0.8)" }, // Dark purple again
        ],
        speed: 0.01 * speed,
        yOffset: 0,
      },
      {
        colors: [
          { pos: 0.0, color: "rgba(30, 0, 50, 0.05)" },
          { pos: 0.5, color: "rgba(0, 15, 40, 0.05)" },
          { pos: 1.0, color: "rgba(20, 0, 30, 0.05)" },
        ],
        speed: 0.02 * speed,
        yOffset: 0.2,
      },
    ]

    // Create flowing shapes
    const shapes: { x: number; y: number; size: number; speed: number; opacity: number; hue: number }[] = []
    const shapeCount = 15

    for (let i = 0; i < shapeCount; i++) {
      const size = 100 + Math.random() * 300
      shapes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight * 3,
        size: size,
        speed: (0.2 + Math.random() * 0.3) * speed,
        opacity: 0.03 + Math.random() * 0.05,
        hue: Math.random() > 0.5 ? 260 + Math.random() * 30 : 290 + Math.random() * 30, // Blues and purples
      })
    }

    // Draw background gradient
    const drawBackground = (currentTime: number) => {
      const width = window.innerWidth
      const height = window.innerHeight * 3

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw base gradient
      const baseGradient = ctx.createLinearGradient(0, 0, 0, height)
      baseGradient.addColorStop(0, "rgba(13, 13, 13, 1)")
      baseGradient.addColorStop(0.3, "rgba(10, 10, 20, 1)")
      baseGradient.addColorStop(0.6, "rgba(8, 8, 15, 1)")
      baseGradient.addColorStop(1, "rgba(13, 13, 13, 1)")

      ctx.fillStyle = baseGradient
      ctx.fillRect(0, 0, width, height)

      // Draw animated gradient layers
      gradientLayers.forEach((layer) => {
        // Calculate y positions with animation
        const animatedPositions = layer.colors.map((color) => {
          const pos = (color.pos + currentTime * layer.speed) % 1
          return { pos, color: color.color }
        })

        // Sort by position for proper gradient rendering
        animatedPositions.sort((a, b) => a.pos - b.pos)

        // Create gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height)

        // Add color stops
        animatedPositions.forEach(({ pos, color }) => {
          gradient.addColorStop(pos, color)
        })

        // Draw gradient overlay
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, width, height)
      })

      // Draw flowing shapes
      shapes.forEach((shape) => {
        // Update position
        shape.y -= shape.speed
        if (shape.y < -shape.size) {
          shape.y = window.innerHeight * 3 + shape.size
          shape.x = Math.random() * width
        }

        // Draw shape
        const gradient = ctx.createRadialGradient(shape.x, shape.y, 0, shape.x, shape.y, shape.size)

        gradient.addColorStop(0, `hsla(${shape.hue}, 70%, 50%, ${shape.opacity})`)
        gradient.addColorStop(1, `hsla(${shape.hue}, 70%, 50%, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(shape.x, shape.y, shape.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // Add subtle horizontal lines for section transitions (very subtle)
      const linePositions = [
        height * 0.33, // First section transition
        height * 0.66, // Second section transition
      ]

      linePositions.forEach((yPos) => {
        const lineGradient = ctx.createLinearGradient(0, yPos - 100, 0, yPos + 100)
        lineGradient.addColorStop(0, "rgba(100, 100, 150, 0)")
        lineGradient.addColorStop(0.5, "rgba(100, 100, 150, 0.05)")
        lineGradient.addColorStop(1, "rgba(100, 100, 150, 0)")

        ctx.fillStyle = lineGradient
        ctx.fillRect(0, yPos - 100, width, 200)
      })
    }

    // Animation loop
    const animate = (timestamp: number) => {
      const currentTime = timestamp * 0.001 // Convert to seconds
      drawBackground(currentTime)
      animationFrameId = requestAnimationFrame(animate)
    }

    // Start animation
    animationFrameId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [intensity, speed])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-[300vh] -z-10"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "300vh",
        pointerEvents: "none",
      }}
    />
  )
}
