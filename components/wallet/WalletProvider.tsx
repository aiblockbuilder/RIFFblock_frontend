"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useAccount, useBalance, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi"
import { SUPPORTED_NETWORKS } from "@/lib/types/wallet"
import { toast } from "@/components/ui/use-toast"

// Create context for wallet connection
interface WalletContextType {
    address: string | undefined
    chainId: number | undefined
    isConnected: boolean
    isConnecting: boolean
    isDisconnecting: boolean
    balance: string | undefined
    networkName: string | undefined
    disconnect: () => void
    switchNetwork: (chainId: number) => void
    isSwitchingNetwork: boolean
    formatAddress: (address: string) => string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
    const [isClient, setIsClient] = useState(false)

    // Initialize client-side state
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Format address for display
    const formatAddress = (address: string): string => {
        if (!address) return ""
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    }

    // Get network name from chain ID
    const getNetworkName = (chainId: number): string => {
        return SUPPORTED_NETWORKS[chainId]?.name || `Chain ID: ${chainId}`
    }

    // Wagmi hooks
    const { address, isConnected, isConnecting } = useAccount()
    const { chain } = useNetwork()
    const { disconnect: disconnectWallet, isLoading: isDisconnecting } = useDisconnect()
    const { switchNetwork: switchChain, isLoading: isSwitchingNetwork } = useSwitchNetwork()
    const { data: balanceData } = useBalance({
        address,
        enabled: isConnected && !!address,
    })

    // Format balance
    const formattedBalance = balanceData ? Number.parseFloat(balanceData.formatted).toFixed(4) : undefined

    // Disconnect wallet
    const disconnect = () => {
        disconnectWallet()
        toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected",
        })
    }

    // Switch network
    const switchNetwork = (chainId: number) => {
        if (switchChain) {
            switchChain({ chainId })
        } else {
            toast({
                title: "Network Switching Not Supported",
                description: "Your wallet does not support programmatic network switching.",
                variant: "destructive",
            })
        }
    }

    // Context value
    const value = {
        address,
        chainId: chain?.id,
        isConnected,
        isConnecting,
        isDisconnecting,
        balance: formattedBalance,
        networkName: chain ? getNetworkName(chain.id) : undefined,
        disconnect,
        switchNetwork,
        isSwitchingNetwork,
        formatAddress,
    }

    // Only render the provider on the client side
    if (!isClient) {
        return <>{children}</>
    }

    return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWalletContext() {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error("useWalletContext must be used within a WalletProvider")
    }
    return context
}
