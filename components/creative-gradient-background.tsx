"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface CreativeGradientBackgroundProps {
    children: React.ReactNode
    variant?: "about" | "profile" | "upload" | "invest"
}

export default function CreativeGradientBackground({ children, variant = "about" }: CreativeGradientBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

    // Set up gradient colors based on variant
    const getGradientColors = () => {
        switch (variant) {
            case "profile":
                return {
                    primary: { r: 30, g: 10, b: 60 }, // Deep purple
                    secondary: { r: 15, g: 20, b: 50 }, // Midnight blue
                    accent: { r: 80, g: 30, b: 120 }, // Violet
                }
            case "upload":
                return {
                    primary: { r: 20, g: 10, b: 50 }, // Rich indigo
                    secondary: { r: 10, g: 15, b: 40 }, // Deep blue
                    accent: { r: 100, g: 40, b: 150 }, // Bright violet
                }
            case "invest":
                return {
                    primary: { r: 10, g: 15, b: 60 }, // Electric blue
                    secondary: { r: 30, g: 10, b: 50 }, // Deep purple
                    accent: { r: 20, g: 30, b: 100 }, // Indigo
                }
            case "about":
            default:
                return {
                    primary: { r: 15, g: 10, b: 40 }, // Midnight blue
                    secondary: { r: 30, g: 15, b: 60 }, // Deep purple
                    accent: { r: 60, g: 20, b: 100 }, // Violet
                }
        }
    }

    useEffect(() => {
        const updateDimensions = () => {
            if (typeof window !== "undefined") {
                setDimensions({
                    width: window.innerWidth,
                    height: window.innerHeight,
                })
            }
        }

        updateDimensions()
        window.addEventListener("resize", updateDimensions)

        return () => {
            window.removeEventListener("resize", updateDimensions)
        }
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || dimensions.width === 0) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        canvas.width = dimensions.width
        canvas.height = dimensions.height

        // Get colors based on variant
        const colors = getGradientColors()

        // Create gradient blobs
        const blobs = [
            {
                x: dimensions.width * 0.2,
                y: dimensions.height * 0.3,
                radius: dimensions.width * 0.4,
                color: colors.primary,
                speed: 0.0005,
                angle: 0,
            },
            {
                x: dimensions.width * 0.8,
                y: dimensions.height * 0.5,
                radius: dimensions.width * 0.3,
                color: colors.secondary,
                speed: 0.0007,
                angle: Math.PI,
            },
            {
                x: dimensions.width * 0.5,
                y: dimensions.height * 0.8,
                radius: dimensions.width * 0.35,
                color: colors.accent,
                speed: 0.0003,
                angle: Math.PI / 2,
            },
        ]

        // Animation function
        const animate = () => {
            // Clear canvas with a dark base color
            ctx.fillStyle = "#0a0118" // Very dark purple/blue base
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Update and draw blobs
            blobs.forEach((blob) => {
                // Update position with gentle floating motion
                blob.angle += blob.speed
                blob.x = blob.x + Math.sin(blob.angle) * 20
                blob.y = blob.y + Math.cos(blob.angle) * 20

                // Create radial gradient
                const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius)

                // Add color stops with transparency
                gradient.addColorStop(0, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0.4)`)
                gradient.addColorStop(0.5, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0.1)`)
                gradient.addColorStop(1, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`)

                // Draw blob
                ctx.fillStyle = gradient
                ctx.beginPath()
                ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2)
                ctx.fill()
            })

            // Add subtle noise texture
            // This is a simplified version - for real noise, you'd use a more complex algorithm
            for (let i = 0; i < 1000; i++) {
                const x = Math.random() * canvas.width
                const y = Math.random() * canvas.height
                const opacity = Math.random() * 0.02 // Very subtle
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
                ctx.fillRect(x, y, 1, 1)
            }

            requestAnimationFrame(animate)
        }

        animate()
    }, [dimensions, variant])

    return (
        <div className="creative-gradient-background">
            {/* Base gradient for non-JS fallback */}
            <div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{
                    background:
                        variant === "profile"
                            ? "radial-gradient(circle at 30% 30%, rgba(80, 30, 120, 0.3) 0%, rgba(30, 10, 60, 0.1) 50%, rgba(15, 20, 50, 0) 100%), linear-gradient(to bottom, #0a0118, #0c0a20)"
                            : variant === "upload"
                                ? "radial-gradient(circle at 70% 20%, rgba(100, 40, 150, 0.3) 0%, rgba(20, 10, 50, 0.1) 50%, rgba(10, 15, 40, 0) 100%), linear-gradient(to bottom, #0a0118, #0d0d2c)"
                                : variant === "invest"
                                    ? "radial-gradient(circle at 50% 50%, rgba(20, 30, 100, 0.3) 0%, rgba(10, 15, 60, 0.1) 50%, rgba(30, 10, 50, 0) 100%), linear-gradient(to bottom, #0a0118, #0f0d28)"
                                    : "radial-gradient(circle at 20% 80%, rgba(60, 20, 100, 0.3) 0%, rgba(15, 10, 40, 0.1) 50%, rgba(30, 15, 60, 0) 100%), linear-gradient(to bottom, #0a0118, #0c0a20)",
                }}
            />

            {/* Canvas for animated gradient */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.8 }} />

            {/* Noise texture overlay */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: "url('/noise-texture.jpg')",
                    backgroundRepeat: "repeat",
                    mixBlendMode: "overlay",
                }}
            />

            {/* Content */}
            <div className="relative z-10 text-white">{children}</div>
        </div>
    )
}
