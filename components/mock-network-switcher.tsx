"use client"

import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Image from "next/image"

// Network configuration
interface NetworkConfig {
  id: number
  name: string
  icon: string
  isTestnet?: boolean
}

// Supported networks
const NETWORKS: NetworkConfig[] = [
  {
    id: 1,
    name: "Ethereum",
    icon: "/images/networks/ethereum.png",
  },
  {
    id: 137,
    name: "Polygon",
    icon: "/images/networks/polygon.png",
  },
  {
    id: 42161,
    name: "Arbitrum",
    icon: "/images/networks/arbitrum.png",
  },
  {
    id: 10,
    name: "Optimism",
    icon: "/images/networks/optimism.png",
  },
  {
    id: 80001,
    name: "Polygon Mumbai",
    icon: "/images/networks/polygon.png",
    isTestnet: true,
  },
]

// Default network (Polygon)
const DEFAULT_NETWORK = NETWORKS[1]

interface MockNetworkSwitcherProps {
  className?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export default function MockNetworkSwitcher({
  className = "",
  variant = "outline",
  size = "default",
}: MockNetworkSwitcherProps) {
  const [currentNetwork, setCurrentNetwork] = useState<NetworkConfig>(DEFAULT_NETWORK)
  const [isSwitching, setIsSwitching] = useState(false)

  const handleNetworkSwitch = (network: NetworkConfig) => {
    setIsSwitching(true)

    // Simulate network switching delay
    setTimeout(() => {
      setCurrentNetwork(network)
      setIsSwitching(false)
    }, 1000)
  }

  // If switching, show loading state
  if (isSwitching) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin"></div>
          <span>Switching...</span>
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
            <span>{currentNetwork.name}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-zinc-900 border-zinc-800">
        {NETWORKS.map((network) => (
          <DropdownMenuItem
            key={network.id}
            className="cursor-pointer"
            onClick={() => handleNetworkSwitch(network)}
            disabled={currentNetwork.id === network.id}
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
              {currentNetwork.id === network.id && <Check className="h-4 w-4 text-green-500" />}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
