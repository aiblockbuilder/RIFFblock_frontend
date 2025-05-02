"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { config } from "@/lib/walletConfig"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { ThemeProvider } from "@/components/theme-provider"

// Create a client
const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ThemeProvider attribute="class" defaultTheme="dark">
                    {mounted ? children : null}
                </ThemeProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}
