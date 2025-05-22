export interface SocialLinks {
    twitter?: string | null;
    instagram?: string | null;
    website?: string | null;
}

export interface UserStats {
    totalRiffs: number;
    totalTips: number;
    totalStaked: number;
    followers: number;
}

export interface UserProfile {
    id: string;
    walletAddress: string;
    name?: string | null;
    bio?: string | null;
    location?: string | null;
    avatar?: string | null; // URL string or null
    coverImage?: string | null; // URL string or null
    ensName?: string | null;
    socialLinks: SocialLinks;
    genres?: string[] | null;
    influences?: string[] | null;
    stats: UserStats;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface Riff {
    id: number
    title: string
    description: string
    audioFile: string
    coverImage: string
    duration: number
    genre: string
    mood: string
    instrument: string
    keySignature: string
    timeSignature: string
    isBargainBin: boolean
    price: number
    currency: string
    royaltyPercentage: number
    isStakable: boolean
    stakingRoyaltyShare: number
    isNft: boolean
    tokenId: string
    contractAddress: string
    unlockSourceFiles: boolean
    unlockRemixRights: boolean
    unlockPrivateMessages: boolean
    unlockBackstageContent: boolean
    creatorId: number
    collectionId: number
    createdAt: Date
    updatedAt: Date
}

export interface FavoriteRiff {
    id: number
    title: string
    description: string
    audioFile: string
    coverImage: string
    duration: number
    genre: string
    mood: string
    instrument: string
    keySignature: string
    timeSignature: string
    isBargainBin: boolean
    price: number
    currency: string
    royaltyPercentage: number
    isStakable: boolean
    stakingRoyaltyShare: number
    isNft: boolean
    tokenId: string
    contractAddress: string
    unlockSourceFiles: boolean
    unlockRemixRights: boolean
    unlockPrivateMessages: boolean
    unlockBackstageContent: boolean
    creatorId: number
    collectionId: number
    createdAt: Date
    updatedAt: Date
    creator: {
        id: number,
        name: string
    }
}

