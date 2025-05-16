"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Coins, Music, Heart, ArrowUpRight, MessageSquare, RefreshCw } from "lucide-react"

export default function ActivityFeed() {
    const [activities, setActivities] = useState([
        {
            id: "act-1",
            type: "upload",
            title: "Uploaded a new riff",
            riffTitle: "Neon Cascade",
            riffImage: "/synthwave-album-cover-1.jpg",
            timestamp: "2 hours ago",
        },
        {
            id: "act-2",
            type: "tip",
            title: "Received 150 RIFF tip",
            from: "CyberDreamer",
            fromImage: "/placeholder.svg?height=100&width=100&query=cyberpunk+profile",
            riffTitle: "Midnight Drive",
            timestamp: "1 day ago",
        },
        {
            id: "act-3",
            type: "like",
            title: "Liked a riff",
            riffTitle: "Quantum Pulse",
            artist: "CyberSoul",
            artistImage: "/placeholder.svg?height=100&width=100&query=futuristic+profile",
            timestamp: "2 days ago",
        },
        {
            id: "act-4",
            type: "comment",
            title: "Commented on",
            riffTitle: "Digital Dreams",
            comment: "This bassline is incredible! Would love to collaborate sometime.",
            timestamp: "3 days ago",
        },
        {
            id: "act-5",
            type: "stake",
            title: "Staked 500 RIFF on",
            riffTitle: "Analog Sunset",
            artist: "RetroWave",
            artistImage: "/placeholder.svg?height=100&width=100&query=retro+profile",
            timestamp: "5 days ago",
        },
    ])

    const getActivityIcon = (type: string) => {
        switch (type) {
            case "upload":
                return <Music className="h-5 w-5 text-violet-400" />
            case "tip":
                return <Coins className="h-5 w-5 text-yellow-400" />
            case "like":
                return <Heart className="h-5 w-5 text-red-400" />
            case "comment":
                return <MessageSquare className="h-5 w-5 text-blue-400" />
            case "stake":
                return <ArrowUpRight className="h-5 w-5 text-green-400" />
            default:
                return <Music className="h-5 w-5 text-violet-400" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Activity</h2>
                <Button variant="outline" size="sm" className="border-zinc-800 text-zinc-400 hover:text-zinc-300">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                </Button>
            </div>

            <div className="space-y-4">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className="p-4 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all"
                    >
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <span className="font-medium">{activity.title}</span>
                                    {activity.riffTitle && (
                                        <a href="#" className="text-violet-400 hover:underline">
                                            {activity.riffTitle}
                                        </a>
                                    )}
                                    {activity.artist && (
                                        <div className="flex items-center gap-1">
                                            <span>by</span>
                                            <div className="flex items-center gap-1">
                                                <div className="relative w-4 h-4 rounded-full overflow-hidden">
                                                    <Image
                                                        src={activity.artistImage || "/placeholder.svg"}
                                                        alt={activity.artist}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <a href="#" className="text-blue-400 hover:underline">
                                                    {activity.artist}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {activity.from && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                            <Image
                                                src={activity.fromImage || "/placeholder.svg"}
                                                alt={activity.from}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="text-sm">
                                            From{" "}
                                            <a href="#" className="text-blue-400 hover:underline">
                                                {activity.from}
                                            </a>
                                        </span>
                                    </div>
                                )}

                                {activity.comment && (
                                    <div className="mt-2 p-3 bg-zinc-800/50 rounded-lg text-sm text-zinc-300">"{activity.comment}"</div>
                                )}

                                <div className="mt-2 text-xs text-zinc-500">{activity.timestamp}</div>
                            </div>

                            {activity.riffImage && (
                                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                    <Image
                                        src={activity.riffImage || "/placeholder.svg"}
                                        alt={activity.riffTitle || ""}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center">
                <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-zinc-300">
                    Load More
                </Button>
            </div>
        </div>
    )
}
