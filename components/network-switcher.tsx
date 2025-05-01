"use client"

import { useState, useEffect } from "react"
import { Check, ChevronDown, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWeb3 } from "@/lib/web3-provider"

// Network configuration
export interface NetworkConfig {
  id: number
  name: string
  icon: string
  rpcUrl: string
  currency: string
  explorerUrl: string
  isTestnet?: boolean
}

// Supported networks
export const NETWORKS: NetworkConfig[] = [
  {
    id: 1,
    name: "Ethereum",
    icon: "/images/networks/ethereum.png",
    rpcUrl: "https://mainnet.infura.io/v3/your-infura-key",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
  },
  {
    id: 137,
    name: "Polygon",
    icon: "/images/networks/polygon.png",
    rpcUrl: "https://polygon-rpc.com",
    currency: "MATIC",
    explorerUrl: "https://polygonscan.com",
  },
  {
    id: 42161,
    name: "Arbitrum",
    icon: "/images/networks/arbitrum.png",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    currency: "ETH",
    explorerUrl: "https://arbiscan.io",
  },
  {
    id: 10,
    name: "Optimism",
    icon: "/images/networks/optimism.png",
    rpcUrl: "https://mainnet.optimism.io",
    currency: "ETH",
    explorerUrl: "https://optimistic.etherscan.io",
  },
  {
    id: 80001,
    name: "Polygon Mumbai",
    icon: "/images/networks/polygon.png",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    currency: "MATIC",
    explorerUrl: "https://mumbai.polygonscan.com",
    isTestnet: true,
  },
]

// Default network (Polygon)
export const DEFAULT_NETWORK = NETWORKS[1]

interface NetworkSwitcherProps {
  onNetworkChange?: (network: NetworkConfig) => void
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export default function NetworkSwitcher({
  onNetworkChange,
  className = "",
  variant = "outline",
  size = "default",
}: NetworkSwitcherProps) {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig | null>(null)
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Use our web3 context
  const { chainId, switchNetwork, isSwitchingNetwork } = useWeb3()

  useEffect(() => {
    setIsClient(true)

    // Update network when chainId changes
    if (chainId) {
      const network = NETWORKS.find((n) => n.id === chainId) || null
      setCurrentNetwork(network)

      // Check if on wrong network (not Polygon)
      setIsWrongNetwork(network?.id !== DEFAULT_NETWORK.id)

      if (network && onNetworkChange) {
        onNetworkChange(network)
      }
    }
  }, [chainId, onNetworkChange])

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
  if (isWrongNetwork && currentNetwork && !isSwitchingNetwork) {
    return (
      <Button
        variant="destructive"
        size={size}
        className={`bg-amber-600 hover:bg-amber-700 text-white ${className}`}
        onClick={() => switchNetwork(DEFAULT_NETWORK.id)}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Switch to</span> {DEFAULT_NETWORK.name}
        </div>
      </Button>
    )
  }

  // If no network detected yet
  if (!currentNetwork) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-zinc-400"></div>
          <span>No Network</span>
        </div>
      </Button>
    )
  }

  // Normal network switcher dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <div className="flex items-center gap-2">
            {currentNetwork.icon ? (
              <img
                src={currentNetwork.icon || "/placeholder.svg"}
                alt={currentNetwork.name}
                className="w-4 h-4 rounded-full"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-zinc-400"></div>
            )}
            <span>{currentNetwork.name}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
        {NETWORKS.map((network) => (
          <DropdownMenuItem key={network.id} className="cursor-pointer" onClick={() => switchNetwork(network.id)}>
            <div className="flex items-center gap-2 w-full">
              {network.icon ? (
                <img src={network.icon || "/placeholder.svg"} alt={network.name} className="w-5 h-5 rounded-full" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-zinc-400"></div>
              )}
              <span className="flex-1">
                {network.name}
                {network.isTestnet && <span className="text-xs text-zinc-500 ml-1">(Testnet)</span>}
              </span>
              {currentNetwork.id === network.id && <Check className="h-4 w-4 text-green-500" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
