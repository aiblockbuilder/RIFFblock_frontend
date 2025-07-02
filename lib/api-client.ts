import axios from "axios"
import { toast } from "@/components/ui/use-toast"
import { UpdateProfileData, UserProfile, TippingTier, TippingTierWithArtist, StakingSettings } from "@/types/api-response"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
})

interface ApiClientOptions {
    walletAddress?: string
    body?: any
    method?: string
    headers?: Record<string, string>
}

export async function apiClient(endpoint: string, options: ApiClientOptions = {}) {
    const { walletAddress, body, method = "GET", headers = {} } = options

    // Set default Content-Type to application/json unless it's FormData
    const contentType = body instanceof FormData ? undefined : "application/json"

    const config = {
        url: endpoint,
        method,
        headers: {
            ...headers,
            ...(contentType ? { "Content-Type": contentType } : {}),
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
    getUserProfile: (walletAddress: string) => apiClient(`/users/profile/${walletAddress}`),

    createProfile: (profileData: { walletAddress: string } & Partial<UpdateProfileData>) =>
        apiClient("/users/profile", { method: "POST", body: profileData }),

    updateProfile: (walletAddress: string, profileData: UpdateProfileData) =>
        apiClient(`/users/profile/${walletAddress}`, { method: "PUT", body: profileData, walletAddress }),

    uploadAvatar: (formData: FormData) =>
        apiClient("/users/upload-avatar", { 
            method: "POST", 
            body: formData,
            // Don't set Content-Type header - browser will set it automatically with boundary
            headers: {}
        }),

    uploadCover: (formData: FormData) =>
        apiClient("/users/upload-cover", { 
            method: "POST", 
            body: formData,
            // Don't set Content-Type header - browser will set it automatically with boundary
            headers: {}
        }),

    getUserRiffs: (walletAddress: string, page = 0, limit = 10) =>
        apiClient(`/users/profile/${walletAddress}/riffs?page=${page}&limit=${limit}`),

    getUserNFTs: (walletAddress: string, page = 0, limit = 10, type = "created") =>
        apiClient(`/users/profile/${walletAddress}/nfts?page=${page}&limit=${limit}&type=${type}`),

    getUserCollections: (walletAddress: string, page = 0, limit = 10) =>
        apiClient(`/users/profile/${walletAddress}/collections?page=${page}&limit=${limit}`),

    getAllActivity: (page = 0, limit = 5) =>
        apiClient(`/activity?page=${page}&limit=${limit}`),

    getUserActivity: (walletAddress: string, page = 0, limit = 5) =>
        apiClient(`/users/profile/${walletAddress}/activity?page=${page}&limit=${limit}`),

    getUserTippingTiers: (walletAddress: string) => apiClient(`/tipping-tiers/tiers/${walletAddress}`),

    getUserFavorites: (walletAddress: string, page = 0, limit = 10) =>
        apiClient(`/users/profile/${walletAddress}/favorites?page=${page}&limit=${limit}`),

    createTippingTier: (walletAddress: string, tierData: Omit<TippingTier, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
        apiClient(`/tipping-tiers/tiers`, { method: "POST", body: { walletAddress, ...tierData } }),

    updateTippingTier: (tierId: number, tierData: Partial<TippingTier>) =>
        apiClient(`/tipping-tiers/tiers/${tierId}`, { method: "PUT", body: tierData }),

    deleteTippingTier: (tierId: number) =>
        apiClient(`/tipping-tiers/tiers/${tierId}`, { method: "DELETE" }),

    getStakingSettings: (walletAddress: string) => apiClient(`/users/profile/${walletAddress}/staking-settings`, { walletAddress }),

    updateStakingSettings: (walletAddress: string, settings: {
        defaultStakingEnabled: boolean;
        defaultRoyaltyShare: number;
        minimumStakeAmount: number;
        lockPeriodDays: number;
    }): Promise<{
        message: string;
        settings: StakingSettings;
    }> => apiClient(`/users/profile/${walletAddress}/staking-settings`, {
        method: "PUT",
        body: settings,
        walletAddress
    }),

    getMostTippedProfile: () => apiClient(`/users/most-tipped`),
}

// Tip API
export const tipApi = {
    getAllTippingTiers: (): Promise<TippingTierWithArtist[]> => apiClient(`/tipping-tiers/tiers`),
    
    sendTip: (tipData: {
        senderWalletAddress: string;
        recipientWalletAddress: string;
        amount: number;
        currency?: string;
        message?: string;
        tierId?: number;
        riffId?: number;
    }): Promise<{ message: string; tip: any }> => 
        apiClient(`/tipping-tiers/send`, { 
            method: "POST", 
            body: tipData 
        }),
}

// NFT API
export const nftApi = {
    createRiff: (walletAddress: string, riffData: any) =>
        apiClient("/riffs/upload", { 
            method: "POST", 
            body: riffData, 
            walletAddress
        }),

    getRiff: (id: string, walletAddress: string) => apiClient(`/riffs/riff/${id}`, { walletAddress }),
    getLatestRiff: () => apiClient(`/riffs/latest`),
    getRandomRiff: () => apiClient(`/riffs/random`),

    getAllRiffs: (params: {
        genre?: string;
        mood?: string;
        instrument?: string;
        priceMin?: number;
        priceMax?: number;
        stakable?: boolean;
        backstage?: boolean;
        unlockable?: boolean;
        sortBy?: string;
        limit?: number;
        offset?: number;
    }) => {
        const queryParams = new URLSearchParams();
        
        // Add all non-undefined parameters to query string
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                queryParams.append(key, value.toString());
            }
        });

        return apiClient(`/riffs?${queryParams.toString()}`);
    },

    getRecentRiffs: () => apiClient("/riffs/recent-uploads"),

    // Get stakable riffs for featured section
    getStakableRiffs: () => apiClient("/riffs/stakable"),

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

    getAllCollections: (walletAddress: string) =>
        apiClient(`/collections?walletAddress=${walletAddress}`),

    // Add other collection-related API calls
}

// Favorite API
export const favoriteApi = {
  addToFavorites: (riffId: number, walletAddress: string) =>
    apiClient("/favorites/add", { method: "POST", body: { id: riffId, walletAddress } }),

  removeFromFavorites: (riffId: number, walletAddress: string) =>
    apiClient(`/favorites/remove/${riffId}/${walletAddress}`, { method: "POST" }),

  checkFavorite: (riffId: number, walletAddress: string) =>
    apiClient(`/favorites/check/${riffId}/${walletAddress}`),
};

// Stake API
export const stakeApi = {
  stakeOnNft: (nftId: number, walletAddress: string, amount: number) =>
    apiClient(`/stakes/stake/${nftId}/${walletAddress}`, { 
      method: "POST", 
      body: { amount: Number(amount) },
      walletAddress 
    }),

  unstakeFromNft: (nftId: number, walletAddress: string) =>
    apiClient(`/stakes/unstake/${nftId}/${walletAddress}`, { 
      method: "POST",
      walletAddress 
    }),

  getNftStakingInfo: (nftId: number) =>
    apiClient(`/stakes/${nftId}`),

  getUserStakedRiffs: (walletAddress: string) =>
    apiClient(`/stakes/user/${walletAddress}`),
};
