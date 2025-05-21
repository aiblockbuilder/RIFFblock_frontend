import { toast } from "@/components/ui/use-toast"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

interface ApiClientOptions {
    walletAddress?: string
    body?: any
    method?: string
    headers?: Record<string, string>
}

export async function apiClient(endpoint: string, options: ApiClientOptions = {}) {
    const { walletAddress, body, method = "GET", headers = {} } = options

    const requestHeaders: Record<string, string> = {
        "Content-Type": "application/json",
        ...headers,
    }

    // Add wallet address to headers if available
    if (walletAddress) {
        requestHeaders["x-wallet-address"] = walletAddress
    }

    const config: RequestInit = {
        method,
        headers: requestHeaders,
    }

    if (body) {
        config.body = JSON.stringify(body)
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || "Something went wrong")
        }

        return data
    } catch (error) {
        console.error("API request failed:", error)
        toast({
            variant: "destructive",
            title: "Request Failed",
            description: error instanceof Error ? error.message : "Something went wrong",
        })
        throw error
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

    updateProfile: (walletAddress: string, profileData: any) =>
        apiClient("/users/me", { method: "PATCH", body: profileData, walletAddress }),

    getUserNFTs: (walletAddress: string, page = 1, limit = 10, type = "created") =>
        apiClient(`/users/${walletAddress}/nfts?page=${page}&limit=${limit}&type=${type}`),

    getUserCollections: (walletAddress: string, page = 1, limit = 10) =>
        apiClient(`/users/${walletAddress}/collections?page=${page}&limit=${limit}`),

    getUserActivity: (walletAddress: string, page = 1, limit = 20) =>
        apiClient(`/users/${walletAddress}/activity?page=${page}&limit=${limit}`),

    getUserTippingTiers: (walletAddress: string) => apiClient(`/users/${walletAddress}/tipping-tiers`),

    getUserFavorites: (walletAddress: string, page = 1, limit = 10) =>
        apiClient(`/users/${walletAddress}/favorites?page=${page}&limit=${limit}`),
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
    getStakingSettings: (walletAddress: string) => apiClient("/staking/settings", { walletAddress }),

    // Add other staking-related API calls
}
