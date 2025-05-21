"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { useAuth } from "@/hooks/use-auth"
import { userApi } from "@/lib/api-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Music, Users, Settings, Edit, Save } from "lucide-react"
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

export default function ProfilePage() {
    const { isConnected, walletAddress } = useWallet()
    const { userData, getCurrentUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState("music")
    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch user profile data
    useEffect(() => {
        async function fetchProfileData() {
            if (!isConnected || !walletAddress) {
                setIsLoading(false)
                return
            }

            try {
                // First try to get the current user's profile
                const currentUser = await getCurrentUser()

                if (currentUser) {
                    // If we have the current user, get their full profile
                    const response = await userApi.getUserProfile(walletAddress)
                    setProfile(response.data.user)
                } else {
                    // If no current user, use mock data
                    setProfile({
                        name: "SYNTHWAVE_92",
                        bio: "Creating retro-futuristic soundscapes inspired by 80s synth culture and cyberpunk aesthetics. Specializing in atmospheric pads, arpeggiated sequences, and driving basslines.",
                        location: "Los Angeles, CA",
                        avatar: "/neon-profile.png",
                        coverImage: "/profile-cover-image.jpg",
                        ensName: "synthwave92.eth",
                        socialLinks: {
                            twitter: "https://twitter.com/synthwave92",
                            instagram: "https://instagram.com/synthwave92",
                            website: "https://synthwave92.com",
                            bandcamp: "https://synthwave92.bandcamp.com",
                        },
                        genres: ["Synthwave", "Retrowave", "Electronic"],
                        influences: ["Tangerine Dream", "John Carpenter", "Vangelis"],
                        stats: {
                            totalRiffs: 42,
                            totalTips: 24350,
                            totalStaked: 156000,
                            followers: 1289,
                        },
                    })
                }
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
    }, [isConnected, walletAddress, getCurrentUser])

    // Check if the profile belongs to the connected wallet
    const isOwner = false // isConnected && walletAddress.toLowerCase() === (profile?.walletAddress || "").toLowerCase()

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
                                onClick={() => {
                                    // Create a new profile
                                    setIsEditing(true)
                                    setProfile({
                                        walletAddress,
                                        name: `user_${walletAddress.substring(2, 8)}`,
                                        bio: "",
                                        location: "",
                                        avatar: "",
                                        coverImage: "",
                                        socialLinks: {},
                                        genres: [],
                                        influences: [],
                                        stats: {
                                            totalRiffs: 0,
                                            totalTips: 0,
                                            totalStaked: 0,
                                            followers: 0,
                                        },
                                    })
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
                        <ProfileHeader profile={profile} isOwner={isOwner} isEditing={isEditing} setIsEditing={setIsEditing} />

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

                                    {isOwner && isEditing && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                                                onClick={() => setIsEditing(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-violet-600 hover:bg-violet-700"
                                                onClick={async () => {
                                                    try {
                                                        // Update profile using the API
                                                        if (isConnected && walletAddress) {
                                                            await userApi.updateProfile(walletAddress, {
                                                                username: profile.name,
                                                                bio: profile.bio,
                                                                location: profile.location,
                                                                // Add other profile fields
                                                            })
                                                        }
                                                        setIsEditing(false)
                                                        toast({
                                                            title: "Profile Updated",
                                                            description: "Your profile has been successfully updated.",
                                                        })
                                                    } catch (error) {
                                                        console.error("Error updating profile:", error)
                                                        toast({
                                                            variant: "destructive",
                                                            title: "Update Failed",
                                                            description: "Failed to update your profile. Please try again.",
                                                        })
                                                    }
                                                }}
                                            >
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </Button>
                                        </div>
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
