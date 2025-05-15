"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, Pause, Heart, Share2, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface FavoriteRiffsProps {
    isOwner: boolean
}

export default function FavoriteRiffs({ isOwner }: FavoriteRiffsProps) {
    const [playingRiff, setPlayingRiff] = useState<string | null>(null)

    // Mock data for favorite riffs
    const favoriteRiffs = [
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
    ]

    const togglePlay = (id: string) => {
        if (playingRiff === id) {
            setPlayingRiff(null)
        } else {
            setPlayingRiff(id)
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
