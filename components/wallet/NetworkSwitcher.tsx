"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWalletContext } from "@/components/wallet/WalletProvider"
import { SUPPORTED_NETWORKS } from "@/lib/types/wallet"
import Image from "next/image"

interface NetworkSwitcherProps {
    onNetworkChange?: (chainId: number) => void
    className?: string
    variant?: "default" | "outline" | "ghost"
    size?: "default" | "sm" | "lg"
    defaultChainId?: number
}

export default function NetworkSwitcher({
    onNetworkChange,
    className = "",
    variant = "outline",
    size = "default",
    defaultChainId = 137, // Default to Polygon
}: NetworkSwitcherProps) {
    const [isClient, setIsClient] = useState(false)
    const [isWrongNetwork, setIsWrongNetwork] = useState(false)

    // Use our wallet context
    const { chainId, isConnected, switchNetwork, isSwitchingNetwork } = useWalletContext()

    useEffect(() => {
        setIsClient(true)

        // Check if on wrong network when chainId changes
        if (chainId && isConnected) {
            setIsWrongNetwork(chainId !== defaultChainId)

            if (onNetworkChange) {
                onNetworkChange(chainId)
            }
        }
    }, [chainId, defaultChainId, isConnected, onNetworkChange])

    // Get network info
    const getCurrentNetwork = () => {
        if (!chainId) return SUPPORTED_NETWORKS[defaultChainId]
        return SUPPORTED_NETWORKS[chainId] || { name: `Chain ID: ${chainId}`, icon: "" }
    }

    // If not client-side yet, show loading state
    if (!isClient) {
        return (
            <Button variant={variant} size={size} className={className} disabled>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse"></div>
                    <span>Loading...</span>
                </div>
            </Button>
        )
    }

    // If wrong network, show warning button
    if (isWrongNetwork && isConnected && !isSwitchingNetwork) {
        return (
            <Button
                variant="destructive"
                size={size}
                className={`bg-amber-600 hover:bg-amber-700 text-white ${className}`}
                onClick={() => switchNetwork(defaultChainId)}
            >
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Switch to</span> {SUPPORTED_NETWORKS[defaultChainId]?.name}
                </div>
            </Button>
        )
    }

    // Normal network switcher dropdown
    const currentNetwork = getCurrentNetwork()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={variant} size={size} className={className} disabled={!isConnected || isSwitchingNetwork}>
                    <div className="flex items-center gap-2">
                        {isSwitchingNetwork ? (
                            <div className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin"></div>
                        ) : currentNetwork.icon ? (
                            <Image
                                src={currentNetwork.icon || "/placeholder.svg"}
                                alt={currentNetwork.name}
                                width={16}
                                height={16}
                                className="rounded-full"
                            />
                        ) : (
                            <div className="w-4 h-4 rounded-full bg-zinc-400"></div>
                        )}
                        <span>{isSwitchingNetwork ? "Switching..." : currentNetwork.name}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                {Object.values(SUPPORTED_NETWORKS).map((network) => (
                    <DropdownMenuItem
                        key={network.chainId}
                        className="cursor-pointer"
                        onClick={() => switchNetwork(network.chainId)}
                        disabled={chainId === network.chainId}
                    >
                        <div className="flex items-center gap-2 w-full">
                            {network.icon ? (
                                <Image
                                    src={network.icon || "/placeholder.svg"}
                                    alt={network.name}
                                    width={20}
                                    height={20}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-zinc-400"></div>
                            )}
                            <span className="flex-1">
                                {network.name}
                                {network.isTestnet && <span className="text-xs text-zinc-500 ml-1">(Testnet)</span>}
                            </span>
                            {chainId === network.chainId && <Check className="h-4 w-4 text-green-500" />}
                        </div>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
