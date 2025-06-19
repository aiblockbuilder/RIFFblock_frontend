"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/contexts/wallet-context"
// import { useAuth } from "@/hooks/use-auth"
import { userApi, stakeApi } from "@/lib/api-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Music, Users, Settings, Edit, Save, Coins, Gift, DollarSign, Unlock, Lock, Clock, Info, ExternalLink } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import ProfileHeader from "@/components/profile/profile-header"
import RiffGallery from "@/components/profile/riff-gallery"
import ActivityFeed from "@/components/profile/activity-feed"
import TippingTiers from "@/components/profile/tipping-tiers"
import StakingSettings from "@/components/profile/staking-settings"
import FavoriteRiffs from "@/components/profile/favorite-riffs"
import MainLayout from "@/components/layouts/main-layout"
import CreativeGradientBackground from "@/components/creative-gradient-background"
import WalletConnect from "@/components/wallet-connect"
import { UpdateProfileData, UserProfile, StakedRiff } from "@/types/api-response"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Image from "next/image"

export default function ProfilePage() {
    const router = useRouter()
    const { isConnected, walletAddress } = useWallet()
    // const { userData, getCurrentUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState("music")
    const [profile, setProfile] = useState<UserProfile>()
    const [isLoading, setIsLoading] = useState(true)
    const [stakedRiffs, setStakedRiffs] = useState<StakedRiff[]>([])
    const [isLoadingStakes, setIsLoadingStakes] = useState(false)

    // Fetch user profile data
    useEffect(() => {
        async function fetchProfileData() {
            if (!walletAddress) {
                setIsLoading(false)
                return
            }

            try {
                // First try to get the current user's profile
                // const currentUser = await getCurrentUser()

                // If we have the current user, get their full profile
                const response = await userApi.getUserProfile(walletAddress)
                // console.log(">>> get user profile response : ", response)
                setProfile(response)

            } catch (error) {
                console.error("Error fetching profile:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load profile data",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfileData()
    }, [walletAddress])

    // Check if the profile belongs to the connected wallet
    const isOwner = true // isConnected && walletAddress.toLowerCase() === (profile?.walletAddress || "").toLowerCase()

    const handleProfileSave = async (updatedProfile: Partial<UserProfile>) => {
        if (isConnected && walletAddress) {
            await userApi.updateProfile(walletAddress, updatedProfile as UpdateProfileData)
            // Refresh profile data
            const response = await userApi.getUserProfile(walletAddress)
            setProfile(response)
        }
    }

    // Fetch user staked riffs
    const fetchStakedRiffs = async () => {
        if (!walletAddress) return

        setIsLoadingStakes(true)
        try {
            const response = await stakeApi.getUserStakedRiffs(walletAddress)
            setStakedRiffs(response)
        } catch (error) {
            console.error("Error fetching staked riffs:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load staked riffs data",
            })
        } finally {
            setIsLoadingStakes(false)
        }
    }

    // Fetch staked riffs when support tab is active or wallet changes
    useEffect(() => {
        if (activeTab === "support" && walletAddress) {
            fetchStakedRiffs()
        }
    }, [activeTab, walletAddress])

    if (!isConnected) {
        return (
            <MainLayout>
                <CreativeGradientBackground variant="profile">
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-8 text-center max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                            <p className="text-zinc-400 mb-6">
                                Please connect your wallet to view your profile or authenticate to create one.
                            </p>
                            <WalletConnect />
                        </div>
                    </div>
                </CreativeGradientBackground>
            </MainLayout>
        )
    }

    if (isLoading) {
        return (
            <MainLayout>
                <CreativeGradientBackground variant="profile">
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
                    </div>
                </CreativeGradientBackground>
            </MainLayout>
        )
    }

    if (!profile) {
        return (
            <MainLayout>
                <CreativeGradientBackground variant="profile">
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-8 text-center max-w-md">
                            <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
                            <p className="text-zinc-400 mb-6">
                                We couldn't find a profile for this wallet address. Would you like to create one?
                            </p>
                            <Button
                                className="bg-violet-600 hover:bg-violet-700"
                                onClick={async () => {
                                    try {
                                        // Create a new profile
                                        const newProfile = await userApi.createProfile({
                                            walletAddress,
                                            name: `user_${walletAddress.substring(2, 8)}`,
                                            bio: "Welcome to my profile!",
                                            location: "",
                                            genres: [],
                                            influences: [],
                                        })
                                        setProfile(newProfile)
                                        setIsEditing(true)
                                        toast({
                                            title: "Profile Created",
                                            description: "Your profile has been created successfully.",
                                        })
                                    } catch (error) {
                                        console.error("Error creating profile:", error)
                                        toast({
                                            variant: "destructive",
                                            title: "Error",
                                            description: "Failed to create profile. Please try again.",
                                        })
                                    }
                                }}
                            >
                                Create Profile
                            </Button>
                        </div>
                    </div>
                </CreativeGradientBackground>
            </MainLayout>
        )
    }

    return (
        <MainLayout>
            <CreativeGradientBackground variant="profile">
                <div className="min-h-screen pb-16">
                    <div className="container px-4 md:px-6 py-8 max-w-6xl mx-auto">
                        {/* Profile Header */}
                        <ProfileHeader 
                            profile={profile} 
                            isOwner={isOwner} 
                            isEditing={isEditing} 
                            setIsEditing={setIsEditing}
                            onSave={handleProfileSave}
                        />

                        {/* Main Content */}
                        <div className="mt-8">
                            <Tabs defaultValue="music" onValueChange={setActiveTab} className="w-full">
                                <div className="flex justify-between items-center mb-6">
                                    <TabsList className="bg-zinc-900/50 border border-zinc-800">
                                        <TabsTrigger
                                            value="music"
                                            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
                                        >
                                            <Music className="mr-2 h-4 w-4" />
                                            Music
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="community"
                                            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
                                        >
                                            <Users className="mr-2 h-4 w-4" />
                                            Community
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="support"
                                            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
                                        >
                                            <Coins className="mr-2 h-4 w-4" />
                                            Support
                                        </TabsTrigger>
                                        {isOwner && (
                                            <TabsTrigger
                                                value="settings"
                                                className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                Settings
                                            </TabsTrigger>
                                        )}
                                    </TabsList>

                                    {isOwner && activeTab !== "settings" && !isEditing && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit Profile
                                        </Button>
                                    )}
                                </div>

                                <TabsContent value="music" className="space-y-8">
                                    {/* Riff Gallery */}
                                    <RiffGallery isOwner={isOwner} isEditing={isEditing} walletAddress={walletAddress} />

                                    {/* Favorites / Tips Given */}
                                    <FavoriteRiffs isOwner={isOwner} walletAddress={walletAddress} />
                                </TabsContent>

                                <TabsContent value="community" className="space-y-8">
                                    {/* Activity Feed */}
                                    <ActivityFeed walletAddress={walletAddress} />

                                    {/* Backstage Access (Tipping Tiers) */}
                                    <TippingTiers isOwner={isOwner} isEditing={isEditing} walletAddress={walletAddress} />
                                </TabsContent>

                                <TabsContent value="support" className="space-y-8">
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {[
                                                {
                                                    title: "Total Staked",
                                                    value: stakedRiffs.reduce((sum, riff) => sum + riff.stakedAmount, 0).toLocaleString(),
                                                    unit: "RIFF",
                                                    icon: Coins,
                                                    color: "violet",
                                                },
                                                {
                                                    title: "Total Tips Given",
                                                    value: "850", // TODO: Get from backend
                                                    unit: "RIFF",
                                                    icon: Gift,
                                                    color: "blue",
                                                },
                                                {
                                                    title: "Royalties Earned",
                                                    value: stakedRiffs.reduce((sum, riff) => sum + riff.royaltiesEarned, 0).toFixed(1),
                                                    unit: "RIFF",
                                                    icon: DollarSign,
                                                    color: "green",
                                                },
                                                {
                                                    title: "Unlocked Content",
                                                    value: stakedRiffs.filter(riff => riff.status === "unlocked").length.toString(),
                                                    unit: "items",
                                                    icon: Unlock,
                                                    color: "indigo",
                                                },
                                            ].map((item, index) => (
                                                <div
                                                    key={index}
                                                    className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className={`w-12 h-12 bg-${item.color}-500/20 rounded-full flex items-center justify-center`}
                                                        >
                                                            <item.icon className={`h-6 w-6 text-${item.color}-400`} />
                                                        </div>
                                                        <div>
                                                            <p className="text-zinc-400 text-sm">{item.title}</p>
                                                            <div className="flex items-end gap-1">
                                                                <span className="text-2xl font-bold">{item.value}</span>
                                                                <span className="text-zinc-500 text-sm mb-0.5">{item.unit}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                                            <h3 className="text-xl font-bold mb-4">Your Staked Riffs</h3>

                                            {isLoadingStakes ? (
                                                <div className="flex items-center justify-center py-8">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-500 border-t-transparent"></div>
                                                </div>
                                            ) : stakedRiffs.length === 0 ? (
                                                <div className="text-center py-8">
                                                    <p className="text-zinc-400 mb-4">You haven't staked on any riffs yet.</p>
                                                    <Button 
                                                        className="bg-violet-600 hover:bg-violet-700"
                                                        onClick={() => router.push('/market')}
                                                    >
                                                        Browse Riffs to Stake
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="border-b border-zinc-800">
                                                                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Riff</th>
                                                                <th className="text-left py-3 px-4 text-zinc-400 font-medium">Artist</th>
                                                                <th className="text-right py-3 px-4 text-zinc-400 font-medium">Staked</th>
                                                                <th className="text-right py-3 px-4 text-zinc-400 font-medium">Royalties</th>
                                                                <th className="text-right py-3 px-4 text-zinc-400 font-medium">Status</th>
                                                                <th className="text-right py-3 px-4 text-zinc-400 font-medium">Actions</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {stakedRiffs.map((riff) => (
                                                                <tr key={riff.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                                                                    <td className="py-3 px-4">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="relative w-10 h-10 rounded-md overflow-hidden">
                                                                                <Image
                                                                                    src={riff.image || "/placeholder.svg"}
                                                                                    alt={riff.title}
                                                                                    fill
                                                                                    className="object-cover"
                                                                                />
                                                                            </div>
                                                                            <span className="font-medium">{riff.title}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-4 text-zinc-300">{riff.artist}</td>
                                                                    <td className="py-3 px-4 text-right">
                                                                        <span className="font-medium">{riff.stakedAmount.toLocaleString()}</span>
                                                                        <span className="text-zinc-500 text-sm ml-1">RIFF</span>
                                                                    </td>
                                                                    <td className="py-3 px-4 text-right">
                                                                        <span className="font-medium text-green-400">{riff.royaltiesEarned.toFixed(1)}</span>
                                                                        <span className="text-zinc-500 text-sm ml-1">RIFF</span>
                                                                    </td>
                                                                    <td className="py-3 px-4 text-right">
                                                                        {riff.status === "locked" ? (
                                                                            <div className="flex items-center justify-end gap-1 text-zinc-400">
                                                                                <Lock className="h-4 w-4" />
                                                                                <TooltipProvider>
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger asChild>
                                                                                            <span>Locked</span>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent className="bg-zinc-900 border-zinc-800">
                                                                                            <p>Unlocks on {new Date(riff.unlockDate).toLocaleDateString()}</p>
                                                                                        </TooltipContent>
                                                                                    </Tooltip>
                                                                                </TooltipProvider>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center justify-end gap-1 text-green-400">
                                                                                <Unlock className="h-4 w-4" />
                                                                                <span>Unlocked</span>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-3 px-4 text-right">
                                                                        {riff.status === "locked" ? (
                                                                            <TooltipProvider>
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <div className="flex items-center justify-end gap-1 text-zinc-400">
                                                                                            <Clock className="h-4 w-4" />
                                                                                            <span>
                                                                                                {Math.ceil(
                                                                                                    (new Date(riff.unlockDate).getTime() - new Date().getTime()) /
                                                                                                    (1000 * 60 * 60 * 24),
                                                                                                )}{" "}
                                                                                                days
                                                                                            </span>
                                                                                        </div>
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent className="bg-zinc-900 border-zinc-800">
                                                                                        <p>Time remaining until you can unstake</p>
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </TooltipProvider>
                                                                        ) : (
                                                                            <Button size="sm" className="bg-violet-600 hover:bg-violet-700">
                                                                                Unstake
                                                                            </Button>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}

                                            {stakedRiffs.length > 0 && (
                                                <div className="flex justify-between items-center mt-6">
                                                    <div className="flex items-center gap-2 text-zinc-400">
                                                        <Info className="h-4 w-4" />
                                                        <p className="text-sm">Royalties are distributed monthly based on your stake percentage.</p>
                                                    </div>
                                                    <Button className="bg-green-600 hover:bg-green-700">
                                                        Claim Royalties
                                                        <DollarSign className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                {isOwner && (
                                    <TabsContent value="settings" className="space-y-8">
                                        {/* Rifflords Staking Settings */}
                                        <StakingSettings walletAddress={walletAddress} />
                                    </TabsContent>
                                )}
                            </Tabs>
                        </div>
                    </div>
                </div>
            </CreativeGradientBackground>
        </MainLayout>
    )
}
