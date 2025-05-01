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
import { useWalletContext } from "@/components/wallet/WalletProvider"
import Image from "next/image"
import { SUPPORTED_NETWORKS } from "@/lib/types/wallet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useConnect } from "wagmi"

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
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [connectingConnector, setConnectingConnector] = useState<string | null>(null)

    const { address, chainId, isConnected, balance, networkName, disconnect, formatAddress } = useWalletContext()

    const { connect, connectors, isLoading, pendingConnector } = useConnect({
        onSuccess: () => {
            setIsModalOpen(false)
            setConnectingConnector(null)
        },
        onError: (error) => {
            console.error("Connection error:", error)
            toast({
                title: "Connection Failed",
                description: error.message || "Failed to connect wallet",
                variant: "destructive",
            })
            setConnectingConnector(null)
        },
    })

    // Set mounted state for client-side rendering
    useEffect(() => {
        setIsMounted(true)
        return () => setIsMounted(false)
    }, [])

    // Effect for handling connection status changes
    useEffect(() => {
        if (isConnected) {
            if (onConnected) onConnected()
        } else {
            if (onDisconnected && isMounted) onDisconnected()
        }
    }, [isConnected, onConnected, onDisconnected, isMounted])

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

        const explorerUrl = SUPPORTED_NETWORKS[chainId]?.blockExplorer || "https://etherscan.io"
        window.open(`${explorerUrl}/address/${address}`, "_blank")
    }

    // Get currency symbol based on network
    const getCurrencySymbol = () => {
        if (!chainId) return "ETH"
        return SUPPORTED_NETWORKS[chainId]?.symbol || "ETH"
    }

    // Handle wallet connection
    const handleConnect = (connectorId: string) => {
        const connector = connectors.find((c) => c.id === connectorId)
        if (!connector) return

        setConnectingConnector(connectorId)
        connect({ connector })
    }

    // If not client-side yet, show nothing
    if (!isMounted) {
        return null
    }

    // If connected, show wallet info or custom connected button if provided
    if (isConnected && address) {
        if (customConnectedButton) {
            return customConnectedButton
        }

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
                                {chainId && SUPPORTED_NETWORKS[chainId]?.icon && (
                                    <Image
                                        src={SUPPORTED_NETWORKS[chainId].icon || "/placeholder.svg"}
                                        alt={networkName || "Network"}
                                        width={16}
                                        height={16}
                                        className="rounded-full"
                                    />
                                )}
                                <span>{formatAddress(address)}</span>
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="text-sm font-normal text-zinc-400">Connected Wallet</span>
                                <span className="font-medium">{formatAddress(address)}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="text-sm font-normal text-zinc-400">Network</span>
                                <span className="font-medium">{networkName || "Unknown"}</span>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuLabel>
                            <div className="flex flex-col">
                                <span className="text-sm font-normal text-zinc-400">Balance</span>
                                <span className="font-medium">
                                    {balance || "0.00"} {getCurrencySymbol()}
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
                        <DropdownMenuItem onClick={disconnect} className="text-red-500 cursor-pointer">
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
        <>
            <Button
                variant={variant === "default" ? "default" : "outline"}
                size={size}
                className={`${variant === "default"
                        ? "bg-gradient-to-r from-violet-600/90 to-blue-500/90 hover:from-violet-700/90 hover:to-blue-600/90"
                        : "border-violet-500/50 text-violet-500 hover:bg-violet-500/10"
                    } ${className}`}
                onClick={() => setIsModalOpen(true)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                        <span>Connecting...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>Connect Wallet</span>
                    </div>
                )}
            </Button>

            {/* Wallet Selection Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl font-bold">Connect Wallet</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {connectors.map((connector) => {
                            const isMetaMask = connector.id === "metaMask"
                            const isWalletConnect = connector.id === "walletConnect"

                            if (!isMetaMask && !isWalletConnect) return null

                            return (
                                <Button
                                    key={connector.id}
                                    variant="outline"
                                    className="flex items-center justify-between p-6 h-auto border-zinc-700 hover:border-violet-500 hover:bg-zinc-800"
                                    onClick={() => handleConnect(connector.id)}
                                    disabled={!connector.ready || isLoading}
                                >
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={isMetaMask ? "/images/metamask-logo.png" : "/images/walletconnect-logo.png"}
                                            alt={connector.name}
                                            width={32}
                                            height={32}
                                            className="rounded-md"
                                        />
                                        <div className="text-left">
                                            <div className="font-semibold">{connector.name}</div>
                                            <div className="text-xs text-zinc-400">
                                                {isMetaMask ? "Connect using browser extension" : "Connect using mobile wallet"}
                                            </div>
                                        </div>
                                    </div>
                                    {isLoading && connectingConnector === connector.id && (
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-violet-500"></div>
                                    )}
                                </Button>
                            )
                        })}
                    </div>
                    <div className="text-center text-xs text-zinc-500 mt-2">
                        By connecting your wallet, you agree to our Terms of Service and Privacy Policy
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
