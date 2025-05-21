"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
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
import { useWallet } from "@/contexts/wallet-context"
import { useAuth } from "@/hooks/use-auth"

interface WalletConnectProps {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
  onConnected?: () => void
  onDisconnected?: () => void
  customConnectedButton?: React.ReactNode
}

const WalletConnect = ({
  variant = "default",
  size = "default",
  className = "",
  onConnected,
  onDisconnected,
  customConnectedButton,
}: WalletConnectProps) => {
  const { isConnecting, isConnected, walletAddress, walletType, walletBalance, connectWallet, disconnectWallet } =
    useWallet()
  const { authenticate, isAuthenticating } = useAuth()

  const [showWalletOptions, setShowWalletOptions] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Set mounted state for client-side rendering
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // Call onConnected callback when wallet is connected
  useEffect(() => {
    if (isConnected && onConnected) {
      onConnected()
    }
  }, [isConnected, onConnected])

  // Call onDisconnected callback when wallet is disconnected
  useEffect(() => {
    if (!isConnected && onDisconnected) {
      onDisconnected()
    }
  }, [isConnected, onDisconnected])

  // Authenticate when wallet is connected
  useEffect(() => {
    if (isConnected && walletAddress) {
      authenticate()
    }
  }, [isConnected, walletAddress, authenticate])

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard.",
    })
  }

  // View on explorer (mock function)
  const viewOnExplorer = () => {
    window.open(`https://polygonscan.com/address/${walletAddress}`, "_blank")
  }

  // Wallet Options Modal Component
  const WalletOptionsModal = () => {
    // Handle click outside to close
    const modalRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          setShowWalletOptions(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
    }, [])

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div
          ref={modalRef}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-md mx-4 shadow-xl shadow-black/20 animate-in fade-in duration-200"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Connect Wallet</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowWalletOptions(false)}
              className="text-zinc-400 hover:text-white"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </Button>
          </div>
          <div className="grid gap-4">
            <button
              className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              onClick={() => {
                connectWallet("metamask")
                setShowWalletOptions(false)
              }}
            >
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <img src="/images/metamask-logo.png" alt="MetaMask" className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">MetaMask</h4>
                <p className="text-sm text-zinc-400">Connect using browser wallet</p>
              </div>
            </button>
            <button
              className="flex items-center gap-4 p-4 rounded-lg border border-zinc-800 hover:bg-zinc-800/50 transition-colors"
              onClick={() => {
                connectWallet("walletconnect")
                setShowWalletOptions(false)
              }}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <img src="/images/walletconnect-logo.png" alt="WalletConnect" className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h4 className="font-medium">WalletConnect</h4>
                <p className="text-sm text-zinc-400">Connect using mobile wallet</p>
              </div>
            </button>
          </div>
          <p className="mt-6 text-xs text-center text-zinc-500">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    )
  }

  // If connected, show wallet info or custom connected button if provided
  if (isConnected) {
    if (customConnectedButton) {
      return customConnectedButton
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant === "default" ? "default" : "outline"}
            size={size}
            className={`bg-gradient-to-r from-violet-600/90 to-blue-500/90 hover:from-violet-700/90 hover:to-blue-600/90 ${className}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>{formatAddress(walletAddress)}</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-normal text-zinc-400">Connected Wallet</span>
              <span className="font-medium">{formatAddress(walletAddress)}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-normal text-zinc-400">Balance</span>
              <span className="font-medium">{walletBalance} ETH</span>
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
          <DropdownMenuItem onClick={disconnectWallet} className="text-red-500 cursor-pointer">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
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
        onClick={() => setShowWalletOptions(true)}
        disabled={isConnecting || isAuthenticating}
      >
        {isConnecting || isAuthenticating ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
            <span>{isConnecting ? "Connecting..." : "Authenticating..."}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </div>
        )}
      </Button>

      {/* Render modal with portal to ensure it's at the root level */}
      {isMounted && showWalletOptions && createPortal(<WalletOptionsModal />, document.body)}
    </>
  )
}

export default WalletConnect
