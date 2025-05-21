import axios from "axios"

// Create an axios instance with default config
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
    headers: {
        "Content-Type": "application/json",
    },
})

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("auth_token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// User API services
export const userService = {
    // Get user profile
    getProfile: (walletAddress: string) => api.get(`/users/${walletAddress}`),

    // Update user profile
    updateProfile: (walletAddress: string, data: any) => api.put(`/users/${walletAddress}`, data),

    // Upload avatar
    uploadAvatar: (walletAddress: string, file: File) => {
        const formData = new FormData()
        formData.append("avatar", file)
        return api.post(`/users/upload-avatar`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
    },

    // Upload cover image
    uploadCover: (walletAddress: string, file: File) => {
        const formData = new FormData()
        formData.append("cover", file)
        return api.post(`/users/upload-cover`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
    },

    // Get user activity
    getUserActivity: (walletAddress: string, page = 1, limit = 10) =>
        api.get(`/users/${walletAddress}/activity?page=${page}&limit=${limit}`),

    // Get all activity
    getAllActivity: (page = 1, limit = 10) => api.get(`/users/activity?page=${page}&limit=${limit}`),
}

// Riff/NFT API services
export const riffService = {
    // Get user's NFTs/riffs
    getUserRiffs: (walletAddress: string, sort = "newest", page = 1, limit = 12) =>
        api.get(`/users/${walletAddress}/nfts?sort=${sort}&page=${page}&limit=${limit}`),

    // Get specific NFT details
    getRiffDetails: (id: string) => api.get(`/nfts/${id}`),

    // Add to favorites
    addToFavorites: (id: string, walletAddress: string) => api.post(`/favorite/add/${id}/${walletAddress}`),

    // Remove from favorites
    removeFromFavorites: (id: string, walletAddress: string) => api.post(`/favorite/remove/${id}/${walletAddress}`),

    // Get user's favorite riffs
    getUserFavorites: (walletAddress: string, page = 1, limit = 10) =>
        api.get(`/users/${walletAddress}/favorites?page=${page}&limit=${limit}`),
}

// Tipping tiers API services
export const tippingService = {
    // Get user's tipping tiers
    getTippingTiers: (walletAddress: string) => api.get(`/users/${walletAddress}/tipping-tiers`),

    // Create new tier
    createTippingTier: (walletAddress: string, data: any) => api.post(`/users/${walletAddress}/tipping-tiers`, data),

    // Update tier
    updateTippingTier: (walletAddress: string, id: string, data: any) =>
        api.put(`/users/${walletAddress}/tipping-tiers/${id}`, data),

    // Delete tier
    deleteTippingTier: (walletAddress: string, id: string) => api.delete(`/users/${walletAddress}/tipping-tiers/${id}`),

    // Unlock access to a tier
    unlockAccess: (walletAddress: string, tierId: string) =>
        api.post(`/users/${walletAddress}/tipping-tiers/${tierId}/unlock`),
}

// Staking API services
export const stakingService = {
    // Get user's staking settings
    getStakingSettings: (walletAddress: string) => api.get(`/users/${walletAddress}/staking-settings`),

    // Update staking settings
    updateStakingSettings: (walletAddress: string, data: any) =>
        api.put(`/users/${walletAddress}/staking-settings`, data),
}

export default api
