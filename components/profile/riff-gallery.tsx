"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Heart, Share2, Plus, MoreHorizontal, Clock, Grid3x3, List } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface RiffGalleryProps {
    isOwner: boolean
    isEditing: boolean
}

export default function RiffGallery({ isOwner, isEditing }: RiffGalleryProps) {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [sortBy, setSortBy] = useState("newest")
    const [playingRiff, setPlayingRiff] = useState<string | null>(null)

    // Mock data for riffs
    const riffs = [
        {
            id: "riff-1",
            title: "Neon Cascade",
            image: "/synthwave-album-cover-1.jpg",
            duration: "0:32",
            date: "2023-12-15",
            plays: 1245,
            tips: 350,
            isNft: true,
        },
        {
            id: "riff-2",
            title: "Midnight Drive",
            image: "/synthwave-album-cover-2.jpg",
            duration: "0:45",
            date: "2023-11-28",
            plays: 987,
            tips: 210,
            isNft: true,
        },
        {
            id: "riff-3",
            title: "Cyber Dawn",
            image: "/synthwave-album-cover-3.jpg",
            duration: "0:38",
            date: "2023-10-05",
            plays: 2341,
            tips: 520,
            isNft: true,
        },
        {
            id: "riff-4",
            title: "Retro Pulse",
            image: "/synthwave-album-cover-4.jpg",
            duration: "0:29",
            date: "2023-09-17",
            plays: 1876,
            tips: 430,
            isNft: true,
        },
        {
            id: "riff-5",
            title: "Digital Dreams",
            image: "/synthwave-album-cover-2.jpg",
            duration: "0:41",
            date: "2023-08-22",
            plays: 1532,
            tips: 280,
            isNft: true,
        },
        {
            id: "riff-6",
            title: "Analog Sunset",
            image: "/synthwave-album-cover-4.jpg",
            duration: "0:36",
            date: "2023-07-30",
            plays: 1124,
            tips: 190,
            isNft: false,
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold">Riffs</h2>
                <div className="flex flex-wrap gap-3">
                    <div className="flex items-center bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 ${viewMode === "grid" ? "bg-violet-500/20 text-violet-300" : "text-zinc-400 hover:text-zinc-300"}`}
                        >
                            <Grid3x3 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 ${viewMode === "list" ? "bg-violet-500/20 text-violet-300" : "text-zinc-400 hover:text-zinc-300"}`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px] bg-zinc-900/50 border-zinc-800">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-800">
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="popular">Most Popular</SelectItem>
                            <SelectItem value="tips">Most Tips</SelectItem>
                        </SelectContent>
                    </Select>
                    {isOwner && (
                        <Button className="bg-violet-600 hover:bg-violet-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Upload Riff
                        </Button>
                    )}
                </div>
            </div>

            {viewMode === "grid" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {riffs.map((riff) => (
                        <div
                            key={riff.id}
                            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden hover:border-violet-500/30 transition-all group"
                        >
                            <div className="relative aspect-square">
                                <Image src={riff.image || "/placeholder.svg"} alt={riff.title} fill className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => togglePlay(riff.id)}
                                        className="w-12 h-12 rounded-full bg-violet-600/90 hover:bg-violet-700/90 flex items-center justify-center transition-all transform scale-90 group-hover:scale-100"
                                    >
                                        {playingRiff === riff.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                                    </button>
                                </div>
                                {riff.isNft && (
                                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500/20 backdrop-blur-sm rounded text-xs text-blue-300">
                                        NFT
                                    </div>
                                )}
                                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-zinc-300 flex items-center">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {riff.duration}
                                </div>
                            </div>
                            <div className="p-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium text-sm truncate">{riff.title}</h3>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1 text-zinc-400 hover:text-zinc-300">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Heart className="mr-2 h-4 w-4" />
                                                <span>Like</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">
                                                <Share2 className="mr-2 h-4 w-4" />
                                                <span>Share</span>
                                            </DropdownMenuItem>
                                            {isOwner && (
                                                <>
                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <span>Edit</span>
                                                    </DropdownMenuItem>
                                                </>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex justify-between items-center mt-2 text-xs text-zinc-500">
                                    <div>{riff.plays.toLocaleString()} plays</div>
                                    <div className="text-violet-400">{riff.tips.toLocaleString()} RIFF</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {riffs.map((riff) => (
                        <div
                            key={riff.id}
                            className="flex items-center gap-4 p-3 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg hover:border-violet-500/30 transition-all"
                        >
                            <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                <Image src={riff.image || "/placeholder.svg"} alt={riff.title} fill className="object-cover" />
                                {riff.isNft && <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-blue-500 rounded-full"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{riff.title}</h3>
                                <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                    <div>{riff.plays.toLocaleString()} plays</div>
                                    <div>{riff.duration}</div>
                                    <div>{new Date(riff.date).toLocaleDateString()}</div>
                                </div>
                            </div>
                            <div className="text-sm text-violet-400 font-medium">{riff.tips.toLocaleString()} RIFF</div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => togglePlay(riff.id)}
                                    className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-violet-600/90 flex items-center justify-center transition-colors"
                                >
                                    {playingRiff === riff.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                                </button>
                                <button className="p-1.5 text-zinc-400 hover:text-zinc-300">
                                    <Heart className="h-4 w-4" />
                                </button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1.5 text-zinc-400 hover:text-zinc-300">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-zinc-900 border-zinc-800">
                                        <DropdownMenuItem className="cursor-pointer">
                                            <Share2 className="mr-2 h-4 w-4" />
                                            <span>Share</span>
                                        </DropdownMenuItem>
                                        {isOwner && (
                                            <>
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                <DropdownMenuItem className="cursor-pointer">
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
