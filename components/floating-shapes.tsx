"use client"

import { useEffect, useRef } from "react"

interface FloatingShapesProps {
  density?: number
  speed?: number
  opacity?: number
}

export default function FloatingShapes({ density = 1, speed = 1, opacity = 0.5 }: FloatingShapesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * devicePixelRatio
      canvas.height = window.innerHeight * devicePixelRatio
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create shapes
    const shapes: { x: number; y: number; size: number; speedX: number; speedY: number; rotation: number; rotationSpeed: number; type: number; hue: number; opacity: number }[] = []
    const shapeCount = Math.floor(15 * density)

    // Shape types: 0 = circle, 1 = square, 2 = triangle
    for (let i = 0; i < shapeCount; i++) {
      const size = 30 + Math.random() * 70
      shapes.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: size,
        speedX: (Math.random() * 0.2 - 0.1) * speed,
        speedY: (Math.random() * 0.2 - 0.1) * speed,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() * 0.002 - 0.001) * speed,
        type: Math.floor(Math.random() * 3),
        hue: Math.random() > 0.5 ? 260 + Math.random() * 30 : 290 + Math.random() * 30,
        opacity: (0.02 + Math.random() * 0.05) * opacity,
      })
    }

    // Draw shapes
    const drawShapes = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      shapes.forEach((shape) => {
        // Update position
        shape.x += shape.speedX
        shape.y += shape.speedY
        shape.rotation += shape.rotationSpeed

        // Wrap around edges
        if (shape.x < -shape.size) shape.x = window.innerWidth + shape.size
        if (shape.x > window.innerWidth + shape.size) shape.x = -shape.size
        if (shape.y < -shape.size) shape.y = window.innerHeight + shape.size
        if (shape.y > window.innerHeight + shape.size) shape.y = -shape.size

        // Draw shape
        ctx.save()
        ctx.translate(shape.x, shape.y)
        ctx.rotate(shape.rotation)

        ctx.fillStyle = `hsla(${shape.hue}, 70%, 50%, ${shape.opacity})`
        ctx.strokeStyle = `hsla(${shape.hue}, 70%, 70%, ${shape.opacity * 0.5})`
        ctx.lineWidth = 1

        if (shape.type === 0) {
          // Circle
          ctx.beginPath()
          ctx.arc(0, 0, shape.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else if (shape.type === 1) {
          // Square
          ctx.fillRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size)
        } else {
          // Triangle
          ctx.beginPath()
          ctx.moveTo(0, -shape.size / 2)
          ctx.lineTo(shape.size / 2, shape.size / 2)
          ctx.lineTo(-shape.size / 2, shape.size / 2)
          ctx.closePath()
          ctx.fill()
        }

        ctx.restore()
      })
    }

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      drawShapes()
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      cancelAnimationFrame(animationFrameId)
    }
  }, [density, speed, opacity])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -5,
      }}
    />
  )
}
