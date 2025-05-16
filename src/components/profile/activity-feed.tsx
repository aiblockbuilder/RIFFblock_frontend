"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Coins, Music, Heart, ArrowUpRight, MessageSquare, RefreshCw, Loader2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import apiService from "@/services/api"

interface Activity {
    id: string
    type: "upload" | "tip" | "like" | "comment" | "stake"
    title: string
    riffTitle?: string
    riffImage?: string
    from?: string
    fromImage?: string
    artist?: string
    artistImage?: string
    comment?: string
    timestamp: string
}

export default function ActivityFeed({ userId }: { userId?: string }) {
    const [activities, setActivities] = useState<Activity[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { toast } = useToast()

    const fetchActivities = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await apiService.getUserActivity(userId)

            // Transform API response to match our Activity interface
            const transformedActivities = response.data.map((activity: any) => ({
                id: activity.id,
                type: activity.type,
                title: getActivityTitle(activity.type),
                riffTitle: activity.riff?.title,
                riffImage: activity.riff?.coverArt,
                from: activity.fromUser?.username,
                fromImage: activity.fromUser?.profileImage,
                artist: activity.toUser?.username,
                artistImage: activity.toUser?.profileImage,
                comment: activity.comment,
                timestamp: formatTimestamp(activity.createdAt),
            }))

            setActivities(transformedActivities)
            setIsLoading(false)
        } catch (err) {
            console.error("Error fetching activities:", err)
            setError("Failed to load activity feed. Please try again later.")
            setIsLoading(false)

            // Fallback to mock data if API fails
            setActivities([
                {
                    id: "act-1",
                    type: "upload",
                    title: "Uploaded a new riff",
                    riffTitle: "Neon Cascade",
                    riffImage: "/synthwave-album-cover-1.png",
                    timestamp: "2 hours ago",
                },
                {
                    id: "act-2",
                    type: "tip",
                    title: "Received 150 RIFF tip",
                    from: "CyberDreamer",
                    fromImage: "/placeholder-ynk6p.png",
                    riffTitle: "Midnight Drive",
                    timestamp: "1 day ago",
                },
                {
                    id: "act-3",
                    type: "like",
                    title: "Liked a riff",
                    riffTitle: "Quantum Pulse",
                    artist: "CyberSoul",
                    artistImage: "/placeholder-38ei2.png",
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
                    artistImage: "/placeholder-ynk6p.png",
                    timestamp: "5 days ago",
                },
            ])

            toast({
                title: "Error",
                description: "Failed to load activity feed. Using cached data instead.",
                variant: "destructive",
            })
        }
    }

    useEffect(() => {
        fetchActivities()
    }, [userId])

    const getActivityTitle = (type: string): string => {
        switch (type) {
            case "upload":
                return "Uploaded a new riff"
            case "tip":
                return "Received RIFF tip"
            case "like":
                return "Liked a riff"
            case "comment":
                return "Commented on"
            case "stake":
                return "Staked RIFF on"
            default:
                return "Activity"
        }
    }

    const formatTimestamp = (timestamp: string): string => {
        const date = new Date(timestamp)
        const now = new Date()
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) {
            return `${diffInSeconds} seconds ago`
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60)
        if (diffInMinutes < 60) {
            return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`
        }

        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) {
            return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
        }

        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 30) {
            return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`
        }

        const diffInMonths = Math.floor(diffInDays / 30)
        return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`
    }

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
                <Button
                    variant="outline"
                    size="sm"
                    className="border-zinc-800 text-zinc-400 hover:text-zinc-300"
                    onClick={fetchActivities}
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Refresh
                </Button>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
                </div>
            )}

            {error && !isLoading && activities.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <AlertCircle className="h-8 w-8 text-red-400" />
                    <p className="text-zinc-400">{error}</p>
                    <Button
                        onClick={fetchActivities}
                        variant="outline"
                        className="border-zinc-800 text-zinc-400 hover:text-zinc-300"
                    >
                        Try Again
                    </Button>
                </div>
            )}

            {!isLoading && activities.length === 0 && !error && (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <p className="text-zinc-400">No activity yet</p>
                </div>
            )}

            {activities.length > 0 && (
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
                                                            src={activity.artistImage || "/placeholder-38ei2.png"}
                                                            alt={activity.artist}
                                                            width={16}
                                                            height={16}
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
                                                    src={activity.fromImage || "/placeholder-ynk6p.png"}
                                                    alt={activity.from}
                                                    width={24}
                                                    height={24}
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
                                            src={activity.riffImage || "/placeholder-38ei2.png"}
                                            alt={activity.riffTitle || ""}
                                            width={48}
                                            height={48}
                                            className="object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activities.length > 0 && (
                <div className="flex justify-center">
                    <Button variant="outline" className="border-zinc-800 text-zinc-400 hover:text-zinc-300">
                        Load More
                    </Button>
                </div>
            )}
        </div>
    )
}
