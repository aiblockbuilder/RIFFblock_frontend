"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Coins, Lock, Plus, Trash2, Edit, Save } from "lucide-react"
import { userApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"

interface TippingTiersProps {
    isOwner: boolean
    isEditing: boolean
    walletAddress: string
}

export default function TippingTiers({ isOwner, isEditing, walletAddress }: TippingTiersProps) {
    const [tippingTiers, setTippingTiers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchTippingTiers() {
            if (!walletAddress) {
                setIsLoading(false)
                return
            }

            try {
                const response = await userApi.getUserTippingTiers(walletAddress)
                setTippingTiers(response.data.tippingTiers || [])
            } catch (error) {
                console.error("Error fetching tipping tiers:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load tipping tiers",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchTippingTiers()
    }, [walletAddress])

    const [tiers, setTiers] = useState([
        {
            id: "tier-1",
            name: "Supporter",
            amount: 100,
            description: "Access to exclusive behind-the-scenes content and early previews of upcoming riffs.",
            perks: ["Exclusive updates", "Early access to new riffs"],
            image: "/placeholder-z2znj.png",
        },
        {
            id: "tier-2",
            name: "Enthusiast",
            amount: 500,
            description: "All previous perks plus access to private livestreams and unreleased demo riffs.",
            perks: ["Private livestreams", "Unreleased demos", "Monthly Q&A"],
            image: "/synthwave-badge-2.png",
        },
        {
            id: "tier-3",
            name: "Patron",
            amount: 1000,
            description: "All previous perks plus personalized feedback on your own music and exclusive collaborations.",
            perks: ["Personalized feedback", "Exclusive collaborations", "Discord role"],
            image: "/synthwave-badge-03.png",
        },
    ])

    const [editingTier, setEditingTier] = useState<string | null>(null)
    const [newTierName, setNewTierName] = useState("")
    const [newTierAmount, setNewTierAmount] = useState("")
    const [newTierDescription, setNewTierDescription] = useState("")

    const startEditingTier = (tierId: string) => {
        const tier = tiers.find((t) => t.id === tierId)
        if (tier) {
            setNewTierName(tier.name)
            setNewTierAmount(tier.amount.toString())
            setNewTierDescription(tier.description)
            setEditingTier(tierId)
        }
    }

    const saveTierChanges = (tierId: string) => {
        setTiers(
            tiers.map((tier) => {
                if (tier.id === tierId) {
                    return {
                        ...tier,
                        name: newTierName,
                        amount: Number.parseInt(newTierAmount),
                        description: newTierDescription,
                    }
                }
                return tier
            }),
        )
        setEditingTier(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Backstage Access</h2>
                {isOwner && !isEditing && (
                    <Button variant="outline" size="sm" className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tier
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiers.map((tier) => (
                    <div
                        key={tier.id}
                        className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden hover:border-violet-500/30 transition-all"
                    >
                        {editingTier === tier.id ? (
                            <div className="p-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor={`tier-name-${tier.id}`}>Tier Name</Label>
                                    <Input
                                        id={`tier-name-${tier.id}`}
                                        value={newTierName}
                                        onChange={(e) => setNewTierName(e.target.value)}
                                        className="bg-zinc-800/50 border-zinc-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`tier-amount-${tier.id}`}>RIFF Amount</Label>
                                    <Input
                                        id={`tier-amount-${tier.id}`}
                                        value={newTierAmount}
                                        onChange={(e) => setNewTierAmount(e.target.value.replace(/[^0-9]/g, ""))}
                                        className="bg-zinc-800/50 border-zinc-700"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`tier-description-${tier.id}`}>Description</Label>
                                    <Textarea
                                        id={`tier-description-${tier.id}`}
                                        value={newTierDescription}
                                        onChange={(e) => setNewTierDescription(e.target.value)}
                                        className="bg-zinc-800/50 border-zinc-700"
                                        rows={3}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-zinc-700 text-zinc-400"
                                        onClick={() => setEditingTier(null)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-violet-600 hover:bg-violet-700"
                                        onClick={() => saveTierChanges(tier.id)}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="relative h-40 bg-gradient-to-b from-violet-900/30 to-zinc-900/30">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative w-24 h-24">
                                            <Image src={tier.image || "/placeholder.svg"} alt={tier.name} fill className="object-contain" />
                                        </div>
                                    </div>
                                    {isOwner && !isEditing && (
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            <button
                                                onClick={() => startEditingTier(tier.id)}
                                                className="p-1.5 bg-zinc-800/80 rounded-full text-zinc-400 hover:text-zinc-300"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button className="p-1.5 bg-zinc-800/80 rounded-full text-zinc-400 hover:text-red-400">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-lg">{tier.name}</h3>
                                        <div className="flex items-center gap-1 text-violet-400 font-medium">
                                            <Coins className="h-4 w-4" />
                                            <span>{tier.amount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-zinc-400 mb-4">{tier.description}</p>
                                    <div className="space-y-2">
                                        {tier.perks.map((perk, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                                <span>{perk}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        {isOwner ? (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Switch id={`tier-active-${tier.id}`} defaultChecked />
                                                    <Label htmlFor={`tier-active-${tier.id}`}>Active</Label>
                                                </div>
                                                <span className="text-xs text-zinc-500">12 supporters</span>
                                            </div>
                                        ) : (
                                            <Button className="w-full bg-violet-600 hover:bg-violet-700">
                                                <Lock className="mr-2 h-4 w-4" />
                                                Unlock Access
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
