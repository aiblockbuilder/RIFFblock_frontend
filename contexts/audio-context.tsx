"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AudioContextType {
    playingRiffId: string | null
    playRiff: (id: string, audioUrl: string) => void
    pauseRiff: () => void
    isPlaying: boolean
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

export function AudioProvider({ children }: { children: ReactNode }) {
    const [playingRiffId, setPlayingRiffId] = useState<string | null>(null)
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)

    useEffect(() => {
        // Clean up audio element on unmount
        return () => {
            if (audioElement) {
                audioElement.pause()
                audioElement.src = ""
            }
        }
    }, [audioElement])

    const playRiff = (id: string, audioUrl: string) => {
        // If we're already playing this riff, pause it
        if (playingRiffId === id && audioElement) {
            pauseRiff()
            return
        }

        // If we're playing a different riff, stop it first
        if (audioElement) {
            audioElement.pause()
        }

        // Create a new audio element
        const audio = new Audio(audioUrl)
        audio.addEventListener("ended", () => {
            setPlayingRiffId(null)
            setIsPlaying(false)
        })

        audio.addEventListener("play", () => {
            setIsPlaying(true)
        })

        audio.addEventListener("pause", () => {
            setIsPlaying(false)
        })

        // Play the new audio
        audio.play().catch((error) => {
            console.error("Error playing audio:", error)
        })

        setAudioElement(audio)
        setPlayingRiffId(id)
    }

    const pauseRiff = () => {
        if (audioElement) {
            audioElement.pause()
        }
        setPlayingRiffId(null)
    }

    return (
        <AudioContext.Provider value={{ playingRiffId, playRiff, pauseRiff, isPlaying }}>{children}</AudioContext.Provider>
    )
}

export function useAudio() {
    const context = useContext(AudioContext)
    if (context === undefined) {
        throw new Error("useAudio must be used within an AudioProvider")
    }
    return context
}
