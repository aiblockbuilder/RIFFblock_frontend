"use client"

import { useState } from "react"
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import Image from "next/image"

interface MockWalletConnectProps {
  variant?: "default" | "outline"
  size?: "default" | "sm" | "lg"
  className?: string
}

export default function MockWalletConnect({
  variant = "default",
  size = "default",
  className = "",
}: MockWalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [address, setAddress] = useState("")

  // Mock connect function
  const connect = (walletType: "metamask" | "walletconnect") => {
    setIsConnecting(true)

    // Simulate connection delay
    setTimeout(() => {
      // Generate a mock address
      const mockAddress = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
      setAddress(mockAddress)
      setIsConnected(true)
      setIsConnecting(false)
      setIsModalOpen(false)

      toast({
        title: "Wallet Connected",
        description: `Connected to ${formatAddress(mockAddress)}`,
      })
    }, 1000)
  }

  // Mock disconnect function
  const disconnect = () => {
    setAddress("")
    setIsConnected(false)

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  // Format address for display
  const formatAddress = (addr: string) => {
    if (!addr) return ""
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
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

  // If connected, show wallet info
  if (isConnected && address) {
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
                <Image src="/images/metamask-logo.png" alt="MetaMask" width={16} height={16} className="rounded-full" />
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
                  <Image
                    src="/images/metamask-logo.png"
                    alt="MetaMask"
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                  <span className="font-medium">{formatAddress(address)}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-normal text-zinc-400">Network</span>
                <span className="font-medium">Polygon</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-normal text-zinc-400">Balance</span>
                <span className="font-medium">{(Math.random() * 10).toFixed(4)} MATIC</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Address</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
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
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold">Connect Wallet</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button
                variant="outline"
                className="flex items-center justify-between p-6 h-auto border-zinc-700 hover:border-violet-500 hover:bg-zinc-800"
                onClick={() => connect("metamask")}
                disabled={isConnecting}
              >
                <div className="flex items-center gap-3">
                  <Image src="/images/metamask-logo.png" alt="MetaMask" width={32} height={32} className="rounded-md" />
                  <div className="text-left">
                    <div className="font-semibold">MetaMask</div>
                    <div className="text-xs text-zinc-400">Connect using browser extension</div>
                  </div>
                </div>
                {isConnecting && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-violet-500"></div>
                )}
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-between p-6 h-auto border-zinc-700 hover:border-violet-500 hover:bg-zinc-800"
                onClick={() => connect("walletconnect")}
                disabled={isConnecting}
              >
                <div className="flex items-center gap-3">
                  <Image
                    src="/images/walletconnect-logo.png"
                    alt="WalletConnect"
                    width={32}
                    height={32}
                    className="rounded-md"
                  />
                  <div className="text-left">
                    <div className="font-semibold">WalletConnect</div>
                    <div className="text-xs text-zinc-400">Connect using mobile wallet</div>
                  </div>
                </div>
                {isConnecting && (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-violet-500"></div>
                )}
              </Button>
            </div>
            <div className="text-center text-xs text-zinc-500 mt-2">
              By connecting your wallet, you agree to our Terms of Service and Privacy Policy
            </div>
          </DialogContent>
        </Dialog>
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
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Connect Wallet</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button
              variant="outline"
              className="flex items-center justify-between p-6 h-auto border-zinc-700 hover:border-violet-500 hover:bg-zinc-800"
              onClick={() => connect("metamask")}
              disabled={isConnecting}
            >
              <div className="flex items-center gap-3">
                <Image src="/images/metamask-logo.png" alt="MetaMask" width={32} height={32} className="rounded-md" />
                <div className="text-left">
                  <div className="font-semibold">MetaMask</div>
                  <div className="text-xs text-zinc-400">Connect using browser extension</div>
                </div>
              </div>
              {isConnecting && (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-violet-500"></div>
              )}
            </Button>

            <Button
              variant="outline"
              className="flex items-center justify-between p-6 h-auto border-zinc-700 hover:border-violet-500 hover:bg-zinc-800"
              onClick={() => connect("walletconnect")}
              disabled={isConnecting}
            >
              <div className="flex items-center gap-3">
                <Image
                  src="/images/walletconnect-logo.png"
                  alt="WalletConnect"
                  width={32}
                  height={32}
                  className="rounded-md"
                />
                <div className="text-left">
                  <div className="font-semibold">WalletConnect</div>
                  <div className="text-xs text-zinc-400">Connect using mobile wallet</div>
                </div>
              </div>
              {isConnecting && (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-violet-500"></div>
              )}
            </Button>
          </div>
          <div className="text-center text-xs text-zinc-500 mt-2">
            By connecting your wallet, you agree to our Terms of Service and Privacy Policy
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
