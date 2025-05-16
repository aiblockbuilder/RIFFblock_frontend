import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// User API
export const userApi = {
    getProfile: () => api.get("/users/profile"),
    updateProfile: (data: any) => api.put("/users/profile", data),
    connectWallet: (walletAddress: string) => api.post("/users/connect-wallet", { walletAddress }),
    getUserRiffs: () => api.get("/users/riffs"),
    getUserCollections: () => api.get("/users/collections"),
    getUserStaking: () => api.get("/users/staking"),
    getUserActivity: (userId?: string) => api.get(userId ? `/users/${userId}/activity` : "/users/activity"),
    getFeaturedArtists: () => api.get("/users/featured"),
    getStakingSettings: () => api.get("/users/staking-settings"),
    updateStakingSettings: (data: any) => api.put("/users/staking-settings", data),
    getTippingTiers: (userId?: string) => api.get(userId ? `/users/${userId}/tipping-tiers` : "/users/tipping-tiers"),
    updateTippingTier: (id: string, data: any) => api.put(`/users/tipping-tiers/${id}`, data),
    createTippingTier: (data: any) => api.post("/users/tipping-tiers", data),
    deleteTippingTier: (id: string) => api.delete(`/users/tipping-tiers/${id}`),
    getFavorites: () => api.get("/users/favorites"),
    getUserByWallet: (walletAddress: string) => api.get(`/users/wallet/${walletAddress}`),
    createUserProfile: (data: any) => api.post("/users/create-profile", data),
}

// Riff API
export const riffApi = {
    getAllRiffs: (params?: any) => api.get("/riffs", { params }),
    getRiff: (id: string) => api.get(`/riffs/${id}`),
    uploadRiff: (formData: FormData) =>
        api.post("/riffs", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }),
    updateRiff: (id: string, data: any) => api.put(`/riffs/${id}`, data),
    deleteRiff: (id: string) => api.delete(`/riffs/${id}`),
    likeRiff: (id: string) => api.post(`/riffs/${id}/like`),
    unlikeRiff: (id: string) => api.delete(`/riffs/${id}/like`),
    commentOnRiff: (id: string, comment: string) => api.post(`/riffs/${id}/comments`, { comment }),
    getRiffComments: (id: string) => api.get(`/riffs/${id}/comments`),
}

// NFT API
export const nftApi = {
    getAllNFTs: () => api.get("/nfts"),
    getNFT: (id: string) => api.get(`/nfts/${id}`),
    mintNFT: (data: any) => api.post("/nfts/mint", data),
    updateNFT: (id: string, data: any) => api.put(`/nfts/${id}`, data),
}

// Staking API
export const stakingApi = {
    getRiffStaking: (riffId: string) => api.get(`/staking/riff/${riffId}`),
    stakeOnRiff: (data: any) => api.post("/staking/stake", data),
    unstake: (id: string) => api.post(`/staking/unstake/${id}`),
    getStakingStats: (riffId: string) => api.get(`/staking/stats/${riffId}`),
}

// Token API
export const tokenApi = {
    getTokenInfo: () => api.get("/tokens/info"),
    buyTokens: (data: any) => api.post("/tokens/buy", data),
    tipArtist: (data: any) => api.post("/tokens/tip", data),
}

// Staking Settings
const getStakingSettings = async () => {
    try {
        const response = await axios.get(`${API_URL}/users/staking-settings`)
        return response.data
    } catch (error) {
        console.error("Error fetching staking settings:", error)
        throw error
    }
}

const updateStakingSettings = async (settings: any) => {
    try {
        const response = await axios.put(`${API_URL}/users/staking-settings`, settings)
        return response.data
    } catch (error) {
        console.error("Error updating staking settings:", error)
        throw error
    }
}

// Tipping Tiers
const getTippingTiers = async () => {
    try {
        const response = await axios.get(`${API_URL}/users/tipping-tiers`)
        return response.data
    } catch (error) {
        console.error("Error fetching tipping tiers:", error)
        throw error
    }
}

const getUserTippingTiers = async (userId: any) => {
    try {
        const response = await axios.get(`${API_URL}/users/${userId}/tipping-tiers`)
        return response.data
    } catch (error) {
        console.error(`Error fetching tipping tiers for user ${userId}:`, error)
        throw error
    }
}

