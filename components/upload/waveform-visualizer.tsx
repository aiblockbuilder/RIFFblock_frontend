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
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!audioUrl) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas dimensions
        canvas.width = canvas.clientWidth * window.devicePixelRatio
        canvas.height = height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

        // Create audio context
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)

        // Load audio
        const audio = new Audio()
        audio.crossOrigin = "anonymous"
        audio.src = audioUrl

        const source = audioContext.createMediaElementSource(audio)
        source.connect(analyser)
        analyser.connect(audioContext.destination)

        // Draw waveform
        const drawWaveform = () => {
            if (!canvas || !ctx) return

            // Clear canvas
            ctx.fillStyle = backgroundColor
            ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight)

            // Get frequency data
            analyser.getByteFrequencyData(dataArray)

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
            requestAnimationFrame(drawWaveform)
        }

        // Handle audio load
        audio.onloadeddata = () => {
            setIsLoading(false)
            drawWaveform()
        }

        // Handle errors
        audio.onerror = () => {
            setIsLoading(false)
            setError("Failed to load audio")
        }

        // Clean up
        return () => {
            audioContext.close()
        }
    }, [audioUrl, height, color, backgroundColor])

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
