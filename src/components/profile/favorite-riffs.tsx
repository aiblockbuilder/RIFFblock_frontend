"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, Pause, Heart, Share2, MoreHorizontal, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApi } from "@/contexts/api-context"
import { toast } from "@/components/ui/use-toast"

interface FavoriteRiffsProps {
    isOwner: boolean
    userId: string
}

export default function FavoriteRiffs({ isOwner, userId }: FavoriteRiffsProps) {
    const [playingRiff, setPlayingRiff] = useState<string | null>(null)

    const [favoriteRiffs, setFavoriteRiffs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { apiService } = useApi()

    const togglePlay = (riffId: string) => {
        setPlayingRiff((prev) => (prev === riffId ? null : riffId))
    }

    useEffect(() => {
        const fetchFavoriteRiffs = async () => {
            try {
                setIsLoading(true)
                // In a real implementation, we would fetch favorite riffs from the API
                // const response = await apiService.getUserFavorites(userId)
                // setFavoriteRiffs(response.data)

                // Mock data for now
                setFavoriteRiffs([
                    {
                        id: "fav-1",
                        title: "Quantum Pulse",
                        artist: "CyberSoul",
                        image: "/favorite-ablbum-cover-1.jpg",
                        duration: "0:35",
                    },
                    {
                        id: "fav-2",
                        title: "Neon Streets",
                        artist: "RetroWave",
                        image: "/favorite-ablbum-cover-2.jpg",
                        duration: "0:42",
                    },
                    {
                        id: "fav-3",
                        title: "Digital Horizon",
                        artist: "SynthMaster",
                        image: "/favorite-ablbum-cover-3.jpg",
                        duration: "0:29",
                    },
                    {
                        id: "fav-4",
                        title: "Cyber Dreams",
                        artist: "NightDrive",
                        image: "/favorite-ablbum-cover-4.jpg",
                        duration: "0:38",
                    },
                ])
                setError(null)
            } catch (err) {
                console.error("Error fetching favorite riffs:", err)
                setError("Failed to load favorite riffs")
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load favorite riffs. Please try again.",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchFavoriteRiffs()
    }, [userId, apiService])

    const handleUnlike = async (riffId: string) => {
        try {
            await apiService.unlikeRiff(riffId)
            setFavoriteRiffs(favoriteRiffs.filter((riff) => riff.id !== riffId))
            toast({
                title: "Riff Unliked",
                description: "Riff has been removed from your favorites.",
            })
        } catch (error) {
            console.error("Error unliking riff:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to unlike riff. Please try again.",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{isOwner ? "My Favorites" : "Favorites"}</h2>
                </div>
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{isOwner ? "My Favorites" : "Favorites"}</h2>
                </div>
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6 text-center">
                    <p className="text-zinc-400">{error}</p>
                    <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 border-zinc-700 text-zinc-400 hover:text-zinc-300"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    if (favoriteRiffs.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">{isOwner ? "My Favorites" : "Favorites"}</h2>
                </div>
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6 text-center">
                    <p className="text-zinc-400">No favorite riffs found.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{isOwner ? "My Favorites" : "Favorites"}</h2>
                <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 hover:text-zinc-300">
                    View All
                </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {favoriteRiffs.map((riff) => (
                    <div
                        key={riff.id}
                        className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden hover:border-violet-500/30 transition-all group"
                    >
                        <div className="relative aspect-square">
                            <Image src={riff.image || "/placeholder.svg"} alt={riff.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => togglePlay(riff.id)}
                                    className="w-10 h-10 rounded-full bg-violet-600/90 hover:bg-violet-700/90 flex items-center justify-center transition-all transform scale-90 group-hover:scale-100"
                                >
                                    {playingRiff === riff.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                                </button>
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-zinc-300">
                                {riff.duration}
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-sm truncate">{riff.title}</h3>
                                    <p className="text-xs text-zinc-500 truncate">by {riff.artist}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1 text-zinc-400 hover:text-zinc-300">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                                        <DropdownMenuItem className="cursor-pointer" onClick={() => handleUnlike(riff.id)}>
                                            <Heart className="mr-2 h-4 w-4" />
                                            <span>Unlike</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Share2 className="mr-2 h-4 w-4" />
                                            <span>Share</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
