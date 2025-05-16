"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Coins, Lock, Plus, Trash2, Edit, Save, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import apiService from "@/services/api"

interface TippingTier {
    id: string
    name: string
    amount: number
    description: string
    perks: string[]
    image?: string
    isActive?: boolean
    supporterCount?: number
}

interface TippingTiersProps {
    isOwner: boolean
    isEditing: boolean
    userId?: string
}

export default function TippingTiers({ isOwner, isEditing, userId }: TippingTiersProps) {
    const [tiers, setTiers] = useState<TippingTier[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editingTier, setEditingTier] = useState<string | null>(null)
    const [newTierName, setNewTierName] = useState("")
    const [newTierAmount, setNewTierAmount] = useState("")
    const [newTierDescription, setNewTierDescription] = useState("")
    const [newTierPerks, setNewTierPerks] = useState<string[]>([])

    useEffect(() => {
        const fetchTippingTiers = async () => {
            if (!userId) return

            try {
                setIsLoading(true)

                // Mock data for now
                // setTiers([
                //     {
                //         id: "tier-1",
                //         name: "Supporter",
                //         amount: 100,
                //         description: "Access to exclusive behind-the-scenes content and early previews of upcoming riffs.",
                //         perks: ["Exclusive updates", "Early access to new riffs"],
                //         image: "/placeholder.svg?height=200&width=200&query=synthwave+badge+1",
                //     },
                //     {
                //         id: "tier-2",
                //         name: "Enthusiast",
                //         amount: 500,
                //         description: "All previous perks plus access to private livestreams and unreleased demo riffs.",
                //         perks: ["Private livestreams", "Unreleased demos", "Monthly Q&A"],
                //         image: "/placeholder.svg?height=200&width=200&query=synthwave+badge+2",
                //     },
                //     {
                //         id: "tier-3",
                //         name: "Patron",
                //         amount: 1000,
                //         description: "All previous perks plus personalized feedback on your own music and exclusive collaborations.",
                //         perks: ["Personalized feedback", "Exclusive collaborations", "Discord role"],
                //         image: "/placeholder.svg?height=200&width=200&query=synthwave+badge+3",
                //     },
                // ])

                let tiersData: TippingTier[]

                if (isOwner) {
                    // If owner, fetch all tiers including inactive ones
                    tiersData = await apiService.getTippingTiers()
                } else {
                    // If not owner, fetch only active tiers
                    tiersData = await apiService.getUserTippingTiers(userId)
                }

                setTiers(tiersData)
                setError(null)
            } catch (err) {
                console.error("Error fetching tipping tiers:", err)
                setError("Failed to load tipping tiers")
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load tipping tiers. Please try again.",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchTippingTiers()
    }, [userId, isOwner, apiService])

    const saveTierChanges = async (tierId: string) => {
        try {
            setIsSaving(true)
            const updatedTier = await apiService.updateTippingTier(tierId, {
                name: newTierName,
                amount: Number.parseFloat(newTierAmount),
                description: newTierDescription,
                perks: newTierPerks,
            })

            // Update local state
            setTiers(
                tiers.map((tier) => {
                    if (tier.id === tierId) {
                        return updatedTier
                    }
                    return tier
                }),
            )
            setEditingTier(null)
            toast({
                title: "Tier Updated",
                description: "Tipping tier has been updated successfully.",
            })
        } catch (error) {
            console.error("Error updating tipping tier:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update tipping tier. Please try again.",
            })
        } finally {
            setIsSaving(false)
        }
    }

    const deleteTier = async (tierId: string) => {
        try {
            await apiService.deleteTippingTier(tierId)

            // Update local state
            setTiers(tiers.filter((tier) => tier.id !== tierId))

            toast({
                title: "Tier Deleted",
                description: "Tipping tier has been deleted successfully.",
            })
        } catch (error) {
            console.error("Error deleting tipping tier:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to delete tipping tier. Please try again.",
            })
        }
    }

    const addNewTier = async () => {
        try {
            const newTier = await apiService.createTippingTier({
                name: "New Tier",
                amount: 250,
                description: "Description for the new tier.",
                perks: ["New perk"],
                image: "/placeholder-7rt89.png",
                isActive: true,
            })

            setTiers([...tiers, newTier])
            startEditingTier(newTier.id)
        } catch (error) {
            console.error("Error creating tipping tier:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create tipping tier. Please try again.",
            })
        }
    }

    const startEditingTier = (tierId: string) => {
        const tier = tiers.find((tier) => tier.id === tierId)
        if (tier) {
            setEditingTier(tierId)
            setNewTierName(tier.name)
            setNewTierAmount(tier.amount.toString())
            setNewTierDescription(tier.description)
            setNewTierPerks(tier.perks || [])
        }
    }

    const toggleTierActive = async (tierId: string, isActive: boolean) => {
        try {
            const tier = tiers.find((t) => t.id === tierId)
            if (!tier) return

            await apiService.updateTippingTier(tierId, {
                ...tier,
                isActive: !isActive,
            })

            // Update local state
            setTiers(
                tiers.map((t) => {
                    if (t.id === tierId) {
                        return { ...t, isActive: !isActive }
                    }
                    return t
                }),
            )

            toast({
                title: isActive ? "Tier Deactivated" : "Tier Activated",
                description: `Tipping tier has been ${isActive ? "deactivated" : "activated"} successfully.`,
            })
        } catch (error) {
            console.error("Error toggling tier active state:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update tier status. Please try again.",
            })
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Backstage Access</h2>
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
                    <h2 className="text-2xl font-bold">Backstage Access</h2>
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Backstage Access</h2>
                {isOwner && !isEditing && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                        onClick={addNewTier}
                    >
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
                                        onChange={(e) => setNewTierAmount(e.target.value.replace(/[^0-9.]/g, ""))}
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
                                <div className="space-y-2">
                                    <Label>Perks (one per line)</Label>
                                    <Textarea
                                        value={newTierPerks.join("\n")}
                                        onChange={(e) => setNewTierPerks(e.target.value.split("\n").filter((perk) => perk.trim() !== ""))}
                                        className="bg-zinc-800/50 border-zinc-700"
                                        rows={3}
                                        placeholder="Enter perks, one per line"
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
                                        disabled={isSaving}
                                    >
                                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
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
                                            <button
                                                onClick={() => deleteTier(tier.id)}
                                                className="p-1.5 bg-zinc-800/80 rounded-full text-zinc-400 hover:text-red-400"
                                            >
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
                                        {tier.perks.map((perk: any, index: number) => (
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
                                                    <Switch
                                                        id={`tier-active-${tier.id}`}
                                                        checked={tier.isActive !== false}
                                                        onCheckedChange={() => toggleTierActive(tier.id, tier.isActive !== false)}
                                                    />
                                                    <Label htmlFor={`tier-active-${tier.id}`}>Active</Label>
                                                </div>
                                                <span className="text-xs text-zinc-500">{tier.supporterCount || 0} supporters</span>
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
