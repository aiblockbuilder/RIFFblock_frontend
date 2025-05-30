"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, Pause, Heart, Share2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { userApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import { FavoriteRiff } from "@/types/api-response"

interface FavoriteRiffsProps {
    isOwner: boolean
    walletAddress: string
}

export default function FavoriteRiffs({ isOwner, walletAddress }: FavoriteRiffsProps) {
    const [favorites, setFavorites] = useState<FavoriteRiff[]>([])
    const [playingRiff, setPlayingRiff] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        // Create audio element
        audioRef.current = new Audio()
        
        // Add event listeners
        audioRef.current.addEventListener('ended', () => {
            setPlayingRiff(null)
        })

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current.src = ''
            }
        }
    }, [])

    useEffect(() => {
        async function fetchFavorites() {
            if (!walletAddress) {
                setIsLoading(false)
                return
            }

            try {
                const response = await userApi.getUserFavorites(walletAddress)
                // console.log(">>> get user favorites response : ", response)
                setFavorites(response)
            } catch (error) {
                console.error("Error fetching favorites:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load favorite riffs",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchFavorites()
    }, [walletAddress])

    const togglePlay = (riff: FavoriteRiff) => {
        if (!audioRef.current) return

        if (playingRiff === riff.id.toString()) {
            // Pause current riff
            audioRef.current.pause()
            setPlayingRiff(null)
        } else {
            // Play new riff
            if (riff.audioFile) {
                audioRef.current.src = riff.audioFile
                audioRef.current.play().catch(error => {
                    console.error("Error playing audio:", error)
                    toast({
                        title: "Error",
                        description: "Failed to play audio. Please try again.",
                        variant: "destructive",
                    })
                })
                setPlayingRiff(riff.id.toString())
            } else {
                toast({
                    title: "Error",
                    description: "Audio file not found.",
                    variant: "destructive",
                })
            }
        }
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
                {favorites.map((favorite) => (
                    <div
                        key={favorite.id}
                        className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden hover:border-violet-500/30 transition-all group"
                    >
                        <div className="relative aspect-square">
                            <Image src={favorite.coverImage || "/placeholder.svg"} alt={favorite.title} fill className="object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => togglePlay(favorite)}
                                    className="w-10 h-10 rounded-full bg-violet-600/90 hover:bg-violet-700/90 flex items-center justify-center transition-all transform scale-90 group-hover:scale-100"
                                >
                                    {playingRiff === favorite.id.toString() ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                                </button>
                            </div>
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-zinc-300">
                                {favorite.duration}
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium text-sm truncate">{favorite.title}</h3>
                                    <p className="text-xs text-zinc-500 truncate">by {favorite.creator.name}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1 text-zinc-400 hover:text-zinc-300">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                                        <DropdownMenuItem className="cursor-pointer">
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
