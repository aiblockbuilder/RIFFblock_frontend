import axios from "axios"
import { toast } from "@/components/ui/use-toast"
import { UpdateProfileData, UserProfile, TippingTier, StakingSettings } from "@/types/api-response"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

interface ApiClientOptions {
    walletAddress?: string
    body?: any
    method?: string
    headers?: Record<string, string>
}

export async function apiClient(endpoint: string, options: ApiClientOptions = {}) {
    const { walletAddress, body, method = "GET", headers = {} } = options

    const config = {
        url: endpoint,
        method,
        headers: {
            ...headers,
            "Content-Type": "application/json",
            // ...(walletAddress ? { "x-wallet-address": walletAddress } : {}),
        },
        ...(body ? { data: body } : {}),
    }

    try {
        const response = await axiosInstance.request(config)
        return response.data
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Something went wrong"
        console.error("API request failed:", error)
        toast({
            variant: "destructive",
            title: "Request Failed",
            description: message,
        })
        throw new Error(message)
    }
}

// Auth API
export const authApi = {
    getNonce: (walletAddress: string) => apiClient("/auth/nonce", { method: "POST", body: { walletAddress } }),

    verifySignature: (walletAddress: string, signature: string, message: string) =>
        apiClient("/auth/verify", { method: "POST", body: { walletAddress, signature, message } }),

    getCurrentUser: (walletAddress: string) => apiClient("/auth/me", { walletAddress }),
}

// User API
export const userApi = {
    getUserProfile: (walletAddress: string) => apiClient(`/users/${walletAddress}`),

    updateProfile: (walletAddress: string, profileData: UpdateProfileData) =>
        apiClient(`/users/${walletAddress}`, { method: "PUT", body: profileData, walletAddress }),

    getUserNFTs: (walletAddress: string, page = 0, limit = 10, type = "created") =>
        apiClient(`/users/${walletAddress}/nfts?page=${page}&limit=${limit}&type=${type}`),

    getUserCollections: (walletAddress: string, page = 0, limit = 10) =>
        apiClient(`/users/${walletAddress}/collections?page=${page}&limit=${limit}`),

    getAllActivity: (page = 0, limit = 5) =>
        apiClient(`/activity?page=${page}&limit=${limit}`),

    getUserActivity: (walletAddress: string, page = 0, limit = 5) =>
        apiClient(`/users/${walletAddress}/activity?page=${page}&limit=${limit}`),

    getUserTippingTiers: (walletAddress: string) => apiClient(`/tipping/tiers/${walletAddress}`),

    
    getUserFavorites: (walletAddress: string, page = 0, limit = 10) =>
        apiClient(`/users/${walletAddress}/favorites?page=${page}&limit=${limit}`),
    
    createTippingTier: (walletAddress: string, tierData: Omit<TippingTier, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
        apiClient(`/tipping/tiers`, { method: "POST", body: { walletAddress, ...tierData } }),

    updateTippingTier: (tierId: number, tierData: Partial<TippingTier>) =>
        apiClient(`/tipping/tiers/${tierId}`, { method: "PUT", body: tierData }),

    deleteTippingTier: (tierId: number) =>
        apiClient(`/tipping/tiers/${tierId}`, { method: "DELETE" }),
}

// NFT API
export const nftApi = {
    createNFT: (walletAddress: string, nftData: any) =>
        apiClient("/nfts", { method: "POST", body: nftData, walletAddress }),

    getNFT: (id: string, walletAddress: string) => apiClient(`/nfts/${id}`, { walletAddress }),

    // Add other NFT-related API calls
}

// Marketplace API
export const marketplaceApi = {
    getListings: (walletAddress: string, page = 1, limit = 10) =>
        apiClient(`/marketplace/listings?page=${page}&limit=${limit}`, { walletAddress }),

    // Add other marketplace-related API calls
}

// Collection API
export const collectionApi = {
    createCollection: (walletAddress: string, collectionData: any) =>
        apiClient("/collections", { method: "POST", body: collectionData, walletAddress }),

    // Add other collection-related API calls
}

// Staking API
export const stakingApi = {
    getStakingSettings: (walletAddress: string) => apiClient(`/users/${walletAddress}/staking-settings`, { walletAddress }),

    updateStakingSettings: (walletAddress: string, settings: {
        defaultStakingEnabled: boolean;
        defaultRoyaltyShare: number;
        minimumStakeAmount: number;
        lockPeriodDays: number;
    }): Promise<{
        message: string;
        settings: StakingSettings;
    }> => apiClient(`/users/${walletAddress}/staking-settings`, { 
        method: "PUT", 
        body: settings,
        walletAddress 
    }),
}
