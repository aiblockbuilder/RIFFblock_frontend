"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/contexts/wallet-context"
import { userApi } from "@/lib/api-client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, Users } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import ProfileHeader from "@/components/profile/profile-header"
import RiffGallery from "@/components/profile/riff-gallery"
import ActivityFeed from "@/components/profile/activity-feed"
import TippingTiers from "@/components/profile/tipping-tiers"
import FavoriteRiffs from "@/components/profile/favorite-riffs"
import MainLayout from "@/components/layouts/main-layout"
import CreativeGradientBackground from "@/components/creative-gradient-background"
import { UserProfile } from "@/types/api-response"

interface PageProps {
    params: {
        walletAddress: string
    }
}

export default function ProfilePage({ params }: PageProps) {
    const { isConnected, walletAddress: currentUserWallet } = useWallet()
    const [activeTab, setActiveTab] = useState("music")
    const [profile, setProfile] = useState<UserProfile>()
    const [isLoading, setIsLoading] = useState(true)

    // Fetch user profile data
    useEffect(() => {
        async function fetchProfileData() {
            try {
                const response = await userApi.getUserProfile(params.walletAddress)
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
    }, [params.walletAddress])

    // Check if the profile belongs to the connected wallet
    const isOwner = isConnected && currentUserWallet?.toLowerCase() === params.walletAddress.toLowerCase()

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
                            <h2 className="text-2xl font-bold mb-4">No User Registered</h2>
                            <p className="text-zinc-400">
                                This wallet address has not registered a profile yet.
                            </p>
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
                            isEditing={false} 
                            setIsEditing={() => {}} 
                            onSave={async () => {}}
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
                                    </TabsList>
                                </div>

                                <TabsContent value="music" className="space-y-8">
                                    {/* Riff Gallery */}
                                    <RiffGallery isOwner={isOwner} isEditing={false} walletAddress={params.walletAddress} />

                                    {/* Favorites / Tips Given */}
                                    <FavoriteRiffs isOwner={isOwner} walletAddress={params.walletAddress} />
                                </TabsContent>

                                <TabsContent value="community" className="space-y-8">
                                    {/* Activity Feed */}
                                    <ActivityFeed walletAddress={params.walletAddress} />

                                    {/* Backstage Access (Tipping Tiers) */}
                                    <TippingTiers isOwner={isOwner} isEditing={false} walletAddress={params.walletAddress} />
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </CreativeGradientBackground>
        </MainLayout>
    )
} 