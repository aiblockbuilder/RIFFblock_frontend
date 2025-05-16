"use client"

import type React from "react"
import { createContext, useState, useContext, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import apiService from "@/services/api"
import { logger } from "@/lib/logger"

// Supported wallet types
export type WalletType = "metamask" | "walletconnect" | null

interface WalletContextType {
    isConnecting: boolean
    isConnected: boolean
    walletAddress: string
    walletType: WalletType
    walletBalance: string
    userProfile: any | null
    connectWallet: (type?: WalletType) => Promise<void>
    disconnectWallet: () => void
    refreshProfile: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
    const [isConnecting, setIsConnecting] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [walletAddress, setWalletAddress] = useState("")
    const [walletType, setWalletType] = useState<WalletType>(null)
    const [walletBalance, setWalletBalance] = useState("0.00")
    const [userProfile, setUserProfile] = useState<any | null>(null)
    const [isMounted, setIsMounted] = useState(false)

    // Check if window is defined (browser) and ethereum is available
    // @ts-expect-error: expect error
    const isEthereumAvailable = typeof window !== "undefined" && typeof window.ethereum !== "undefined"

    // Set mounted state for client-side rendering
    useEffect(() => {
        setIsMounted(true)
        return () => setIsMounted(false)
    }, [])

    // Detect wallet type on load
    useEffect(() => {
        if (isEthereumAvailable) {
            // @ts-expect-error: expect error
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
                    // @ts-expect-error: expect error
                    const accounts = await window.ethereum.request({ method: "eth_accounts" })
                    if (accounts && accounts.length > 0) {
                        handleAccountsChanged(accounts)
                    }
                } catch (error) {
                    logger.error("Error checking wallet connection:", error)
                }
            }
        }

        if (isMounted) {
            checkConnection()

            // Set up event listeners for account changes and disconnection
            if (isEthereumAvailable) {
                // @ts-expect-error: expect error
                window.ethereum.on("accountsChanged", handleAccountsChanged)
                // @ts-expect-error: expect error
                window.ethereum.on("disconnect", handleDisconnect)
            }
        }

        return () => {
            if (isEthereumAvailable) {
                // @ts-expect-error: expect error
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
                // @ts-expect-error: expect error
                window.ethereum.removeListener("disconnect", handleDisconnect)
            }
        }
    }, [isEthereumAvailable, isMounted])

    // Fetch or create user profile
    const fetchOrCreateUserProfile = async (address: string) => {
        try {
            // First, try to fetch the existing profile
            const response = await apiService.getUserByWallet(address)

            if (response && response.status == 200 || response.status == 201) {
                logger.info("User profile fetched successfully", { userId: response.data.id })
                setUserProfile(response.data)
                return response.data
            } else {

                logger.debug("User profile not found, creating new profile", { walletAddress: address })

                // If profile doesn't exist, create a new one
                try {
                    // Generate random values for new user
                    const randomUsername = `User_${Math.floor(Math.random() * 10000)}`
                    const randomDescription = "New RIFF user. Ready to explore the world of music NFTs!"
                    const avatarOptions = [
                        "/neon-profile.png",
                        "/retro-profile.png",
                        "/cyberpunk-profile.png",
                        "/futuristic-profile.png",
                    ]
                    const randomAvatar = avatarOptions[Math.floor(Math.random() * avatarOptions.length)]
                    const randomEns = `${randomUsername.toLowerCase()}.eth`

                    const newUserData = {
                        name: randomUsername,
                        bio: randomDescription,
                        image: randomAvatar,
                        ensName: randomEns,
                        walletAddress: address,
                        stats: {
                            totalRiffs: 0,
                            totalTips: 0,
                            totalStaked: 0,
                            followers: 0,
                        },
                    }

                    const createResponse = await apiService.createUserProfile(newUserData)

                    if (createResponse && createResponse.data) {
                        logger.info("New user profile created successfully", { userId: createResponse.data.id })
                        setUserProfile(createResponse.data)

                        toast({
                            title: "Welcome to RIFF!",
                            description: "Your profile has been created. You can update your details in the profile page.",
                        })

                        return createResponse.data
                    }
                } catch (createError) {
                    logger.error("Error creating new user profile:", createError)
                    toast({
                        variant: "destructive",
                        title: "Profile Creation Failed",
                        description: "We couldn't create your profile. Please try again later.",
                    })
                }
            }
        } catch (error) {
            logger.error("Error fetching user profile:", error)
            toast({
                variant: "destructive",
                title: "Profile Fetch Failed",
                description: "We couldn't fetch your profile. Please try again later.",
            })
        }

        return null
    }

    // Handle account changes
    const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
            // User disconnected
            handleDisconnect()
        } else {
            // User connected or switched accounts
            const address = accounts[0]
            setWalletAddress(address)
            setIsConnected(true)
            setWalletType("metamask")

            try {
                // Connect wallet on backend using the new apiService
                await apiService.connectWallet(address)

                // Fetch or create user profile
                const profile = await fetchOrCreateUserProfile(address)

                if (profile && profile.balance) {
                    setWalletBalance(profile.balance.toString())
                } else {
                    // Fallback to mock balance if not available
                    const randomBalance = (Math.random() * 10).toFixed(4)
                    setWalletBalance(randomBalance)
                    logger.warn("User balance not available, using mock balance")
                }

                toast({
                    title: "Wallet Connected",
                    description: `Connected to ${formatAddress(address)}`,
                })
            } catch (error) {
                logger.error("Error connecting Ethereum wallet to backend:", error)
                toast({
                    variant: "destructive",
                    title: "Connection Error",
                    description: "Failed to connect wallet to backend. Please try again.",
                })
            }
        }
    }

    // Handle disconnection
    const handleDisconnect = () => {
        setIsConnected(false)
        setWalletAddress("")
        setWalletBalance("0.00")
        setUserProfile(null)
    }

    // Connect wallet
    const connectWallet = async (type: WalletType = "metamask") => {

        setIsConnecting(true)
        setWalletType(type)

        try {
            if (!isEthereumAvailable) {
                window.open("https://metamask.io/download/", "_blank")
                setIsConnecting(false)
                return
            }

            // @ts-expect-error: expect error
            const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
            handleAccountsChanged(accounts)
        } catch (error) {
            logger.error(`Error connecting ${type} wallet:`, error)
            toast({
                variant: "destructive",
                title: "Connection Failed",
                description: `Failed to connect ${type} wallet. Please try again.`,
            })
        } finally {
            setIsConnecting(false)
        }
    }

    // Disconnect wallet
    const disconnectWallet = async () => {
        try {
            handleDisconnect()

            toast({
                title: "Wallet Disconnected",
                description: "Your wallet has been disconnected.",
            })
        } catch (error) {
            logger.error("Error disconnecting wallet:", error)
        }
    }

    // Refresh user profile
    const refreshProfile = async () => {
        if (!isConnected || !walletAddress) {
            return
        }

        try {
            const response = await apiService.getUserByWallet(walletAddress)

            if (response && response.data) {
                setUserProfile(response.data)

                if (response.data.balance) {
                    setWalletBalance(response.data.balance.toString())
                }

                logger.info("User profile refreshed successfully")
            }
        } catch (error) {
            logger.error("Error refreshing user profile:", error)
            toast({
                variant: "destructive",
                title: "Profile Refresh Failed",
                description: "We couldn't refresh your profile. Please try again later.",
            })
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
                userProfile,
                connectWallet,
                disconnectWallet,
                refreshProfile,
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