const createTippingTier = async (tierData: any) => {
    try {
        const response = await axios.post(`${API_URL}/users/tipping-tiers`, tierData)
        return response.data
    } catch (error) {
        console.error("Error creating tipping tier:", error)
        throw error
    }
}

const updateTippingTier = async (tierId: any, tierData: any) => {
    try {
        const response = await axios.put(`${API_URL}/users/tipping-tiers/${tierId}`, tierData)
        return response.data
    } catch (error) {
        console.error(`Error updating tipping tier ${tierId}:`, error)
        throw error
    }
}

const deleteTippingTier = async (tierId: any) => {
    try {
        const response = await axios.delete(`${API_URL}/users/tipping-tiers/${tierId}`)
        return response.data
    } catch (error) {
        console.error(`Error deleting tipping tier ${tierId}:`, error)
        throw error
    }
}

// Consolidated API service (new approach)
const apiService = {
    // Auth
    login: (email: string, password: string) => api.post("/auth/login", { email, password }),
    register: (userData: any) => api.post("/auth/register", userData),
    logout: () => {
        localStorage.removeItem("token")
        return Promise.resolve()
    },

    // User
    getCurrentUser: () => userApi.getProfile(),
    updateProfile: (userData: any) => userApi.updateProfile(userData),
    connectWallet: (walletAddress: string) => userApi.connectWallet(walletAddress),
    getUserRiffs: () => userApi.getUserRiffs(),
    getUserCollections: () => userApi.getUserCollections(),
    getUserStaking: () => userApi.getUserStaking(),
    getUserActivity: (userId?: string) => userApi.getUserActivity(userId),
    getFeaturedArtists: () => userApi.getFeaturedArtists(),
    getStakingSettings: () => userApi.getStakingSettings(),
    updateStakingSettings: (data: any) => userApi.updateStakingSettings(data),
    getTippingTiers: (userId?: string) => userApi.getTippingTiers(userId),
    getUserTippingTiers,
    updateTippingTier: (id: string, data: any) => userApi.updateTippingTier(id, data),
    createTippingTier: (data: any) => userApi.createTippingTier(data),
    deleteTippingTier: (id: string) => userApi.deleteTippingTier(id),
    getFavorites: () => userApi.getFavorites(),
    getUserByWallet: (walletAddress: string) => userApi.getUserByWallet(walletAddress),
    createUserProfile: (data: any) => userApi.createUserProfile(data),

    // Riffs
    getRiffs: (filters?: any) => riffApi.getAllRiffs(filters),
    getRiffById: (id: string) => riffApi.getRiff(id),
    uploadRiff: (formData: FormData) => riffApi.uploadRiff(formData),
    updateRiff: (id: string, data: any) => riffApi.updateRiff(id, data),
    deleteRiff: (id: string) => riffApi.deleteRiff(id),
    likeRiff: (id: string) => riffApi.likeRiff(id),
    unlikeRiff: (id: string) => riffApi.unlikeRiff(id),
    commentOnRiff: (id: string, comment: string) => riffApi.commentOnRiff(id, comment),
    getRiffComments: (id: string) => riffApi.getRiffComments(id),

    // NFTs
    getAllNFTs: () => nftApi.getAllNFTs(),
    getNFT: (id: string) => nftApi.getNFT(id),
    mintNFT: (data: any) => nftApi.mintNFT(data),
    updateNFT: (id: string, data: any) => nftApi.updateNFT(id, data),

    // Staking
    getRiffStaking: (riffId: string) => stakingApi.getRiffStaking(riffId),
    stakeOnRiff: (data: any) => stakingApi.stakeOnRiff(data),
    unstake: (id: string) => stakingApi.unstake(id),
    getStakingStats: (riffId: string) => stakingApi.getStakingStats(riffId),

    // Token
    getTokenInfo: () => tokenApi.getTokenInfo(),
    buyTokens: (data: any) => tokenApi.buyTokens(data),
    tipArtist: (data: any) => tokenApi.tipArtist(data),
}

export default apiService
