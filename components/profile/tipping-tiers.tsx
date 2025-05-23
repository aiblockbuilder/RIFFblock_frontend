"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Coins, Lock, Plus, Trash2, Edit, Save, X } from "lucide-react"
import { userApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import { TippingTier } from "@/types/api-response"

interface TippingTiersProps {
    isOwner: boolean
    isEditing: boolean
    walletAddress: string
}

export default function TippingTiers({ isOwner, isEditing, walletAddress }: TippingTiersProps) {
    const [tippingTiers, setTippingTiers] = useState<TippingTier[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [newTier, setNewTier] = useState({
        name: "",
        amount: "",
        description: "",
        perks: [""]
    })

    useEffect(() => {
        async function fetchTippingTiers() {
            if (!walletAddress) {
                setIsLoading(false)
                return
            }

            try {
                const response = await userApi.getUserTippingTiers(walletAddress)
                setTippingTiers(response)
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

    const [editingTier, setEditingTier] = useState<number | null>(null)
    const [newTierName, setNewTierName] = useState("")
    const [newTierAmount, setNewTierAmount] = useState("")
    const [newTierDescription, setNewTierDescription] = useState("")

    const startEditingTier = (tierId: number) => {
        const tier = tippingTiers.find((t) => t.id === tierId)
        if (tier) {
            setNewTierName(tier.name)
            setNewTierAmount(tier.amount.toString())
            setNewTierDescription(tier.description)
            setEditingTier(tierId)
        }
    }

    const saveTierChanges = async (tierId: number) => {
        try {
            const updatedTierData = {
                name: newTierName,
                amount: Number.parseInt(newTierAmount),
                description: newTierDescription,
                // Keep existing perks if not being updated
                perks: tippingTiers.find(t => t.id === tierId)?.perks
            }

            const response = await userApi.updateTippingTier(tierId, updatedTierData)
            
            // Update local state with the response data
            setTippingTiers(
                tippingTiers.map((tier) => {
                    if (tier.id === tierId) {
                        return response.tier
                    }
                    return tier
                })
            )

            toast({
                title: "Success",
                description: "Tipping tier updated successfully",
            })

            setEditingTier(null)
        } catch (error) {
            console.error("Error updating tipping tier:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update tipping tier. Please try again.",
            })
        }
    }

    const handleAddTier = () => {
        setIsCreating(true)
        setNewTier({
            name: "",
            amount: "",
            description: "",
            perks: [""]
        })
    }

    const handleCancelCreate = () => {
        setIsCreating(false)
        setNewTier({
            name: "",
            amount: "",
            description: "",
            perks: [""]
        })
    }

    const handleAddPerk = () => {
        setNewTier(prev => ({
            ...prev,
            perks: [...prev.perks, ""]
        }))
    }

    const handleRemovePerk = (index: number) => {
        setNewTier(prev => ({
            ...prev,
            perks: prev.perks.filter((_, i) => i !== index)
        }))
    }

    const handlePerkChange = (index: number, value: string) => {
        setNewTier(prev => ({
            ...prev,
            perks: prev.perks.map((perk, i) => i === index ? value : perk)
        }))
    }

    const handleCreateTier = async () => {
        try {
            if (!newTier.name || !newTier.amount) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Name and amount are required",
                })
                return
            }

            const tierData = {
                name: newTier.name,
                amount: Number(newTier.amount),
                description: newTier.description || "",
                perks: newTier.perks.filter(perk => perk.trim() !== "")
            }

            const response = await userApi.createTippingTier(walletAddress, tierData)
            
            setTippingTiers(prev => [...prev, response.tier])
            
            toast({
                title: "Success",
                description: "Tipping tier created successfully",
            })

            setIsCreating(false)
        } catch (error) {
            console.error("Error creating tipping tier:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create tipping tier. Please try again.",
            })
        }
    }

    const handleDeleteTier = async (tierId: number) => {
        try {
            await userApi.deleteTippingTier(tierId)
            
            // Update local state by removing the deleted tier
            setTippingTiers(prev => prev.filter(tier => tier.id !== tierId))
            
            toast({
                title: "Success",
                description: "Tipping tier deleted successfully",
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

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Backstage Access</h2>
                {isOwner && !isEditing && !isCreating && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                        onClick={handleAddTier}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tier
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {isCreating && (
                    <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg overflow-hidden hover:border-violet-500/30 transition-all">
                        <div className="p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">Create New Tier</h3>
                                <button
                                    onClick={handleCancelCreate}
                                    className="p-1.5 bg-zinc-800/80 rounded-full text-zinc-400 hover:text-zinc-300"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-tier-name">Tier Name</Label>
                                <Input
                                    id="new-tier-name"
                                    value={newTier.name}
                                    onChange={(e) => setNewTier(prev => ({ ...prev, name: e.target.value }))}
                                    className="bg-zinc-800/50 border-zinc-700"
                                    placeholder="Enter tier name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-tier-amount">RIFF Amount</Label>
                                <Input
                                    id="new-tier-amount"
                                    value={newTier.amount}
                                    onChange={(e) => setNewTier(prev => ({ ...prev, amount: e.target.value.replace(/[^0-9]/g, "") }))}
                                    className="bg-zinc-800/50 border-zinc-700"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-tier-description">Description</Label>
                                <Textarea
                                    id="new-tier-description"
                                    value={newTier.description}
                                    onChange={(e) => setNewTier(prev => ({ ...prev, description: e.target.value }))}
                                    className="bg-zinc-800/50 border-zinc-700"
                                    placeholder="Enter description"
                                    rows={3}
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Perks</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleAddPerk}
                                        className="border-zinc-700 text-zinc-400"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Perk
                                    </Button>
                                </div>
                                {newTier.perks.map((perk, index) => (
                                    <div key={index} className="flex gap-2">
                                        <Input
                                            value={perk}
                                            onChange={(e) => handlePerkChange(index, e.target.value)}
                                            className="bg-zinc-800/50 border-zinc-700"
                                            placeholder={`Perk ${index + 1}`}
                                        />
                                        <button
                                            onClick={() => handleRemovePerk(index)}
                                            className="p-2 bg-zinc-800/80 rounded-lg text-zinc-400 hover:text-red-400"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-zinc-700 text-zinc-400"
                                    onClick={handleCancelCreate}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-violet-600 hover:bg-violet-700"
                                    onClick={handleCreateTier}
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Create Tier
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {tippingTiers.map((tier) => (
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
                                            <Image src="/unused-idea.png" alt={tier.name} fill className="object-contain" />
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
                                                onClick={() => handleDeleteTier(tier.id)}
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
                                        {tier.perks.map((perk, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm">
                                                <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                                <span>{perk.replace(/['"]/g, '')}</span>
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
