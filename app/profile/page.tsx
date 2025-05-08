"use client"

import { useState } from "react"
import { useWallet } from "@/contexts/wallet-context"
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

export default function ProfilePage() {
    const { isConnected, walletAddress } = useWallet()
    const [isEditing, setIsEditing] = useState(false)
    const [activeTab, setActiveTab] = useState("music")

    // Mock data for the profile
    const profile = {
        name: "SYNTHWAVE_92",
        bio: "Creating retro-futuristic soundscapes inspired by 80s synth culture and cyberpunk aesthetics. Specializing in atmospheric pads, arpeggiated sequences, and driving basslines.",
        location: "Los Angeles, CA",
        avatar: "/neon-profile.png",
        coverImage: "profile_avatar.jpg",
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
    }

    // Check if the profile belongs to the connected wallet
    const isOwner = true // isConnected && walletAddress.toLowerCase() === "0x1234...5678".toLowerCase()

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#0d0d0d] text-white">
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
                                            onClick={() => {
                                                setIsEditing(false)
                                                toast({
                                                    title: "Profile Updated",
                                                    description: "Your profile has been successfully updated.",
                                                })
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
                                <RiffGallery isOwner={isOwner} isEditing={isEditing} />

                                {/* Favorites / Tips Given */}
                                <FavoriteRiffs isOwner={isOwner} />
                            </TabsContent>

                            <TabsContent value="community" className="space-y-8">
                                {/* Activity Feed */}
                                <ActivityFeed />

                                {/* Backstage Access (Tipping Tiers) */}
                                <TippingTiers isOwner={isOwner} isEditing={isEditing} />
                            </TabsContent>

                            {isOwner && (
                                <TabsContent value="settings" className="space-y-8">
                                    {/* Rifflords Staking Settings */}
                                    <StakingSettings />
                                </TabsContent>
                            )}
                        </Tabs>
                    </div>
                </div>
            </div>
        </MainLayout>
    )
}
