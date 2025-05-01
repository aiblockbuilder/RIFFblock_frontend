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
import { useWeb3 } from "@/lib/web3-provider"
import WalletSelectionModal from "@/components/wallet-selection-modal"
import Image from "next/image"

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
  const [currentNetwork, setCurrentNetwork] = useState<string | null>(null)
  const [walletBalance, setWalletBalance] = useState("0.00")

  // Use our web3 context
  const { address, isConnected, isConnecting, walletType, connect, connectWithWallet, disconnect, chainId } = useWeb3()

  // Set mounted state for client-side rendering
  useEffect(() => {
    setIsMounted(true)

    // Listen for custom event to open wallet modal
    const handleOpenModal = () => setIsModalOpen(true)
    document.addEventListener("open-wallet-modal", handleOpenModal)

    return () => {
      setIsMounted(false)
      document.removeEventListener("open-wallet-modal", handleOpenModal)
    }
  }, [])

  // Update network information when chainId changes
  useEffect(() => {
    if (chainId) {
      updateNetworkName(chainId)
    }
  }, [chainId])

  // Update network name based on chainId
  const updateNetworkName = (chainId: number) => {
    let networkName = "Unknown Network"

    switch (chainId) {
      case 1:
        networkName = "Ethereum"
        break
      case 137:
        networkName = "Polygon"
        break
      case 42161:
        networkName = "Arbitrum"
        break
      case 10:
        networkName = "Optimism"
        break
      case 80001:
        networkName = "Polygon Mumbai"
        break
      default:
        networkName = `Chain ID: ${chainId}`
    }

    setCurrentNetwork(networkName)
  }

  // Effect for handling connection status changes
  useEffect(() => {
    if (isConnected) {
      // Generate mock balance for demo purposes
      const randomBalance = (Math.random() * 10).toFixed(4)
      setWalletBalance(randomBalance)

      // Call onConnected callback if provided
      if (onConnected) {
        onConnected()
      }
    } else {
      // Reset state when disconnected
      setWalletBalance("0.00")
      setCurrentNetwork(null)

      // Call onDisconnected callback if provided
      if (onDisconnected && isMounted) {
        onDisconnected()
      }
    }
  }, [isConnected, address, onConnected, onDisconnected, isMounted])

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

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

  // View on explorer (mock function)
  const viewOnExplorer = () => {
    if (!address) return

    // Use the appropriate explorer based on the current network
    let explorerUrl = "https://polygonscan.com"

    if (currentNetwork === "Ethereum") {
      explorerUrl = "https://etherscan.io"
    } else if (currentNetwork === "Arbitrum") {
      explorerUrl = "https://arbiscan.io"
    } else if (currentNetwork === "Optimism") {
      explorerUrl = "https://optimistic.etherscan.io"
    } else if (currentNetwork === "Polygon Mumbai") {
      explorerUrl = "https://mumbai.polygonscan.com"
    }

    window.open(`${explorerUrl}/address/${address}`, "_blank")
  }

  // Handle wallet selection
  const handleWalletSelect = async (type: "metamask" | "walletconnect") => {
    await connectWithWallet(type)
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
                {walletType === "metamask" ? (
                  <Image
                    src="/images/metamask-logo.png"
                    alt="MetaMask"
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                ) : (
                  <Image
                    src="/images/walletconnect-logo.png"
                    alt="WalletConnect"
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
                <div className="flex items-center gap-2">
                  {walletType === "metamask" ? (
                    <Image
                      src="/images/metamask-logo.png"
                      alt="MetaMask"
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  ) : (
                    <Image
                      src="/images/walletconnect-logo.png"
                      alt="WalletConnect"
                      width={16}
                      height={16}
                      className="rounded-full"
                    />
                  )}
                  <span className="font-medium">{formatAddress(address)}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-normal text-zinc-400">Network</span>
                <span className="font-medium">{currentNetwork || "Unknown"}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-normal text-zinc-400">Balance</span>
                <span className="font-medium">
                  {walletBalance}{" "}
                  {currentNetwork === "Polygon" || currentNetwork === "Polygon Mumbai" ? "MATIC" : "ETH"}
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

        {/* Wallet Selection Modal */}
        <WalletSelectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelectWallet={handleWalletSelect}
        />
      </>
    )
  }

  // If not connected, show connect button
  return (
    <>
      <Button
        variant={variant === "default" ? "default" : "outline"}
        size={size}
        className={`${
          variant === "default"
            ? "bg-gradient-to-r from-violet-600/90 to-blue-500/90 hover:from-violet-700/90 hover:to-blue-600/90"
            : "border-violet-500/50 text-violet-500 hover:bg-violet-500/10"
        } ${className}`}
        onClick={() => setIsModalOpen(true)}
        disabled={isConnecting}
      >
        {isConnecting ? (
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
      <WalletSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectWallet={handleWalletSelect}
      />
    </>
  )
}
