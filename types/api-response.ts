export interface SocialLinks {
    twitter?: string;
    instagram?: string;
    website?: string;
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
    minimumStakeAmount: number | null
    lockPeriodDays: number | null
    useProfileDefaults: boolean
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

export interface ActivityUser {
    id: number;
    name: string;
    avatar: string;
}

export interface BaseActivity {
    type: 'upload' | 'tip' | 'stake' | 'favorite';
    riffName: string;
    riffImage: string;
    fromUser: ActivityUser;
    timestamp: string;
    activityId: string | number;
}

export interface UploadActivity extends BaseActivity {
    type: 'upload';
}

export interface TipActivity extends BaseActivity {
    type: 'tip';
    amount: number;
    toUser: ActivityUser;
}

export interface StakeActivity extends BaseActivity {
    type: 'stake';
    amount: number;
}

export interface FavoriteActivity extends BaseActivity {
    type: 'favorite';
    toUser: ActivityUser;
}

export type ActivityResponse = UploadActivity | TipActivity | StakeActivity | FavoriteActivity;

export interface UpdateProfileData {
    name?: string;
    bio?: string;
    location?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
    genres?: string[];
    influences?: string[];
}

export interface TippingTier {
    id: number;
    userId: number;
    name: string;
    amount: number;
    description: string;
    perks: string[];
    createdAt: string;
    updatedAt: string;
}

export interface TippingTierWithArtist {
    id: number;
    name: string;
    amount: number;
    description: string;
    perks: string[];
    artist: string;
    artistImage: string;
    artistWalletAddress: string | null;
    image: string;
}

export interface StakingSettings {
    id: number;
    userId: number;
    defaultStakingEnabled: boolean;
    defaultRoyaltyShare: number;
    lockPeriodDays: number;
    minimumStakeAmount: number;
    createdAt: string;
    updatedAt: string;
}

export interface StakedRiff {
    id: number;
    riffId: number;
    tokenId: number;
    title: string;
    artist: string;
    image: string;
    stakedAmount: number;
    stakedDate: string;
    unlockDate: string;
    royaltiesEarned: number;
    status: "locked" | "unlocked";
}

export interface StakableRiff {
    id: string;
    title: string;
    artist: string;
    artistImage: string;
    artistWalletAddress: string;
    image: string;
    stakedAmount: number;
    maxPool: number;
    royaltyShare: number;
    duration: string;
}

export interface TrendingCreator {
    id: number;
    name: string;
    image: string;
    walletAddress: string;
    riffCount: number;
    bio: string;
}

