"use client"

import { useState, useCallback } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { authApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

export function useAuth() {
    const { walletAddress, isConnected, signMessage } = useWallet()
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [userData, setUserData] = useState<any>(null)

    // Authenticate user with wallet signature
    const authenticate = useCallback(async () => {
        if (!isConnected || !walletAddress) {
            toast({
                variant: "destructive",
                title: "Wallet Not Connected",
                description: "Please connect your wallet to authenticate.",
            })
            return null
        }

        setIsAuthenticating(true)

        try {
            // Get nonce from server
            const nonceResponse = await authApi.getNonce(walletAddress)
            const { nonce, message } = nonceResponse.data

            // Sign the message with wallet
            const signature = await signMessage(message)

            if (!signature) {
                throw new Error("Failed to sign message")
            }

            // Verify signature with server
            const authResponse = await authApi.verifySignature(walletAddress, signature, message)
            const { user } = authResponse.data

            setUserData(user)

            toast({
                title: "Authentication Successful",
                description: "You have successfully authenticated with your wallet.",
            })

            return user
        } catch (error) {
            console.error("Authentication error:", error)
            toast({
                variant: "destructive",
                title: "Authentication Failed",
                description: error instanceof Error ? error.message : "Failed to authenticate with wallet",
            })
            return null
        } finally {
            setIsAuthenticating(false)
        }
    }, [isConnected, walletAddress, signMessage])

    // Get current user data
    const getCurrentUser = useCallback(async () => {
        if (!isConnected || !walletAddress) {
            return null
        }

        try {
            const response = await authApi.getCurrentUser(walletAddress)
            const { user } = response.data
            setUserData(user)
            return user
        } catch (error) {
            console.error("Error fetching current user:", error)
            return null
        }
    }, [isConnected, walletAddress])

    return {
        isAuthenticating,
        userData,
        authenticate,
        getCurrentUser,
    }
}
