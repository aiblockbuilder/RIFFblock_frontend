"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useWallet } from "./wallet-context"
import apiService from "@/services/api"
import { logger } from "@/lib/logger"

interface ApiContextType {
    apiService: typeof apiService
    user: {
        profile: any
        isLoading: boolean
        error: string | null
        getProfile: () => Promise<any>
        updateProfile: (data: any) => Promise<any>
    }
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

export function ApiProvider({ children }: { children: ReactNode }) {
    const { isConnected, walletAddress } = useWallet()
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const getProfile = async () => {
        try {
            setIsLoading(true)
            const response = await apiService.getCurrentUser()
            setProfile(response.data)
            setError(null)
            return response
        } catch (err) {
            logger.error("Error fetching profile:", err)
            setError("Failed to load profile")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    const updateProfile = async (data: any) => {
        try {
            setIsLoading(true)
            const response = await apiService.updateProfile(data)
            setProfile(response.data)
            setError(null)
            return response
        } catch (err) {
            logger.error("Error updating profile:", err)
            setError("Failed to update profile")
            throw err
        } finally {
            setIsLoading(false)
        }
    }

    // Connect wallet when available
    useEffect(() => {
        if (isConnected && walletAddress) {
            apiService
                .connectWallet(walletAddress)
                .then(() => getProfile())
                .catch((err) => logger.error("Error connecting wallet:", err))
        }
    }, [isConnected, walletAddress])

    const value = {
        apiService,
        user: {
            profile,
            isLoading,
            error,
            getProfile,
            updateProfile,
        },
    }

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export function useApi() {
    const context = useContext(ApiContext)
    if (context === undefined) {
        throw new Error("useApi must be used within an ApiProvider")
    }
    return context
}
