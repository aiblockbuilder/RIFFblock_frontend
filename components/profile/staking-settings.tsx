"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Coins, Percent, Info, Save } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { userApi } from "@/lib/api-client"
import { toast } from "@/components/ui/use-toast"
import type { StakingSettings } from "@/types/api-response"

interface StakingSettingsProps {
    walletAddress: string
}

export default function StakingSettings({ walletAddress }: StakingSettingsProps) {
    const [stakingSettings, setStakingSettings] = useState<StakingSettings | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        async function fetchStakingSettings() {
            if (!walletAddress) {
                setIsLoading(false)
                return
            }

            try {
                const response = await userApi.getStakingSettings(walletAddress)
                // console.log(">>> Staking settings fetched:", response)
                setStakingSettings(response)
            } catch (error) {
                console.error("Error fetching staking settings:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load staking settings",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchStakingSettings()
    }, [walletAddress])

    const handleSave = async () => {
        if (!stakingSettings) return

        setIsSaving(true)
        try {
            const response = await userApi.updateStakingSettings(walletAddress, {
                defaultStakingEnabled: stakingSettings.defaultStakingEnabled,
                defaultRoyaltyShare: stakingSettings.defaultRoyaltyShare,
                minimumStakeAmount: stakingSettings.minimumStakeAmount,
                lockPeriodDays: stakingSettings.lockPeriodDays
            })
            
            // Update local state with the response data
            setStakingSettings(response.settings)
            
            toast({
                title: "Success",
                description: response.message || "Staking settings updated successfully",
            })
        } catch (error) {
            console.error("Error updating staking settings:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update staking settings. Please try again.",
            })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    if (!stakingSettings) {
        return <div>No staking settings found</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Rifflords Staking Settings</h2>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Switch 
                                id="staking-enabled" 
                                checked={stakingSettings.defaultStakingEnabled} 
                                onCheckedChange={(checked) => setStakingSettings(prev => prev ? { ...prev, defaultStakingEnabled: checked } : null)} 
                            />
                            <Label htmlFor="staking-enabled" className="text-base font-medium">
                                Allow Staking on Riffs
                            </Label>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="text-zinc-500 hover:text-zinc-300">
                                        <Info className="h-4 w-4" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                    <p>Enable or disable staking on all your riffs globally.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                        <h3 className="text-lg font-medium mb-4">Global Default Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="default-royalty" className="flex items-center gap-1">
                                        <Percent className="h-4 w-4 text-violet-400" />
                                        Default Royalty Share
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button className="text-zinc-500 hover:text-zinc-300">
                                                    <Info className="h-4 w-4" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                <p>Percentage of royalties shared with stakers by default.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="default-royalty"
                                        type="text"
                                        value={stakingSettings.defaultRoyaltyShare}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, "")
                                            setStakingSettings(prev => prev ? { 
                                                ...prev, 
                                                defaultRoyaltyShare: value ? parseInt(value) : 0 
                                            } : null)
                                        }}
                                        className="bg-zinc-800/50 border-zinc-700 pr-8"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500">%</div>
                                </div>
                                <p className="text-xs text-zinc-500">
                                    This percentage will be shared among stakers based on their stake amount.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="minimum-stake" className="flex items-center gap-1">
                                        <Coins className="h-4 w-4 text-violet-400" />
                                        Minimum Stake Requirement
                                    </Label>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button className="text-zinc-500 hover:text-zinc-300">
                                                    <Info className="h-4 w-4" />
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                                <p>Minimum amount of RIFF tokens required to stake on your riffs.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="minimum-stake"
                                        type="text"
                                        value={stakingSettings.minimumStakeAmount}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, "")
                                            setStakingSettings(prev => prev ? { 
                                                ...prev, 
                                                minimumStakeAmount: value ? parseInt(value) : 0 
                                            } : null)
                                        }}
                                        className="bg-zinc-800/50 border-zinc-700 pr-12"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500">RIFF</div>
                                </div>
                                <p className="text-xs text-zinc-500">Users must stake at least this amount to receive royalties.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                        <h3 className="text-lg font-medium mb-4">Lock Period</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="lock-period" className="flex items-center gap-1">
                                    <Coins className="h-4 w-4 text-violet-400" />
                                    Lock Period (Days)
                                </Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button className="text-zinc-500 hover:text-zinc-300">
                                                <Info className="h-4 w-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-zinc-900 border-zinc-800 text-zinc-300">
                                            <p>Number of days staked tokens must remain locked.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="relative">
                                <Input
                                    id="lock-period"
                                    type="text"
                                    value={stakingSettings.lockPeriodDays}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/[^0-9]/g, "")
                                        setStakingSettings(prev => prev ? { 
                                            ...prev, 
                                            lockPeriodDays: value ? parseInt(value) : 0 
                                        } : null)
                                    }}
                                    className="bg-zinc-800/50 border-zinc-700 pr-12"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500">days</div>
                            </div>
                            <p className="text-xs text-zinc-500">Staked tokens must remain locked for this duration.</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button 
                            className="bg-violet-600 hover:bg-violet-700"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
