"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

// Supported wallet types
export type WalletType = "metamask" | "walletconnect" | null

interface WalletContextType {
    isConnecting: boolean
    isConnected: boolean
    walletAddress: string
    walletType: WalletType
    walletBalance: string
    isAuthenticated: boolean
    connectWallet: (type?: WalletType) => Promise<void>
    disconnectWallet: () => void
    signMessage: (message: string) => Promise<string | null>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [isConnecting, setIsConnecting] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [walletAddress, setWalletAddress] = useState("")
    const [walletType, setWalletType] = useState<WalletType>(null)
    const [walletBalance, setWalletBalance] = useState("0.00")
    const [isMounted, setIsMounted] = useState(false)

    // Check if window is defined (browser) and ethereum is available
    const isEthereumAvailable = typeof window !== "undefined" && typeof window.ethereum !== "undefined"

    // Set mounted state for client-side rendering
    useEffect(() => {
        setIsMounted(true)
        return () => setIsMounted(false)
    }, [])

    // Detect wallet type on load
    useEffect(() => {
        if (isEthereumAvailable) {
            if (window.ethereum.isMetaMask) {
                setWalletType("metamask")
            }
        }
    }, [isEthereumAvailable])

    // Check if already connected on component mount
    useEffect(() => {
        const checkConnection = async () => {
            if (isEthereumAvailable) {
                try {
                    const accounts = await window.ethereum.request({ method: "eth_accounts" })
                    if (accounts && accounts.length > 0) {
                        handleAccountsChanged(accounts)
                    }
                } catch (error) {
                    console.error("Error checking connection:", error)
                }
            }
        }

        if (isMounted) {
            checkConnection()

            // Set up event listeners for account changes and disconnection
            if (isEthereumAvailable) {
                window.ethereum.on("accountsChanged", handleAccountsChanged)
                window.ethereum.on("disconnect", handleDisconnect)
            }
        }

        return () => {
            if (isEthereumAvailable) {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
                window.ethereum.removeListener("disconnect", handleDisconnect)
            }
        }
    }, [isEthereumAvailable, isMounted])

    // Handle account changes
    const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
            // User disconnected
            handleDisconnect()
        } else {
            // User connected or switched accounts
            const address = accounts[0]
            setWalletAddress(address)
            setIsConnected(true)
            setIsAuthenticated(true) // In wallet-based auth, connection = authentication

            // Mock balance for demo purposes
            const randomBalance = (Math.random() * 10).toFixed(4)
            setWalletBalance(randomBalance)

            toast({
                title: "Wallet Connected",
                description: `Connected to ${formatAddress(address)}`,
            })
        }
    }

    // Handle disconnection
    const handleDisconnect = () => {
        setIsConnected(false)
        setIsAuthenticated(false)
        setWalletAddress("")
        setWalletBalance("0.00")
    }

    // Connect wallet
    const connectWallet = async (type: WalletType = "metamask") => {
        if (!isEthereumAvailable && type === "metamask") {
            window.open("https://metamask.io/download/", "_blank")
            return
        }

        setIsConnecting(true)
        setWalletType(type)

        try {
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
            handleAccountsChanged(accounts)
        } catch (error) {
            console.error("Error connecting wallet:", error)
            toast({
                variant: "destructive",
                title: "Connection Failed",
                description: "Failed to connect wallet. Please try again.",
            })
        } finally {
            setIsConnecting(false)
        }
    }

    // Disconnect wallet
    const disconnectWallet = () => {
        handleDisconnect()
        toast({
            title: "Wallet Disconnected",
            description: "Your wallet has been disconnected.",
        })
    }

    // Sign message with wallet
    const signMessage = async (message: string): Promise<string | null> => {
        if (!isConnected || !walletAddress) {
            toast({
                variant: "destructive",
                title: "Wallet Not Connected",
                description: "Please connect your wallet to sign messages.",
            })
            return null
        }

        try {
            const signature = await window.ethereum.request({
                method: "personal_sign",
                params: [message, walletAddress],
            })
            return signature
        } catch (error) {
            console.error("Error signing message:", error)
            toast({
                variant: "destructive",
                title: "Signing Failed",
                description: "Failed to sign message with wallet.",
            })
            return null
        }
    }

    // Format address for display
    const formatAddress = (address: string) => {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    }

    return (
        <WalletContext.Provider
            value={{
                isConnecting,
                isConnected,
                walletAddress,
                walletType,
                walletBalance,
                isAuthenticated,
                connectWallet,
                disconnectWallet,
                signMessage,
            }}
        >
            {children}
        </WalletContext.Provider>
    )
}

export function useWallet() {
    const context = useContext(WalletContext)
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider")
    }
    return context
}
