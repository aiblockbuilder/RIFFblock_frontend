"use client"

import { useEffect, useRef, useState } from "react"

interface WaveformVisualizerProps {
    audioUrl: string
    height?: number
    color?: string
    backgroundColor?: string
}

export default function WaveformVisualizer({
    audioUrl,
    height = 80,
    color = "#8b5cf6",
    backgroundColor = "#27272a",
}: WaveformVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
    const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)
    const animationRef = useRef<number | null>(null)

    // Initialize audio context
    useEffect(() => {
        // Create audio context only on user interaction to comply with browser policies
        const handleUserInteraction = () => {
            if (!audioContext) {
                try {
                    const newAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
                    const newAnalyser = newAudioContext.createAnalyser()
                    newAnalyser.fftSize = 256

                    setAudioContext(newAudioContext)
                    setAnalyser(newAnalyser)
                } catch (err) {
                    console.error("Failed to create audio context:", err)
                    setError("Your browser doesn't support audio visualization")
                }
            }
        }

        // Add event listeners for user interaction
        window.addEventListener("click", handleUserInteraction)
        window.addEventListener("touchstart", handleUserInteraction)

        return () => {
            window.removeEventListener("click", handleUserInteraction)
            window.removeEventListener("touchstart", handleUserInteraction)

            // Clean up animation and audio context
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }

            if (audioContext) {
                audioContext.close()
            }
        }
    }, [audioContext])

    // Set up audio and visualization when URL changes
    useEffect(() => {
        if (!audioUrl || !audioContext || !analyser) return

        setIsLoading(true)
        setError(null)

        // Clean up previous animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
        }

        // Create new audio element
        const audio = new Audio()
        audio.crossOrigin = "anonymous"
        audioRef.current = audio

        // Set up audio source and connect to analyser
        const setupAudio = () => {
            try {
                if (!audioContext || !analyser) return

                const source = audioContext.createMediaElementSource(audio)
                source.connect(analyser)
                analyser.connect(audioContext.destination)

                setIsLoading(false)
                drawWaveform()
            } catch (err) {
                console.error("Error setting up audio:", err)
                setError("Failed to process audio")
                setIsLoading(false)
            }
        }

        // Handle audio load events
        audio.onloadeddata = setupAudio

        audio.onerror = () => {
            console.error("Error loading audio:", audio.error)
            setError("Failed to load audio")
            setIsLoading(false)
        }

        // Load the audio file
        audio.src = audioUrl

        // Draw waveform function
        const drawWaveform = () => {
            if (!canvasRef.current || !analyser) return

            const canvas = canvasRef.current
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            // Set canvas dimensions with device pixel ratio for sharp rendering
            const dpr = window.devicePixelRatio || 1
            canvas.width = canvas.clientWidth * dpr
            canvas.height = height * dpr

            // Scale context according to device pixel ratio
            ctx.scale(dpr, dpr)

            // Get frequency data
            const bufferLength = analyser.frequencyBinCount
            const dataArray = new Uint8Array(bufferLength)
            analyser.getByteFrequencyData(dataArray)

            // Clear canvas
            ctx.fillStyle = backgroundColor
            ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

            // Calculate bar width and spacing
            const barCount = bufferLength / 2
            const barWidth = canvas.clientWidth / barCount
            const barSpacing = 1
            const scaleFactor = 0.8 // Scale factor to make bars not too tall

            // Draw bars
            ctx.fillStyle = color

            for (let i = 0; i < barCount; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.clientHeight * scaleFactor
                const x = i * (barWidth + barSpacing)
                const y = (canvas.clientHeight - barHeight) / 2

                // Draw rounded bars
                ctx.beginPath()
                ctx.roundRect(x, y, barWidth, barHeight, [2])
                ctx.fill()
            }

            // Continue animation
            animationRef.current = requestAnimationFrame(drawWaveform)
        }

        // Clean up function
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }

            audio.pause()
            audio.src = ""
        }
    }, [audioUrl, audioContext, analyser, height, color, backgroundColor])

    // Draw static visualization when no audio is playing
    useEffect(() => {
        if (!canvasRef.current || isLoading || error) return

        // If we don't have audio playing, draw a static visualization
        if (!audioUrl || !audioContext || !analyser) {
            const canvas = canvasRef.current
            const ctx = canvas.getContext("2d")
            if (!ctx) return

            // Set canvas dimensions
            const dpr = window.devicePixelRatio || 1
            canvas.width = canvas.clientWidth * dpr
            canvas.height = height * dpr
            ctx.scale(dpr, dpr)

            // Clear canvas
            ctx.fillStyle = backgroundColor
            ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

            // Draw static bars
            ctx.fillStyle = color
            const barCount = 32
            const barWidth = canvas.clientWidth / barCount
            const barSpacing = 1

            for (let i = 0; i < barCount; i++) {
                // Generate random heights for static visualization
                const barHeight = Math.random() * (canvas.clientHeight * 0.6) + canvas.clientHeight * 0.1
                const x = i * (barWidth + barSpacing)
                const y = (canvas.clientHeight - barHeight) / 2

                ctx.beginPath()
                ctx.roundRect(x, y, barWidth, barHeight, [2])
                ctx.fill()
            }
        }
    }, [audioUrl, audioContext, analyser, isLoading, error, height, color, backgroundColor])

    return (
        <div className="w-full relative">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-500 border-t-transparent"></div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-red-500 text-sm">{error}</div>
                </div>
            )}

            <canvas ref={canvasRef} className="w-full rounded-md" style={{ height: `${height}px` }} />
        </div>
    )
}
