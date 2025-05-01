"use client"

import { WagmiConfig, createConfig, configureChains } from "wagmi"
import { mainnet, polygon } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { WalletProvider } from "@/components/wallet/WalletProvider"
import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { WALLET_CONNECT_PROJECT_ID } from "@/lib/types/constants"

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains([mainnet, polygon], [publicProvider()])

// Set up wagmi config
const config = createConfig({
    autoConnect: true,
    connectors: [
        new MetaMaskConnector({ chains }),
        new WalletConnectConnector({
            chains,
            options: {
                projectId: WALLET_CONNECT_PROJECT_ID,
                metadata: {
                    name: "RIFFblock",
                    description: "RIFFblock - Own the Future of Music",
                    url: "https://riffblock.com",
                    icons: ["https://riffblock.com/logo.png"],
                },
            },
        }),
    ],
    publicClient,
    webSocketPublicClient,
})

export function Providers({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <WagmiConfig config={config}>
            <WalletProvider>{mounted ? children : null}</WalletProvider>
        </WagmiConfig>
    )
}
