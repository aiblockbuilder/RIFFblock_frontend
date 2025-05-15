// Common types used across the application

export interface User {
    id: string
    username: string
    walletAddress?: string
    profileImage?: string
    bio?: string
    createdAt: string
    updatedAt: string
}

export interface Riff {
    id: string
    title: string
    description?: string
    audioUrl: string
    coverArt?: string
    genre?: string
    bpm?: number
    key?: string
    duration: number
    userId: string
    user?: User
    isNft: boolean
    price?: number
    createdAt: string
    updatedAt: string
}

export interface NFT {
    id: string
    riffId: string
    riff?: Riff
    tokenId: string
    contractAddress: string
    mintedAt: string
    price: number
    royaltyPercentage: number
    createdAt: string
    updatedAt: string
}

export interface Stake {
    id: string
    userId: string
    riffId: string
    amount: number
    stakedAt: string
    unstakedAt?: string
    active: boolean
    createdAt: string
    updatedAt: string
}

export interface Token {
    symbol: string
    name: string
    totalSupply: number
    circulatingSupply: number
    price: number
}
