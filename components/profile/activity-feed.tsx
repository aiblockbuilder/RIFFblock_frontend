"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Coins, Music, Heart, ArrowUpRight, MessageSquare, RefreshCw } from "lucide-react"
import { userApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

interface ActivityFeedProps {
    walletAddress: string
}

export default function ActivityFeed({ walletAddress }: ActivityFeedProps) {
    const [activities, setActivities] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchActivities() {
            if (!walletAddress) {
                setIsLoading(false)
                return
            }

            try {
                const response = await userApi.getUserActivity(walletAddress)
                setActivities(response)
            } catch (error) {
                console.error("Error fetching activities:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load activity feed",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchActivities()
    }, [walletAddress])

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
