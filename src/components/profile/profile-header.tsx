"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Twitter, Instagram, Globe, MapPin, Camera } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ProfileHeaderProps {
    profile: any
    isOwner: boolean
    isEditing: boolean
    setIsEditing: (value: boolean) => void
}

export default function ProfileHeader({ profile, isOwner, isEditing, setIsEditing }: ProfileHeaderProps) {
    const [name, setName] = useState(profile.name)
    const [bio, setBio] = useState(profile.bio)
    const [location, setLocation] = useState(profile.location)
    const [twitter, setTwitter] = useState(profile.socialLinks.twitter)
    const [instagram, setInstagram] = useState(profile.socialLinks.instagram)
    const [website, setWebsite] = useState(profile.socialLinks.website)

    const copyWalletAddress = () => {
        navigator.clipboard.writeText(profile.ensName || "0x1234...5678")
        toast({
            title: "Address Copied",
            description: "Wallet address copied to clipboard.",
        })
    }

    return (
        <div className="relative">
            {/* Cover Image */}
            <div className="relative h-48 md:h-64 w-full rounded-xl overflow-hidden">
                <Image src={profile.coverImage || "/profile_avatar.jpg"} alt="Cover" fill className="object-cover" priority />
                {isEditing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Button variant="outline" className="bg-black/50 border-white/20">
                            <Camera className="mr-2 h-4 w-4" />
                            Change Cover
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Info */}
            <div className="relative -mt-16 md:-mt-20 px-4 md:px-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-xl overflow-hidden border-4 border-[#0d0d0d] bg-zinc-900">
                        <Image src={profile.avatar || "/neon-profile.png"} alt={profile.name} fill className="object-cover" />
                        {isEditing && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Button variant="outline" size="sm" className="bg-black/50 border-white/20">
                                    <Camera className="mr-2 h-4 w-4" />
                                    Change
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Profile Details */}
                    <div className="flex-1 pt-4 md:pt-16">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                {isEditing ? (
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="text-2xl font-bold bg-zinc-900/50 border-zinc-700 mb-2"
                                        placeholder="Artist Name"
                                    />
                                ) : (
                                    <h1 className="text-3xl md:text-4xl font-bold">{profile.name}</h1>
                                )}

                                <div className="flex items-center gap-2 text-zinc-400 mt-1">
                                    {isEditing ? (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <Input
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="text-sm bg-zinc-900/50 border-zinc-700"
                                                placeholder="Location (optional)"
                                            />
                                        </div>
                                    ) : (
                                        profile.location && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{profile.location}</span>
                                            </div>
                                        )
                                    )}

                                    <div className="flex items-center gap-1 bg-zinc-900/80 px-2 py-1 rounded-full text-xs">
                                        <span>{profile.ensName || "0x1234...5678"}</span>
                                        <button onClick={() => copyWalletAddress()} className="text-zinc-500 hover:text-zinc-300">
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="flex mt-4 gap-4 md:gap-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-violet-400">{profile.stats.totalRiffs}</div>
                                    <div className="text-xs text-zinc-500">Riffs</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-violet-400">{profile.stats.followers.toLocaleString()}</div>
                                    <div className="text-xs text-zinc-500">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-violet-400">{profile.stats.totalTips.toLocaleString()}</div>
                                    <div className="text-xs text-zinc-500">RIFF Tips</div>
                                </div>
                            </div>
                        </div>

                        {/* Bio */}
                        <div className="mt-4">
                            {isEditing ? (
                                <Textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-zinc-900/50 border-zinc-700"
                                    placeholder="Write a short bio..."
                                    rows={3}
                                />
                            ) : (
                                <p className="text-zinc-300 text-sm md:text-base">{profile.bio}</p>
                            )}
                        </div>

                        {/* Genres & Influences */}
                        {!isEditing && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {profile.genres.map((genre: string) => (
                                    <span key={genre} className="px-2 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs">
                                        {genre}
                                    </span>
                                ))}
                                {profile.influences.map((influence: string) => (
                                    <span key={influence} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                                        {influence}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Social Links */}
                        <div className="mt-4 flex gap-3">
                            {isEditing ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2">
                                        <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                                        <Input
                                            value={twitter}
                                            onChange={(e) => setTwitter(e.target.value)}
                                            className="border-0 bg-transparent p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            placeholder="Twitter URL"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2">
                                        <Instagram className="h-4 w-4 text-[#E1306C]" />
                                        <Input
                                            value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                            className="border-0 bg-transparent p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            placeholder="Instagram URL"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2 bg-zinc-900/50 border border-zinc-800 rounded-lg p-2">
                                        <Globe className="h-4 w-4 text-zinc-400" />
                                        <Input
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            className="border-0 bg-transparent p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
                                            placeholder="Website URL"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {profile.socialLinks.twitter && (
                                        <a
                                            href={profile.socialLinks.twitter}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                                        </a>
                                    )}
                                    {profile.socialLinks.instagram && (
                                        <a
                                            href={profile.socialLinks.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <Instagram className="h-5 w-5 text-[#E1306C]" />
                                        </a>
                                    )}
                                    {profile.socialLinks.website && (
                                        <a
                                            href={profile.socialLinks.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition-colors"
                                        >
                                            <Globe className="h-5 w-5 text-zinc-400" />
                                        </a>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
