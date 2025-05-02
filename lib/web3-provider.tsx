"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { toast } from "@/components/ui/use-toast"

// Mock networks for our demo
const NETWORKS = [
  { id: 1, name: "Ethereum" },
  { id: 137, name: "Polygon" },
  { id: 42161, name: "Arbitrum" },
  { id: 10, name: "Optimism" },
]

// Default to Polygon
const DEFAULT_NETWORK_ID = 137

// Create context for wallet connection
interface Web3ContextType {
  address: string | undefined
  isConnected: boolean
  isConnecting: boolean
  walletType: "metamask" | "walletconnect" | null
  connect: () => void
  connectWithWallet: (walletType: "metamask" | "walletconnect") => Promise<void>
  disconnect: () => void
  chainId: number | undefined
}

const Web3Context = createContext<Web3ContextType>({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  walletType: null,
  connect: () => {},
  connectWithWallet: async () => {},
  disconnect: () => {},
  chainId: undefined,
})

export const useWeb3 = () => useContext(Web3Context)

export function Web3Provider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | undefined>(undefined)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletType, setWalletType] = useState<"metamask" | "walletconnect" | null>(null)
  const [chainId, setChainId] = useState<number | undefined>(DEFAULT_NETWORK_ID)

  // Mock connect function - this will open the wallet selection modal
  const connect = () => {
    // This function now just triggers the modal to open
    // The actual connection happens in connectWithWallet
    document.dispatchEvent(new CustomEvent("open-wallet-modal"))
  }

  // Connect with specific wallet type
  const connectWithWallet = async (type: "metamask" | "walletconnect") => {
    setIsConnecting(true)
    setWalletType(type)

    try {
      // Simulate connection delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a mock Ethereum address
      const mockAddress = "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")

      setAddress(mockAddress)
      setIsConnected(true)

      toast({
        title: `${type === "metamask" ? "MetaMask" : "WalletConnect"} Connected`,
        description: `Connected to ${formatAddress(mockAddress)}`,
      })
    } catch (error) {
      console.error("Connection error:", error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // Mock disconnect function
  const disconnect = () => {
    setAddress(undefined)
    setIsConnected(false)
    setWalletType(null)

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

  return (
    <Web3Context.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        walletType,
        connect,
        connectWithWallet,
        disconnect,
        chainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}
