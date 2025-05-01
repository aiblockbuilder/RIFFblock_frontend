"use client"

import { useEffect, useRef, useState } from "react"

interface NeonBarsAnimationProps {
  speed?: number
  intensity?: number
}

export default function NeonBarsAnimation({ speed = 1, intensity = 1 }: NeonBarsAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Debug flag - set to true to log animation status
    const DEBUG = false

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

    // Mouse movement handler
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
        active: true,
      })
    }

    // Touch movement handler for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        setMousePosition({
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          active: true,
        })
      }
    }

    // Handle mouse/touch leave
    const handleLeave = () => {
      setMousePosition((prev) => ({ ...prev, active: false }))
    }

    // Add event listeners
    window.addEventListener("resize", handleResize)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("touchmove", handleTouchMove, { passive: true })
    canvas.addEventListener("mouseleave", handleLeave)
    canvas.addEventListener("touchend", handleLeave)

    // Create bar layers for depth effect - adjusted to ensure full width coverage
    const barLayers = [
      {
        barCount: 150, // Increased count to ensure full width coverage
        barWidth: 2, // Thinner bars
        gapWidth: 4, // Reduced gap to fit more bars
        baseHeight: 0.05, // Smaller base height for more variation
        amplitudeScale: 0.35 * intensity, // Higher amplitude for taller bars
        horizontalSpeed: 0.02 * speed, // Slower horizontal movement
        verticalSpeed: 0.08 * speed, // Moderate vertical fluctuation
        verticalPhaseOffset: 0, // Phase offset for vertical movement
        y: 0.6, // Vertical position (0-1)
        opacity: 0.9, // Higher opacity for brighter bars
        colors: [
          [255, 100, 255], // Bright magenta/pink (left side)
          [50, 150, 255], // Bright blue (right side)
        ],
        glowIntensity: 20, // Stronger glow
        glowOpacity: 0.8, // Higher glow opacity
        // Vertical movement parameters - refined for more subtle, calming effect
        verticalMovementScale: 0.08 * intensity, // Scale of vertical movement (smaller for more subtle)
        // Mouse interaction parameters
        mouseInfluenceRadius: 200, // How far the mouse influence reaches
        mouseInfluenceStrength: 0.4, // How strong the mouse influence is
      },
      {
        barCount: 180,
        barWidth: 2,
        gapWidth: 3,
        baseHeight: 0.04,
        amplitudeScale: 0.3 * intensity,
        horizontalSpeed: 0.015 * speed,
        verticalSpeed: 0.06 * speed,
        verticalPhaseOffset: 2.1,
        y: 0.6,
        opacity: 0.85,
        colors: [
          [200, 100, 255], // Purple
          [0, 150, 255], // Blue
        ],
        glowIntensity: 18,
        glowOpacity: 0.7,
        verticalMovementScale: 0.07 * intensity,
        mouseInfluenceRadius: 180,
        mouseInfluenceStrength: 0.3,
      },
      {
        barCount: 200,
        barWidth: 1.5,
        gapWidth: 2.5,
        baseHeight: 0.03,
        amplitudeScale: 0.25 * intensity,
        horizontalSpeed: 0.01 * speed,
        verticalSpeed: 0.05 * speed,
        verticalPhaseOffset: 4.2,
        y: 0.6,
        opacity: 0.8,
        colors: [
          [180, 50, 220], // Purple
          [100, 200, 255], // Light blue
        ],
        glowIntensity: 15,
        glowOpacity: 0.6,
        verticalMovementScale: 0.06 * intensity,
        mouseInfluenceRadius: 160,
        mouseInfluenceStrength: 0.2,
      },
    ]

    // Generate unique oscillation parameters for each bar
    // This creates the desynchronized, organic movement
    const generateOscillationParams = () => {
      const params = []

      // For each layer
      for (const layer of barLayers) {
        const layerParams = []

        // For each bar in the layer
        for (let i = 0; i < layer.barCount; i++) {
          // Create unique parameters for this bar with much more variation
          layerParams.push({
            // Base frequency - wider range for more desynchronization
            baseFreq: 0.015 + Math.random() * 0.015, // 0.015-0.03 range for more variation

            // Secondary frequencies with more variation
            freq1: 0.008 + Math.random() * 0.007, // Wider range
            freq2: 0.005 + Math.random() * 0.006, // Wider range
            freq3: 0.003 + Math.random() * 0.004, // New tertiary frequency

            // Phase offsets with full range for maximum desynchronization
            phase1: Math.random() * Math.PI * 2,
            phase2: Math.random() * Math.PI * 2,
            phase3: Math.random() * Math.PI * 2,
            phase4: Math.random() * Math.PI * 2, // Additional phase offset

            // Amplitude multipliers with more variation
            amp1: 0.5 + Math.random() * 0.5, // More variation (0.5-1.0)
            amp2: 0.15 + Math.random() * 0.15, // More variation (0.15-0.3)
            amp3: 0.05 + Math.random() * 0.1, // More variation (0.05-0.15)

            // Individual time offsets for each bar (crucial for desynchronization)
            timeOffset: Math.random() * 10, // Random time offset (0-10 seconds)

            // Individual vertical scaling factor
            verticalScale: 0.8 + Math.random() * 0.4, // 0.8-1.2 range

            // Random "personality" factor that affects behavior
            personality: Math.random(), // 0-1 random value for behavioral variations
          })
        }

        params.push(layerParams)
      }

      return params
    }

    // Generate oscillation parameters once at initialization
    const oscillationParams = generateOscillationParams()

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
      const particleCount = Math.floor(window.innerWidth * window.innerHeight * 0.00012) // Sparse density
      particles.length = 0

      for (let i = 0; i < particleCount; i++) {
        const colorType = Math.random()
        let color: [number, number, number]

        if (colorType < 0.3) {
          color = [255, 255, 255] // White
        } else if (colorType < 0.5) {
          color = [255, 200, 100] // Soft gold
        } else if (colorType < 0.7) {
          color = [255, 150, 220] // Warm pink
        } else if (colorType < 0.9) {
          color = [150, 200, 255] // Soft blue
        } else {
          color = [180, 100, 255] // Magenta
        }

        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: 0.5 + Math.random() * 1.5,
          speed: 0.1 + Math.random() * 0.2,
          opacity: 0.1 + Math.random() * 0.4,
          color,
          twinkleSpeed: 0.01 + Math.random() * 0.02,
        })
      }
    }

    initParticles()

    // Draw cosmic background
    const drawBackground = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Create a dark gradient background like in the reference image
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      gradient.addColorStop(0, "rgba(15, 5, 25, 1)") // Dark purple (left)
      gradient.addColorStop(0.4, "rgba(10, 10, 30, 1)") // Dark blue-purple (middle)
      gradient.addColorStop(1, "rgba(5, 15, 35, 1)") // Dark blue (right)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      // Add subtle horizontal line for the reflection surface
      ctx.beginPath()
      ctx.moveTo(0, height * 0.6)
      ctx.lineTo(width, height * 0.6)
      ctx.strokeStyle = "rgba(100, 100, 150, 0.1)"
      ctx.lineWidth = 1
      ctx.stroke()

      // Add very subtle star field
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width
        const y = Math.random() * height * 0.5 // Stars only in the top half
        const size = Math.random() * 0.5
        const opacity = Math.random() * 0.1

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()
      }
    }

    // Draw particles
    const drawParticles = (currentTime: number) => {
      particles.forEach((particle) => {
        // Move particle slowly upward
        particle.y -= particle.speed

        // Reset if off screen
        if (particle.y < -10) {
          particle.y = window.innerHeight + 10
          particle.x = Math.random() * window.innerWidth
        }

        // Twinkle effect - vary opacity sinusoidally
        const twinkle = 0.5 + Math.sin(currentTime * particle.twinkleSpeed) * 0.5
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

    // Enhanced easing function for even smoother, more natural movement
    // This creates a very gentle acceleration and deceleration
    const easeInOutQuint = (t: number): number => {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
    }

    // Calculate mouse influence on a bar
    const calculateMouseInfluence = (
      x: number,
      mouseX: number,
      mouseY: number,
      baseY: number,
      radius: number,
      strength: number,
      active: boolean,
    ) => {
      const height = window.innerHeight
      if (!active) return 0

      // Calculate distance from mouse to bar
      const dx = x - mouseX
      const dy = baseY - mouseY
      const distance = Math.sqrt(dx * dx + dy * dy)

      // If within influence radius, calculate influence
      if (distance < radius) {
        // Smooth falloff based on distance (stronger closer to mouse)
        const falloff = 1 - distance / radius

        // Apply easing for smoother effect
        const easedFalloff = easeInOutQuint(falloff)

        // Calculate influence - stronger upward pull when mouse is closer
        return easedFalloff * strength * height * 0.3
      }

      return 0
    }

    // Pseudo-random function based on bar index and time
    // This creates deterministic but seemingly random variations
    const pseudoRandom = (index: number, seed: number, time: number) => {
      return Math.sin(index * 12.9898 + seed * 78.233 + time * 0.1) * 0.5 + 0.5
    }

    // Draw a single layer of neon bars
    const drawBarLayer = (layer: (typeof barLayers)[0], layerIndex: number, currentTime: number) => {
      const width = window.innerWidth
      const height = window.innerHeight

      // Calculate total width needed for bars
      const totalWidth = width + (layer.barWidth + layer.gapWidth) * 10 // Add extra width to ensure full coverage
      const totalBars = Math.ceil(totalWidth / (layer.barWidth + layer.gapWidth))

      // Calculate horizontal offset based on time (for slow horizontal movement)
      // Multiply by a larger factor to make movement more noticeable - now 5x faster
      const baseHorizontalMovement = (currentTime * 0.01 * speed) % width // Base movement from left to right
      const oscillationMovement = (currentTime * layer.horizontalSpeed * 10) % (layer.barWidth + layer.gapWidth) // Oscillation
      const horizontalOffset = oscillationMovement + baseHorizontalMovement * 0.25 // Combine movements with increased amplitude

      // Calculate base y position - position it higher to make room for reflection
      const baseY = height * layer.y * 0.85

      // Draw each bar
      for (let i = 0; i < totalBars; i++) {
        // Calculate x position with horizontal movement
        const x = i * (layer.barWidth + layer.gapWidth) - horizontalOffset

        // Skip if off screen
        if (x < -layer.barWidth || x > width) continue

        // Get the oscillation parameters for this specific bar
        const params = oscillationParams[layerIndex][i % layer.barCount]

        // Apply individual time offset for desynchronization
        const individualTime = currentTime + params.timeOffset

        // Generate real-time random variations (subtle)
        const realTimeVariation = pseudoRandom(i, layerIndex, currentTime) * 0.1 - 0.05

        // Calculate organic vertical movement using the bar's unique parameters
        // This creates gentle, desynchronized up/down motion

        // Primary slow oscillation with individual time offset
        const primaryOsc = Math.sin(individualTime * params.baseFreq * speed * 5 + params.phase1) * params.amp1

        // Secondary oscillations for more organic movement
        const secondaryOsc = Math.sin(individualTime * params.freq1 * speed * 5 + params.phase2) * params.amp2
        const tertiaryOsc = Math.sin(individualTime * params.freq2 * speed * 5 + params.phase3) * params.amp3

        // New quaternary oscillation for even more complexity
        const quaternaryOsc = Math.sin(individualTime * params.freq3 * speed * 5 + params.phase4) * params.amp3 * 0.5

        // Combine oscillations and apply enhanced easing for smoother, more natural movement
        const combinedOsc = primaryOsc + secondaryOsc + tertiaryOsc + quaternaryOsc + realTimeVariation
        const easedOsc = easeInOutQuint((combinedOsc + 1) / 2) * 2 - 1

        // Apply the oscillation to the bar's amplitude with individual scaling
        const verticalOffset = easedOsc * layer.verticalMovementScale * height * 2 * params.verticalScale

        // Calculate mouse influence on this bar
        const mouseInfluence = calculateMouseInfluence(
          x,
          mousePosition.x,
          mousePosition.y,
          baseY,
          layer.mouseInfluenceRadius,
          layer.mouseInfluenceStrength * (0.8 + params.personality * 0.4), // Vary influence by personality
          mousePosition.active,
        )

        // Calculate bar height with base height, amplitude, and mouse influence
        // The base pattern is maintained while adding the gentle vertical movement
        // Add individual variation to the pattern amplitude
        const barPhase = (i / totalBars) * Math.PI * 4 + layer.verticalPhaseOffset + params.phase1 * 0.2
        const patternAmplitude = Math.sin(barPhase) * layer.amplitudeScale * height * (0.9 + params.personality * 0.2)

        // Calculate final bar height with all factors
        const barHeight = layer.baseHeight * height + patternAmplitude + verticalOffset + mouseInfluence

        // Calculate color based on position (left to right gradient like in the reference image)
        // This creates a gradient from purple/magenta on the left to blue on the right
        const colorPos = x / width
        const color1 = layer.colors[0]
        const color2 = layer.colors[1]

        // Interpolate between colors
        const r = Math.floor(color1[0] + (color2[0] - color1[0]) * colorPos)
        const g = Math.floor(color1[1] + (color2[1] - color1[1]) * colorPos)
        const b = Math.floor(color1[2] + (color2[2] - color1[2]) * colorPos)

        // Calculate opacity with slight variation based on individual time
        const barOpacity = layer.opacity * (0.8 + Math.sin(individualTime * 0.5 + i * 0.1) * 0.2)

        // Enhance glow and brightness when influenced by mouse
        const mouseGlowBoost = mouseInfluence > 0 ? (mouseInfluence / (height * 0.3)) * 0.5 : 0
        const adjustedGlowIntensity = layer.glowIntensity * (1 + mouseGlowBoost)
        const adjustedGlowOpacity = layer.glowOpacity * (1 + mouseGlowBoost * 0.5)

        // Draw neon bar with glow
        ctx.save()

        // Set shadow for glow effect - stronger glow to match reference
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${adjustedGlowOpacity * 1.5})`
        ctx.shadowBlur = adjustedGlowIntensity * 1.5
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        // Draw bar - thinner than before to match reference
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${barOpacity})`
        ctx.fillRect(x, baseY - barHeight, layer.barWidth * 0.7, barHeight)

        // Draw brighter core of the neon
        ctx.shadowBlur = adjustedGlowIntensity
        ctx.fillStyle = `rgba(${Math.min(255, r + 80)}, ${Math.min(255, g + 80)}, ${Math.min(255, b + 80)}, ${
          barOpacity * 1.5
        })`
        ctx.fillRect(x + layer.barWidth * 0.3, baseY - barHeight, layer.barWidth * 0.4, barHeight)

        // Draw reflection
        ctx.shadowBlur = adjustedGlowIntensity * 0.7

        // Create reflection gradient
        const reflectionGradient = ctx.createLinearGradient(0, baseY, 0, baseY + barHeight * 0.7)
        reflectionGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${barOpacity * 0.8})`)
        reflectionGradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)

        ctx.fillStyle = reflectionGradient

        // Draw reflection (flipped and faded)
        ctx.beginPath()
        ctx.moveTo(x, baseY)
        ctx.lineTo(x + layer.barWidth * 0.7, baseY)
        ctx.lineTo(x + layer.barWidth * 0.7, baseY + barHeight * 0.7)
        ctx.lineTo(x, baseY + barHeight * 0.7)
        ctx.closePath()
        ctx.fill()

        ctx.restore()
      }
    }

    // Draw mouse cursor effect (subtle glow following the cursor)
    const drawMouseEffect = () => {
      if (!mousePosition.active) return

      const { x, y } = mousePosition

      // Create a subtle glow effect around the cursor
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 100)
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.2)")
      gradient.addColorStop(0.5, "rgba(180, 100, 255, 0.1)")
      gradient.addColorStop(1, "rgba(100, 150, 255, 0)")

      ctx.beginPath()
      ctx.fillStyle = gradient
      ctx.arc(x, y, 100, 0, Math.PI * 2)
      ctx.fill()
    }

    // Main draw function
    const draw = (timestamp: number) => {
      // Calculate elapsed time in seconds
      const currentTime = timestamp * 0.001 // Convert to seconds

      // Calculate delta time for smooth animation
      // const deltaTime = lastTimeRef.current === 0 ? 0.016 : currentTime - lastTimeRef.current
      // lastTimeRef.current = currentTime

      // Store the time for debugging
      timeRef.current = currentTime

      const width = window.innerWidth
      const height = window.innerHeight

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Draw background
      drawBackground()

      // Draw particles (behind bars)
      drawParticles(currentTime)

      // Draw bar layers from back to front
      barLayers.forEach((layer, index) => drawBarLayer(layer, index, currentTime))

      // Draw mouse effect
      drawMouseEffect()

      // Debug output
      if (DEBUG && timestamp % 1000 < 20) {
        console.log(`Animation running: time=${currentTime.toFixed(2)}s`)
      }

      // Continue animation loop
      animationRef.current = requestAnimationFrame(draw)
    }

    // Start animation loop with timestamp
    animationRef.current = requestAnimationFrame(draw)

    // Debug message to confirm animation is starting
    if (DEBUG) {
      console.log("Animation started")
    }

    return () => {
      // Clean up event listeners
      window.removeEventListener("resize", handleResize)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("mouseleave", handleLeave)
      canvas.removeEventListener("touchend", handleLeave)

      // Cancel animation frame
      cancelAnimationFrame(animationRef.current)

      // Debug message to confirm cleanup
      if (DEBUG) {
        console.log("Animation cleaned up")
      }
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
        zIndex: 0,
      }}
    />
  )
}
