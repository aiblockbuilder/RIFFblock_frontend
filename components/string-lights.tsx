"use client"

import { useCallback, useEffect, useState } from "react"
import { motion } from "framer-motion"

interface Light {
    position: number
    delay: number
    size: number
    brightness: number
    dropHeight: number
}

export default function StringLights() {
    const [lights, setLights] = useState<Light[]>([])

    const generateLights = useCallback(() => {
        const width = window.innerWidth
        const count = Math.max(10, Math.floor(width / 80))

        const newLights = Array.from({ length: count }).map((_, index) => ({
            position: (index / (count - 1)) * 100,
            delay: Math.random() * 5,
            size: Math.random() * 0.4 + 0.8,
            brightness: Math.random() * 0.3 + 0.7,
            dropHeight: Math.random() * 10 + 5
        }))

        setLights(newLights)
    }, [])

    useEffect(() => {
        generateLights()
        window.addEventListener("resize", generateLights)
        return () => window.removeEventListener("resize", generateLights)
    }, [generateLights])

    return (
        <div className="relative w-full h-16 overflow-hidden">
            {/* Wire */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gray-600" />

            {lights.map((light, index) => (
                <motion.div
                    key={index}
                    className="absolute top-0"
                    style={{
                        left: `${light.position}%`,
                        transform: `translateY(${light.dropHeight}px)`,
                    }}
                    initial={{ y: -light.dropHeight - 20 }}
                    animate={{
                        y: light.dropHeight,
                        transition: {
                            duration: 0.5,
                            delay: light.delay,
                            type: "spring",
                            stiffness: 100,
                            damping: 10,
                        }
                    }}
                >
                    <div
                        className="w-px bg-gray-600"
                        style={{ height: `${light.dropHeight}px` }}
                    />
                    <div
                        className="w-3 h-3 rounded-full bg-amber-400 absolute top-0 -translate-x-1/2"
                        style={{
                            ...({ "--delay": `${light.delay}s` } as React.CSSProperties),
                            transform: `scale(${light.size})`,
                            opacity: light.brightness,
                            boxShadow: `0 0 ${2 * light.brightness}px rgba(255, 183, 77, ${0.6 * light.brightness})`,
                        }}
                    />
                </motion.div>
            ))}

            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-stone-950 to-transparent z-10" />
        </div>
    )
}
