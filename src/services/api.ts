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
api.interceptors.request.use((config: any) => {
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

export default api
