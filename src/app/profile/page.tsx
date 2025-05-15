"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { useApi } from "@/contexts/api-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Music, Users, Settings, Edit, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import ProfileHeader from "@/components/profile/profile-header"
import RiffGallery from "@/components/profile/riff-gallery"
import ActivityFeed from "@/components/profile/activity-feed"
import TippingTiers from "@/components/profile/tipping-tiers"
import StakingSettings from "@/components/profile/staking-settings"
import FavoriteRiffs from "@/components/profile/favorite-riffs"
import MainLayout from "@/components/layouts/main-layout"
import CreativeGradientBackground from "@/components/creative-gradient-background"

export default function ProfilePage() {
    const { isConnected, walletAddress } = useWallet()
    const { user } = useApi()
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState("music")

    const [profile, setProfile] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch profile data
    useEffect(() => {
        const fetchProfile = async () => {
            if (!isConnected) {
                // Use mock data if not connected
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
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const { data } = await user.getProfile()

                if (data) {
                    setProfile(data)
                } else {
                    // Fallback to mock data if API returns empty
                    setProfile({
                        name: "SYNTHWAVE_92",
                        bio: "Creating retro-futuristic soundscapes inspired by 80s synth culture and cyberpunk aesthetics. Specializing in atmospheric pads, arpeggiated sequences, and driving basslines.",
                        location: "Los Angeles, CA",
                        avatar: "/neon-profile.png",
                        coverImage: "/placeholder.svg?key=dvkto",
                        ensName: "synthwave92.eth",
                        walletAddress,
                        socialLinks: {
                            twitter: "https://twitter.com/synthwave92",
                            instagram: "https://instagram.com/synthwave92",
                            website: "https://synthwave92.com",
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
                setError(null)
            } catch (err) {
                console.error("Error fetching profile:", err)
                setError("Failed to load profile data")
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load profile data. Please try again.",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [isConnected, walletAddress, user])

    // Check if the profile belongs to the connected wallet
    const isOwner = isConnected && walletAddress.toLowerCase() === (profile?.walletAddress || "").toLowerCase()

    if (isLoading) {
        return (
            <MainLayout>
                <CreativeGradientBackground variant="profile">
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-violet-500" />
                            <p className="text-zinc-400">Loading profile...</p>
                        </div>
                    </div>
                </CreativeGradientBackground>
            </MainLayout>
        )
    }

    if (error) {
        return (
            <MainLayout>
                <CreativeGradientBackground variant="profile">
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 rounded-xl p-8 max-w-md">
                            <h2 className="text-2xl font-bold text-red-400 mb-4">Error Loading Profile</h2>
                            <p className="text-zinc-300 mb-6">{error}</p>
                            <Button onClick={() => window.location.reload()} className="bg-violet-600 hover:bg-violet-700">
                                Try Again
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
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
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
                                </div>

                                <TabsContent value="music" className="space-y-8">
                                    {/* Riff Gallery */}
                                    <RiffGallery isOwner={isOwner} isEditing={isEditing} userId={profile?.id} />

                                    {/* Favorites / Tips Given */}
                                    <FavoriteRiffs isOwner={isOwner} userId={profile?.id} />
                                </TabsContent>

                                <TabsContent value="community" className="space-y-8">
                                    {/* Activity Feed */}
                                    <ActivityFeed userId={profile?.id} />

                                    {/* Backstage Access (Tipping Tiers) */}
                                    <TippingTiers isOwner={isOwner} isEditing={isEditing} userId={profile?.id} />
                                </TabsContent>

                                {isOwner && (
                                    <TabsContent value="settings" className="space-y-8">
                                        {/* Rifflords Staking Settings */}
                                        <StakingSettings userId={profile?.id} />
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
