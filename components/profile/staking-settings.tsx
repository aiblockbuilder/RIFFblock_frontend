"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Coins, Percent, Info, Save } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function StakingSettings() {
    const [stakingEnabled, setStakingEnabled] = useState(true)
    const [defaultRoyalty, setDefaultRoyalty] = useState("10")
    const [minimumStake, setMinimumStake] = useState("500")

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Rifflords Staking Settings</h2>
            </div>

            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Switch id="staking-enabled" checked={stakingEnabled} onCheckedChange={setStakingEnabled} />
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
                                        Default Royalty Percentage
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
                                        value={defaultRoyalty}
                                        onChange={(e) => setDefaultRoyalty(e.target.value.replace(/[^0-9]/g, ""))}
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
                                        value={minimumStake}
                                        onChange={(e) => setMinimumStake(e.target.value.replace(/[^0-9]/g, ""))}
                                        className="bg-zinc-800/50 border-zinc-700 pr-12"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500">RIFF</div>
                                </div>
                                <p className="text-xs text-zinc-500">Users must stake at least this amount to receive royalties.</p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                        <h3 className="text-lg font-medium mb-4">Royalties Applicable To</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Switch id="royalty-marketplace" defaultChecked />
                                <Label htmlFor="royalty-marketplace">Marketplace Resales</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch id="royalty-remixes" defaultChecked />
                                <Label htmlFor="royalty-remixes">Remixes</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch id="royalty-derivatives" defaultChecked />
                                <Label htmlFor="royalty-derivatives">Derivative NFTs</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch id="royalty-collaborations" defaultChecked />
                                <Label htmlFor="royalty-collaborations">Collaborations</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch id="royalty-licensing" defaultChecked />
                                <Label htmlFor="royalty-licensing">Future Licensing</Label>
                            </div>
                        </div>
                        <p className="mt-4 text-xs text-zinc-500">
                            Note: These are default settings that can be overridden per NFT during upload.
                        </p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button className="bg-violet-600 hover:bg-violet-700">
                            <Save className="mr-2 h-4 w-4" />
                            Save Settings
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
