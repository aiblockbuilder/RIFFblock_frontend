"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useWeb3Modal } from "@web3modal/wagmi/react"
import { useAccount, useBalance, useDisconnect, useChainId, useEnsName, useEnsAvatar } from "wagmi"
import { formatAddress, getNetworkInfo } from "@/lib/walletConfig"

interface WalletConnectProps {
    variant?: "default" | "outline"
    size?: "default" | "sm" | "lg"
    className?: string
    onConnected?: () => void
    onDisconnected?: () => void
    customConnectedButton?: React.ReactNode
}

export default function WalletConnect({
    variant = "default",
    size = "default",
    className = "",
    onConnected,
    onDisconnected,
    customConnectedButton,
}: WalletConnectProps) {
    const [isMounted, setIsMounted] = useState(false)

    // Web3Modal hook
    const { open } = useWeb3Modal()

    // Wagmi hooks
    const { address, isConnected } = useAccount({
        onConnect: () => {
            if (onConnected) onConnected()
        },
        onDisconnect: () => {
            if (onDisconnected) onDisconnected()
        },
    })
    const chainId = useChainId()
    const { disconnect } = useDisconnect()
    const { data: balanceData } = useBalance({
        address,
    })

    // ENS integration
    const { data: ensName } = useEnsName({
        address,
        chainId: 1, // ENS is only on Ethereum mainnet
    })

    const { data: ensAvatar } = useEnsAvatar({
        name: ensName,
        chainId: 1, // ENS is only on Ethereum mainnet
    })

    // Set mounted state for client-side rendering
    useEffect(() => {
        setIsMounted(true)
        return () => setIsMounted(false)
    }, [])

    // Copy address to clipboard
    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address)
            toast({
                title: "Address Copied",
                description: "Wallet address copied to clipboard.",
            })
        }
    }

    // View on explorer
    const viewOnExplorer = () => {
        if (!address || !chainId) return

        const networkInfo = getNetworkInfo(chainId)
        window.open(`${networkInfo.blockExplorer}/address/${address}`, "_blank")
    }

    // Handle disconnect
    const handleDisconnect = () => {
        disconnect()
        toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected",
        })
    }

    // Display name (ENS or formatted address)
    const displayName = ensName || (address ? formatAddress(address) : "")

    // If not client-side yet, show nothing
    if (!isMounted) {
        return null
    }

    // If connected, show wallet info or custom connected button if provided
    if (isConnected && address) {
        if (customConnectedButton) {
            return customConnectedButton
        }

        const networkInfo = getNetworkInfo(chainId)
        const formattedBalance = balanceData ? Number.parseFloat(balanceData.formatted).toFixed(4) : "0.00"

        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant={variant === "default" ? "default" : "outline"}
                            size={size}
                            className={`bg-gradient-to-r from-violet-600/90 to-blue-500/90 hover:from-violet-700/90 hover:to-blue-600/90 ${className}`}
                        >
                            <div className="flex items-center gap-2">
                                {ensAvatar ? (
                                    <Image
                                        src={ensAvatar || "/placeholder.svg"}
                                        alt={ensName || "ENS Avatar"}
                                        width={16}
                                        height={16}
                                        className="rounded-full"
                                    />
                                ) : networkInfo.icon ? (
                                    <Image
                                        src={networkInfo.icon || "/placeholder.svg"}
                                        alt={networkInfo.name}
                                        width={16}
                                        height={16}
                                        className="rounded-full"
                                    />
                                ) : null}
                                <span>{displayName}</span>
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="text-sm font-normal text-zinc-400">Connected Wallet</span>
                                <div className="flex items-center gap-2">
                                    {ensAvatar && (
                                        <Image
                                            src={ensAvatar || "/placeholder.svg"}
                                            alt={ensName || "ENS Avatar"}
                                            width={16}
                                            height={16}
                                            className="rounded-full"
                                        />
                                    )}
                                    <span className="font-medium">{displayName}</span>
                                </div>
                                {ensName && address && <span className="text-xs text-zinc-500 mt-1">{formatAddress(address)}</span>}
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="text-sm font-normal text-zinc-400">Network</span>
                                <span className="font-medium">{networkInfo.name || "Unknown"}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="text-sm font-normal text-zinc-400">Balance</span>
                                <span className="font-medium">
                                    {formattedBalance} {networkInfo.symbol}
                                </span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
                            <Copy className="mr-2 h-4 w-4" />
                            <span>Copy Address</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={viewOnExplorer} className="cursor-pointer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>View on Explorer</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem onClick={handleDisconnect} className="text-red-500 cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Disconnect</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </>
        )
    }

    // If not connected, show connect button
    return (
        <Button
            variant={variant === "default" ? "default" : "outline"}
            size={size}
            className={`${variant === "default"
                ? "bg-gradient-to-r from-violet-600/90 to-blue-500/90 hover:from-violet-700/90 hover:to-blue-600/90"
                : "border-violet-500/50 text-violet-500 hover:bg-violet-500/10"
                } ${className}`}
            onClick={() => open()}
        >
            <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                <span>Connect Wallet</span>
            </div>
        </Button>
    )
}
