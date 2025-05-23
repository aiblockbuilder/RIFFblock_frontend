"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Coins, Music, Heart, ArrowUpRight, MessageSquare, RefreshCw } from "lucide-react"
import { userApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import { ActivityResponse } from "@/types/api-response"

interface ActivityFeedProps {
    walletAddress: string
}

export default function ActivityFeed({ walletAddress }: ActivityFeedProps) {
    const [activities, setActivities] = useState<ActivityResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    const fetchActivities = async () => {
        try {
            const response = await userApi.getAllActivity()
            // console.log(">>> get activity response : ", response)
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
            setIsRefreshing(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await fetchActivities()
    }

    useEffect(() => {
        if (!walletAddress) {
            setIsLoading(false)
            return
        }
        fetchActivities()
    }, [walletAddress])

    const getActivityIcon = (type: ActivityResponse['type']) => {
        switch (type) {
            case "upload":
                return <Music className="h-5 w-5 text-violet-400" />
            case "tip":
                return <Coins className="h-5 w-5 text-yellow-400" />
            case "favorite":
                return <Heart className="h-5 w-5 text-red-400" />
            case "stake":
                return <ArrowUpRight className="h-5 w-5 text-green-400" />
            default:
                return <Music className="h-5 w-5 text-violet-400" />
        }
    }

    const getActivityTitle = (activity: ActivityResponse) => {
        switch (activity.type) {
            case "upload":
                return `${activity.fromUser.name} uploaded a new riff`
            case "tip":
                return `${activity.fromUser.name} tipped ${activity.toUser.name}`
            case "stake":
                return `${activity.fromUser.name} staked ${activity.amount} tokens`
            case "favorite":
                return `${activity.fromUser.name} favorited ${activity.toUser.name}'s riff`
            default:
                return ""
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Activity</h2>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-zinc-800 text-zinc-400 hover:text-zinc-300"
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
            </div>

            <div className="space-y-4">
                {activities.map((activity) => (
                    <div
                        key={`${activity.type}-${activity.activityId}-${activity.timestamp}`}
                        className="p-4 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg hover:border-zinc-700 transition-all"
                    >
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                    <span className="font-medium">{getActivityTitle(activity)}</span>
                                    <a href="#" className="text-violet-400 hover:underline">
                                        {activity.riffName}
                                    </a>
                                </div>

                                <div className="flex items-center gap-2 mt-2">
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                        <Image
                                            src={activity.fromUser.avatar || "/placeholder.svg"}
                                            alt={activity.fromUser.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <span className="text-sm">
                                        From{" "}
                                        <a href="#" className="text-blue-400 hover:underline">
                                            {activity.fromUser.name}
                                        </a>
                                    </span>
                                </div>

                                {(activity.type === 'tip' || activity.type === 'stake') && (
                                    <div className="mt-2 text-sm text-yellow-400">
                                        Amount: {activity.amount} tokens
                                    </div>
                                )}

                                <div className="mt-2 text-xs text-zinc-500">
                                    {new Date(activity.timestamp).toLocaleString()}
                                </div>
                            </div>

                            <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                    src={activity.riffImage || "/placeholder.svg"}
                                    alt={activity.riffName}
                                    fill
                                    className="object-cover"
                                />
                            </div>
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
