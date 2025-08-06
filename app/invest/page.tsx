"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ethers } from "ethers"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import {
    Coins,
    ArrowRight,
    Play,
    Pause,
    Info,
    CreditCard,
    Wallet,
    TrendingUp,
    Lock,
    Unlock,
    Clock,
    ExternalLink,
    DollarSign,
    Gift,
    Users,
    BarChart,
    Check,
} from "lucide-react"
import MainLayout from "@/components/layouts/main-layout"
import WalletConnect from "@/components/wallet-connect"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import CreativeGradientBackground from "@/components/creative-gradient-background"
import { nftApi } from "@/lib/api-client"
import { StakableRiff } from "@/types/api-response"
import { stakeApi } from "@/lib/api-client"
import { tipApi } from "@/lib/api-client"
import { TippingTierWithArtist } from "@/types/api-response"

export default function InvestPage() {
    const { isConnected, walletAddress } = useWallet()
    const [activeTab, setActiveTab] = useState("buy")
    const [amount, setAmount] = useState("100")
    const [currency, setCurrency] = useState("USD")
    const [paymentMethod, setPaymentMethod] = useState("card")
    const [riffAmount, setRiffAmount] = useState("2,380.95")
    const [isProcessing, setIsProcessing] = useState(false)
    const [showStakingModal, setShowStakingModal] = useState(false)
    const [selectedRiff, setSelectedRiff] = useState<any>(null)
    const [stakeAmount, setStakeAmount] = useState("100000")
    const [showTipModal, setShowTipModal] = useState(false)
    const [selectedTier, setSelectedTier] = useState<any>(null)
    const [tipAmount, setTipAmount] = useState("100")
    const [playingRiff, setPlayingRiff] = useState<string | null>(null)
    const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
    const [stakableRiffs, setStakableRiffs] = useState<StakableRiff[]>([])
    const [isLoadingStakableRiffs, setIsLoadingStakableRiffs] = useState(false)
    const [tippingTiers, setTippingTiers] = useState<TippingTierWithArtist[]>([])
    const [isLoadingTippingTiers, setIsLoadingTippingTiers] = useState(false)

    // Calculate RIFF amount based on fiat amount
    useEffect(() => {
        // Mock exchange rate: 1 USD = 23.8095 RIFF
        const exchangeRate = 23.8095
        const calculatedAmount = Number.parseFloat(amount || "0") * exchangeRate
        setRiffAmount(calculatedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 }))
    }, [amount, currency])

    // Handle amount change
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, "")
        setAmount(value)
    }

    // Handle stake amount change
    const handleStakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, "")
        setStakeAmount(value)
    }

    // Validate stake amount against min/max limits
    const validateStakeAmount = (amount: string, riff: any) => {
        const amountNum = Number.parseFloat(amount)
        if (isNaN(amountNum) || amountNum <= 0) {
            return { valid: false, error: "Please enter a valid stake amount." }
        }
        
        if (amountNum < 100000) {
            return { valid: false, error: "Minimum stake amount is 100,000 RIFF." }
        }
        
        const maxStake = riff.maxPool - riff.stakedAmount
        if (amountNum > maxStake) {
            return { valid: false, error: `Maximum stake amount is ${maxStake.toLocaleString()} RIFF.` }
        }
        
        return { valid: true, error: null }
    }

    // Handle tip amount change
    const handleTipAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9.]/g, "")
        setTipAmount(value)
    }

    // Handle buy RIFF
    const handleBuyRIFF = () => {
        if (!isConnected) {
            toast({
                title: "Wallet Connection Required",
                description: "Please connect your wallet to buy RIFF tokens.",
                variant: "destructive",
            })
            return
        }

        setIsProcessing(true)

        // Simulate processing
        setTimeout(() => {
            setIsProcessing(false)
            toast({
                title: "Purchase Successful",
                description: `You have successfully purchased ${riffAmount} RIFF tokens.`,
            })
        }, 2000)
    }

    // Handle stake on riff
    const handleStakeOnRiff = async () => {
        if (!isConnected || !walletAddress) {
            toast({
                title: "Wallet Connection Required",
                description: "Please connect your wallet to stake on riffs.",
                variant: "destructive",
            })
            return
        }

        if (!selectedRiff) {
            toast({
                title: "No Riff Selected",
                description: "Please select a riff to stake on.",
                variant: "destructive",
            })
            return
        }

        // Validate stake amount
        const validation = validateStakeAmount(stakeAmount, selectedRiff)
        if (!validation.valid) {
            toast({
                title: "Invalid Stake Amount",
                description: validation.error,
                variant: "destructive",
            })
            return
        }
        
        const stakeAmountNum = Number.parseFloat(stakeAmount)

        // Extract the riff ID from the selectedRiff.id (format: "riff-{id}")
        const riffId = Number.parseInt(selectedRiff.id.replace("riff-", ""))

        console.log("Staking with:", {
            riffId,
            walletAddress,
            amount: stakeAmountNum,
            selectedRiff
        })

        setIsProcessing(true)

        try {
            // Step 1: Interact with smart contract first
            console.log("Step 1: Calling smart contract stakeOnRiff function...")
            
            // Import contract service
            const { contractService } = await import('@/lib/contracts')
            
            // Convert amount to wei (assuming RIFF has 18 decimals like most ERC20 tokens)
            const amountInWei = ethers.parseUnits(stakeAmountNum.toString(), 18)
            
            // Call the smart contract stakeOnRiff function
            const contractResult = await contractService.stakeOnRiff(riffId.toString(), amountInWei.toString())
            
            console.log("Smart contract transaction successful:", contractResult)
            
            // Step 2: If contract interaction succeeds, call backend API
            console.log("Step 2: Calling backend API to update database...")
            await stakeApi.stakeOnNft(riffId, walletAddress, stakeAmountNum)
            
            setShowStakingModal(false)
            toast({
                title: "Staking Successful",
                description: `You have successfully staked ${stakeAmount} RIFF on "${selectedRiff.title}". Transaction hash: ${contractResult.hash}`,
            })
            
            // Refresh the stakable riffs to update the staked amounts
            fetchStakableRiffs()
        } catch (error: any) {
            console.error("Error staking on riff:", error)
            
            // Handle specific error cases
            let errorMessage = "Failed to stake on this riff. Please try again."
            
            // Check if it's a contract error
            if (error.message.includes("contract") || error.message.includes("transaction") || error.message.includes("gas")) {
                errorMessage = `Smart contract error: ${error.message}`
            } else if (error.message.includes("ERC20: insufficient allowance")) {
                errorMessage = "Token approval failed. Please try approving the tokens again or check your wallet settings."
            } else if (error.message.includes("Token approval failed")) {
                errorMessage = "Token approval failed. Please try approving the tokens again or check your wallet settings."
            } else if (error.message.includes("User already has a stake")) {
                errorMessage = "You already have a stake on this riff. You can only stake once per riff."
            } else if (error.message.includes("Riff is not stakable")) {
                errorMessage = "This riff is not available for staking."
            } else if (error.message.includes("Cannot stake on your own riff")) {
                errorMessage = "You cannot stake on your own riffs. Please select a riff from another artist."
            } else if (error.message.includes("User not found")) {
                errorMessage = "User profile not found. Please create a profile first."
            } else if (error.message.includes("Riff not found")) {
                errorMessage = "Riff not found. Please try again."
            } else if (error.message.includes("amount")) {
                errorMessage = "Invalid stake amount. Please enter a valid number."
            } else if (error.message.includes("insufficient funds")) {
                errorMessage = "Insufficient RIFF tokens in your wallet for staking."
            } else if (error.message.includes("user rejected")) {
                errorMessage = "Transaction was rejected by user."
            }
            
            toast({
                title: "Staking Failed",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    // Handle tip artist
    const handleTipArtist = async () => {
        if (!isConnected || !walletAddress) {
            toast({
                title: "Wallet Connection Required",
                description: "Please connect your wallet to tip artists.",
                variant: "destructive",
            })
            return
        }

        if (!selectedTier) {
            toast({
                title: "No Tier Selected",
                description: "Please select a tipping tier.",
                variant: "destructive",
            })
            return
        }

        // Check if user is trying to tip themselves
        if (walletAddress.toLowerCase() === selectedTier.artistWalletAddress?.toLowerCase()) {
            toast({
                title: "Cannot Tip Yourself",
                description: "You cannot tip your own tipping tiers. Please select a tier from another artist.",
                variant: "destructive",
            })
            return
        }

        const tipAmountNum = Number.parseFloat(tipAmount)
        if (isNaN(tipAmountNum) || tipAmountNum < selectedTier.amount) {
            toast({
                title: "Invalid Tip Amount",
                description: `Minimum tip amount for ${selectedTier.name} tier is ${selectedTier.amount} RIFF.`,
                variant: "destructive",
            })
            return
        }

        setIsProcessing(true)

        try {
            // Check if we have the artist's wallet address
            if (!selectedTier.artistWalletAddress) {
                toast({
                    title: "Tip Failed",
                    description: "Artist wallet address not found. Please try again later.",
                    variant: "destructive",
                })
                return
            }

            const tipData = {
                senderWalletAddress: walletAddress,
                recipientWalletAddress: selectedTier.artistWalletAddress,
                amount: tipAmountNum,
                currency: "RIFF",
                message: `Tip for ${selectedTier.name} tier access`,
                tierId: selectedTier.id,
                riffId: undefined // No specific riff for this tip
            }

            await tipApi.sendTip(tipData)
            
            setShowTipModal(false)
            toast({
                title: "Tip Successful",
                description: `You have successfully tipped ${tipAmount} RIFF to ${selectedTier.artist} for ${selectedTier.name} tier access.`,
            })
        } catch (error: any) {
            console.error("Error sending tip:", error)
            
            // Handle specific error cases
            let errorMessage = "Failed to send tip. Please try again."
            
            if (error.message.includes("Sender not found")) {
                errorMessage = "Your wallet address was not found. Please create a profile first."
            } else if (error.message.includes("Recipient not found")) {
                errorMessage = "Artist profile not found. Please try again."
            } else if (error.message.includes("Cannot tip yourself")) {
                errorMessage = "You cannot tip your own tipping tiers. Please select a tier from another artist."
            } else if (error.message.includes("amount")) {
                errorMessage = "Invalid tip amount. Please enter a valid number."
            }
            
            toast({
                title: "Tip Failed",
                description: errorMessage,
                variant: "destructive",
            })
        } finally {
            setIsProcessing(false)
        }
    }

    // Toggle play/pause for a riff
    const togglePlay = (riffId: string) => {
        if (playingRiff === riffId) {
            setPlayingRiff(null)
        } else {
            setPlayingRiff(riffId)
        }
    }

    // Fetch stakable riffs
    const fetchStakableRiffs = async () => {
        setIsLoadingStakableRiffs(true)
        try {
            const response = await nftApi.getStakableRiffs()
            setStakableRiffs(response)
        } catch (error) {
            console.error("Error fetching stakable riffs:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load stakable riffs",
            })
        } finally {
            setIsLoadingStakableRiffs(false)
        }
    }

    // Fetch tipping tiers
    const fetchTippingTiers = async () => {
        setIsLoadingTippingTiers(true)
        try {
            const response = await tipApi.getAllTippingTiers()
            setTippingTiers(response)
        } catch (error) {
            console.error("Error fetching tipping tiers:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load tipping tiers",
            })
        } finally {
            setIsLoadingTippingTiers(false)
        }
    }

    // Fetch stakable riffs on component mount
    useEffect(() => {
        fetchStakableRiffs()
        fetchTippingTiers()
    }, [])

    // FAQ data
    const faqItems = [
        {
            id: "what-is-staking",
            question: "What is staking?",
            answer:
                "Staking is a way to support artists by locking your RIFF tokens on their riffs for a period of time. In return, you receive a share of the royalties generated by that riff. Think of it as investing in an artist's work that you believe in.",
        },
        {
            id: "how-royalties-work",
            question: "How do royalties work?",
            answer:
                "When a riff is sold, remixed, or licensed, royalties are generated. A percentage of these royalties (set by the artist) is shared among stakers proportional to their stake amount. For example, if you've staked 10% of the total staked amount on a riff, you'll receive 10% of the royalties allocated to stakers.",
        },
        {
            id: "unstake-early",
            question: "Can I unstake early?",
            answer:
                "Staked RIFF tokens are locked for a defined period (typically 90 days) to provide stability for artists. Early unstaking is not supported in the current version, but we're exploring flexible staking options for future updates.",
        },
        {
            id: "tip-vs-stake",
            question: "What's the difference between tipping and staking?",
            answer:
                "Tipping is a one-time gift to an artist you want to support, often unlocking exclusive content or perks. Staking is an investment where you lock your tokens for a period and earn a share of future royalties. Tips are not returned, while staked amounts can be reclaimed after the lock period.",
        },
    ]

    // Render hero section
    const renderHeroSection = () => {
        return (
            <section className="relative py-20 md:py-32 overflow-hidden">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                    <motion.div
                        className="text-center space-y-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                            Support Music{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                                at the Source
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto">
                            Support artists, stake your RIFF, and get access to exclusive materials.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600"
                                onClick={() => {
                                    document.getElementById("buy-riff")?.scrollIntoView({ behavior: "smooth" })
                                }}
                            >
                                Buy RIFF
                                <Coins className="ml-2 h-5 w-5" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                                onClick={() => {
                                    document.getElementById("featured-riffs")?.scrollIntoView({ behavior: "smooth" })
                                }}
                            >
                                Explore Riffs to Support
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        )
    }

    // Render buy RIFF token section
    const renderBuyRIFFSection = () => {
        return (
            <section id="buy-riff" className="py-16 md:py-24 bg-zinc-900/30">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Buy RIFF Tokens</h2>
                        <p className="text-zinc-300 max-w-3xl mx-auto">
                            Purchase RIFF tokens to support artists, stake on riffs, and unlock exclusive content.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 md:p-8"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <Tabs defaultValue="buy" className="w-full" onValueChange={setActiveTab}>
                                <TabsList className="grid grid-cols-2 mb-6">
                                    <TabsTrigger
                                        value="buy"
                                        className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
                                    >
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Buy with Fiat
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="crypto"
                                        className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
                                    >
                                        <Wallet className="mr-2 h-4 w-4" />
                                        Buy with Crypto
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="buy" className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm text-zinc-400 mb-1 block">You Pay</Label>
                                            <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-violet-500 bg-zinc-900/50">
                                                <Input
                                                    type="text"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                    className="border-0 bg-transparent text-white text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                                                />
                                                <div className="px-3 py-2 bg-zinc-800">
                                                    <Select value={currency} onValueChange={setCurrency}>
                                                        <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 focus:ring-offset-0 shadow-none">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800">
                                                            <SelectItem value="USD">USD</SelectItem>
                                                            <SelectItem value="EUR">EUR</SelectItem>
                                                            <SelectItem value="GBP">GBP</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm text-zinc-400 mb-1 block">You Receive</Label>
                                            <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
                                                <Input
                                                    type="text"
                                                    value={riffAmount}
                                                    readOnly
                                                    className="border-0 bg-transparent text-white text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                                                />
                                                <div className="px-3 py-2 bg-zinc-800">
                                                    <span className="text-sm font-medium">RIFF</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-1">1 {currency} = 23.8095 RIFF</div>
                                        </div>

                                        <div>
                                            <Label className="text-sm text-zinc-400 mb-1 block">Payment Method</Label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant="outline"
                                                    className={`border-zinc-800 hover:bg-zinc-800 hover:text-white justify-start ${paymentMethod === "card" ? "bg-zinc-800 text-white" : "bg-zinc-900"
                                                        }`}
                                                    onClick={() => setPaymentMethod("card")}
                                                >
                                                    <CreditCard className="mr-2 h-4 w-4" />
                                                    Credit Card
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className={`border-zinc-800 hover:bg-zinc-800 hover:text-white justify-start ${paymentMethod === "paypal" ? "bg-zinc-800 text-white" : "bg-zinc-900"
                                                        }`}
                                                    onClick={() => setPaymentMethod("paypal")}
                                                >
                                                    <Image src="/paypal-logo.png" alt="PayPal" width={16} height={16} className="mr-2" />
                                                    PayPal
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        {isConnected ? (
                                            <Button
                                                className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white"
                                                onClick={handleBuyRIFF}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                                                        <span>Processing...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        Buy RIFF Tokens
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <WalletConnect className="w-full" />
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="crypto" className="space-y-6">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-sm text-zinc-400 mb-1 block">You Pay</Label>
                                            <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-violet-500 bg-zinc-900/50">
                                                <Input
                                                    type="text"
                                                    value={amount}
                                                    onChange={handleAmountChange}
                                                    className="border-0 bg-transparent text-white text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                                                />
                                                <div className="px-3 py-2 bg-zinc-800">
                                                    <Select defaultValue="POL">
                                                        <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 focus:ring-offset-0 shadow-none">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-zinc-900 border-zinc-800">
                                                            <SelectItem value="POL">POL</SelectItem>
                                                            <SelectItem value="ETH">ETH</SelectItem>
                                                            <SelectItem value="BTC">BTC</SelectItem>
                                                            <SelectItem value="USDT">USDT</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="text-sm text-zinc-400 mb-1 block">You Receive</Label>
                                            <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/50">
                                                <Input
                                                    type="text"
                                                    value={riffAmount}
                                                    readOnly
                                                    className="border-0 bg-transparent text-white text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                                                />
                                                <div className="px-3 py-2 bg-zinc-800">
                                                    <span className="text-sm font-medium">RIFF</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-1">1 POL = 1,250 RIFF</div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2">
                                            <Button
                                                variant="outline"
                                                className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white flex flex-col items-center p-3 h-auto"
                                            >
                                                <Image src="/eth-logo.png" alt="ETH" width={24} height={24} className="mb-1" />
                                                <span className="text-xs">ETH</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white flex flex-col items-center p-3 h-auto"
                                            >
                                                <Image src="/btc-logo.png" alt="BTC" width={24} height={24} className="mb-1" />
                                                <span className="text-xs">BTC</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white flex flex-col items-center p-3 h-auto"
                                            >
                                                <Image src="/matic-logo.png" alt="POL" width={24} height={24} className="mb-1" />
                                                <span className="text-xs">MATIC</span>
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white flex flex-col items-center p-3 h-auto"
                                            >
                                                <Image src="/usdt-logo.png" alt="USDT" width={24} height={24} className="mb-1" />
                                                <span className="text-xs">USDT</span>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        {isConnected ? (
                                            <Button
                                                className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white"
                                                onClick={handleBuyRIFF}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                                                        <span>Processing...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        Buy RIFF Tokens
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </>
                                                )}
                                            </Button>
                                        ) : (
                                            <WalletConnect className="w-full" />
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </motion.div>

                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className="text-2xl font-bold">Why Buy RIFF Tokens?</h3>

                            <div className="space-y-4">
                                {[
                                    {
                                        title: "Support Artists Directly",
                                        description:
                                            "100% of your tips and stakes go directly to artists, with no middlemen or platform fees.",
                                        icon: Users,
                                    },
                                    {
                                        title: "Earn Royalties",
                                        description: "Stake your RIFF tokens on riffs you believe in and earn a share of future royalties.",
                                        icon: TrendingUp,
                                    },
                                    {
                                        title: "Unlock Exclusive Content",
                                        description: "Tip artists to unlock backstage access, unreleased demos, and other exclusive perks.",
                                        icon: Lock,
                                    },
                                    {
                                        title: "Build Your Portfolio",
                                        description: "Track your investments and earnings in your personal dashboard.",
                                        icon: BarChart,
                                    },
                                ].map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                            <item.icon className="h-5 w-5 text-violet-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-lg">{item.title}</h4>
                                            <p className="text-zinc-400">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Info className="h-5 w-5 text-blue-400" />
                                    <h4 className="font-medium">Token Information</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-zinc-500">Token Name</p>
                                        <p className="font-medium">RIFF</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500">Network</p>
                                        <p className="font-medium">Polygon</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500">Total Supply</p>
                                        <p className="font-medium">100 Billion</p>
                                    </div>
                                    <div>
                                        <p className="text-zinc-500">Contract</p>
                                        <div className="flex items-center gap-1">
                                            <span className="font-medium truncate">0x1234...5678</span>
                                            <a
                                                href="https://polygonscan.com/"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-violet-400 hover:text-violet-300"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        )
    }

    // Render featured riffs section
    const renderFeaturedRiffsSection = () => {
        return (
            <section id="featured-riffs" className="py-16 md:py-24 relative">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Riffs Open for Staking</h2>
                        <p className="text-zinc-300 max-w-3xl mx-auto">
                            Stake your RIFF tokens on these riffs to earn a share of future royalties.
                        </p>
                    </div>

                    {isLoadingStakableRiffs ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
                        </div>
                    ) : stakableRiffs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-zinc-400 mb-4">No stakable riffs available at the moment.</p>
                            <Button 
                                className="bg-violet-600 hover:bg-violet-700"
                                onClick={() => window.location.href = '/market'}
                            >
                                Browse All Riffs
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stakableRiffs.map((riff) => (
                                <motion.div
                                    key={riff.id}
                                    className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden hover:border-violet-500/30 transition-all group"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="relative aspect-square">
                                        <Image src={riff.image || "/placeholder.svg"} alt={riff.title} fill className="object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                className="w-12 h-12 rounded-full bg-violet-600/90 hover:bg-violet-700/90 flex items-center justify-center transition-all transform scale-90 group-hover:scale-100"
                                                onClick={() => togglePlay(riff.id)}
                                            >
                                                {playingRiff === riff.id ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                                            </button>
                                        </div>
                                        <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-xs text-zinc-300">
                                            {riff.duration}
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                                <Image
                                                    src={riff.artistImage || "/placeholder.svg"}
                                                    alt={riff.artist}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <Link href="#" className="text-sm text-zinc-400 hover:text-violet-400 truncate">
                                                {riff.artist}
                                            </Link>
                                        </div>

                                        <h3 className="font-bold text-lg mb-2 truncate">{riff.title}</h3>

                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                                                    <span>Staked</span>
                                                    <span>
                                                        {riff.stakedAmount.toLocaleString()} / {riff.maxPool.toLocaleString()} RIFF
                                                    </span>
                                                </div>
                                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-violet-500 rounded-full"
                                                        style={{ width: `${(riff.stakedAmount / riff.maxPool) * 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="bg-violet-500/20 px-2 py-1 rounded text-xs text-violet-300">
                                                    {riff.royaltyShare}% Royalty Share
                                                </div>
                                                <Dialog
                                                    open={showStakingModal && selectedRiff?.id === riff.id}
                                                    onOpenChange={(open) => {
                                                        if (!open) setShowStakingModal(false)
                                                    }}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            className={`${
                                                                walletAddress?.toLowerCase() === riff.artistWalletAddress?.toLowerCase()
                                                                    ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                                                                    : "bg-violet-600 hover:bg-violet-700"
                                                            }`}
                                                            onClick={() => {
                                                                // Don't open modal if it's the user's own riff
                                                                if (walletAddress?.toLowerCase() === riff.artistWalletAddress?.toLowerCase()) {
                                                                    toast({
                                                                        title: "Cannot Stake on Your Own Riff",
                                                                        description: "You cannot stake on your own riffs. Please select a riff from another artist.",
                                                                        variant: "destructive",
                                                                    })
                                                                    return
                                                                }
                                                                setSelectedRiff(riff)
                                                                setShowStakingModal(true)
                                                            }}
                                                            disabled={walletAddress?.toLowerCase() === riff.artistWalletAddress?.toLowerCase()}
                                                        >
                                                            {walletAddress?.toLowerCase() === riff.artistWalletAddress?.toLowerCase() ? (
                                                                "Your Riff"
                                                            ) : (
                                                                "Stake"
                                                            )}
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="bg-zinc-900 border-zinc-800">
                                                        <DialogHeader>
                                                            <DialogTitle>Stake on "{riff.title}"</DialogTitle>
                                                            <DialogDescription>
                                                                Stake your RIFF tokens to earn {riff.royaltyShare}% of future royalties.
                                                            </DialogDescription>
                                                        </DialogHeader>

                                                        <div className="space-y-4 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                                                    <Image
                                                                        src={riff.image || "/placeholder.svg"}
                                                                        alt={riff.title}
                                                                        fill
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-medium">{riff.title}</h4>
                                                                    <p className="text-sm text-zinc-400">by {riff.artist}</p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2">
                                                                <Label htmlFor="stake-amount">Stake Amount (RIFF)</Label>
                                                                <Input
                                                                    id="stake-amount"
                                                                    type="text"
                                                                    value={stakeAmount}
                                                                    onChange={handleStakeAmountChange}
                                                                    className={`bg-zinc-800 border-zinc-700 ${
                                                                        stakeAmount && !validateStakeAmount(stakeAmount, riff).valid 
                                                                            ? 'border-red-500' 
                                                                            : ''
                                                                    }`}
                                                                />
                                                                <p className="text-xs text-zinc-500">
                                                                    Minimum stake: 100,000 RIFF • Maximum stake:{" "}
                                                                    {riff.maxPool - riff.stakedAmount} RIFF
                                                                </p>
                                                                {stakeAmount && !validateStakeAmount(stakeAmount, riff).valid && (
                                                                    <p className="text-xs text-red-500">
                                                                        {validateStakeAmount(stakeAmount, riff).error}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <div className="bg-zinc-800/50 p-4 rounded-lg space-y-3">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-zinc-400">Your Stake</span>
                                                                    <span>{stakeAmount} RIFF</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-zinc-400">Royalty Share</span>
                                                                    <span>{riff.royaltyShare}%</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-zinc-400">Lock Period</span>
                                                                    <span>90 days</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm font-medium pt-2 border-t border-zinc-700">
                                                                    <span>Estimated Share</span>
                                                                    <span className="text-violet-400">
                                                                        {(
                                                                            (Number.parseInt(stakeAmount) /
                                                                                (riff.stakedAmount + Number.parseInt(stakeAmount))) *
                                                                            100
                                                                        ).toFixed(2)}
                                                                        % of Staker Pool
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                                <Info className="h-4 w-4" />
                                                                <p>Staked tokens are locked for 90 days and cannot be withdrawn early.</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end gap-3">
                                                            <Button
                                                                variant="outline"
                                                                className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                                                onClick={() => setShowStakingModal(false)}
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                className="bg-violet-600 hover:bg-violet-700"
                                                                onClick={handleStakeOnRiff}
                                                                disabled={isProcessing}
                                                            >
                                                                {isProcessing ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                                                                        <span>Processing...</span>
                                                                    </div>
                                                                ) : (
                                                                    "Confirm Stake"
                                                                )}
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-center mt-8">
                        <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-300">
                            View All Stakeable Riffs
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>
        )
    }

    // Render how it works section
    const renderHowItWorksSection = () => {
        return (
            <section className="py-16 md:py-24 bg-zinc-900/30">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                        <p className="text-zinc-300 max-w-3xl mx-auto">
                            Support artists and earn rewards in just a few simple steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            {
                                title: "Buy RIFF",
                                description: "Purchase RIFF tokens using crypto or fiat currency.",
                                icon: Coins,
                                color: "violet",
                            },
                            {
                                title: "Tip or Stake",
                                description: "Support artists by tipping or staking on their riffs.",
                                icon: Gift,
                                color: "blue",
                            },
                            {
                                title: "Unlock Rewards",
                                description: "Get exclusive content or earn a share of royalties.",
                                icon: Unlock,
                                color: "indigo",
                            },
                            {
                                title: "Track Earnings",
                                description: "Monitor your investments and earnings in your dashboard.",
                                icon: BarChart,
                                color: "purple",
                            },
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-violet-500/30 transition-all text-center"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                            >
                                <div className="flex flex-col items-center">
                                    <div
                                        className={`w-16 h-16 bg-${item.color}-500/20 rounded-full flex items-center justify-center mb-4`}
                                    >
                                        <item.icon className={`h-8 w-8 text-${item.color}-400`} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                    <p className="text-zinc-400">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-12">
                        <Accordion type="single" collapsible className="w-full">
                            {faqItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="border-zinc-800 data-[state=open]:bg-zinc-900/50"
                                >
                                    <AccordionTrigger className="text-left hover:text-violet-400 py-4">{item.question}</AccordionTrigger>
                                    <AccordionContent className="text-zinc-400 pb-4">{item.answer}</AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </section>
        )
    }

    // Render backstage access section
    const renderBackstageAccessSection = () => {
        return (
            <section className="py-16 md:py-24 relative">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Backstage Access & Tipping Tiers</h2>
                        <p className="text-zinc-300 max-w-3xl mx-auto">
                            Support your favorite artists and unlock exclusive content and perks.
                        </p>
                    </div>

                    {isLoadingTippingTiers ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-500 border-t-transparent"></div>
                        </div>
                    ) : tippingTiers.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-zinc-400 mb-4">No tipping tiers available at the moment.</p>
                            <Button 
                                className="bg-violet-600 hover:bg-violet-700"
                                onClick={() => window.location.href = '/market'}
                            >
                                Browse All Artists
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {tippingTiers.map((tier: TippingTierWithArtist) => (
                                <motion.div
                                    key={tier.id}
                                    className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl overflow-hidden hover:border-violet-500/30 transition-all"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <div className="relative h-40 bg-gradient-to-b from-violet-900/30 to-zinc-900/30">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="relative w-24 h-24">
                                                <Image src={tier.image || "/placeholder.svg"} alt={tier.name} fill className="object-contain" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden">
                                                <Image
                                                    src={tier.artistImage || "/placeholder.svg"}
                                                    alt={tier.artist}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <Link href="#" className="text-zinc-300 hover:text-violet-400">
                                                {tier.artist}
                                            </Link>
                                        </div>

                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-lg">{tier.name}</h3>
                                            <div className="flex items-center gap-1 text-violet-400 font-medium">
                                                <Coins className="h-4 w-4" />
                                                <span>{tier.amount.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <p className="text-sm text-zinc-400 mb-4">{tier.description}</p>

                                        <div className="space-y-2 mb-4">
                                            {tier.perks.map((perk: string, index: number) => (
                                                <div key={index} className="flex items-center gap-2 text-sm">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                                    <span>{perk}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <Dialog
                                            open={showTipModal && selectedTier?.id === tier.id}
                                            onOpenChange={(open) => {
                                                if (!open) setShowTipModal(false)
                                            }}
                                        >
                                            <DialogTrigger asChild>
                                                <Button
                                                    className={`w-full ${
                                                        walletAddress?.toLowerCase() === tier.artistWalletAddress?.toLowerCase()
                                                            ? "bg-zinc-600 text-zinc-400 cursor-not-allowed"
                                                            : "bg-violet-600 hover:bg-violet-700"
                                                    }`}
                                                    onClick={() => {
                                                        // Don't open modal if it's the user's own tier
                                                        if (walletAddress?.toLowerCase() === tier.artistWalletAddress?.toLowerCase()) {
                                                            toast({
                                                                title: "Cannot Tip Yourself",
                                                                description: "You cannot tip your own tipping tiers. Please select a tier from another artist.",
                                                                variant: "destructive",
                                                            })
                                                            return
                                                        }
                                                        setSelectedTier(tier)
                                                        setTipAmount(tier.amount.toString())
                                                        setShowTipModal(true)
                                                    }}
                                                    disabled={walletAddress?.toLowerCase() === tier.artistWalletAddress?.toLowerCase()}
                                                >
                                                    {walletAddress?.toLowerCase() === tier.artistWalletAddress?.toLowerCase() ? (
                                                        <>
                                                            <Lock className="mr-2 h-4 w-4" />
                                                            Your Tier
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Gift className="mr-2 h-4 w-4" />
                                                            Tip for Access
                                                        </>
                                                    )}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-zinc-900 border-zinc-800">
                                                <DialogHeader>
                                                    <DialogTitle>Tip {tier.artist}</DialogTitle>
                                                    <DialogDescription>
                                                        Support this artist and unlock the {tier.name} tier benefits.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="space-y-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                                            <Image
                                                                src={tier.artistImage || "/placeholder.svg"}
                                                                alt={tier.artist}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium">{tier.artist}</h4>
                                                            <p className="text-sm text-zinc-400">{tier.name} Tier</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label htmlFor="tip-amount">Tip Amount (RIFF)</Label>
                                                        <Input
                                                            id="tip-amount"
                                                            type="text"
                                                            value={tipAmount}
                                                            onChange={handleTipAmountChange}
                                                            className="bg-zinc-800 border-zinc-700"
                                                        />
                                                        <p className="text-xs text-zinc-500">
                                                            Minimum tip: {tier.amount} RIFF for {tier.name} tier
                                                        </p>
                                                    </div>

                                                    <div className="bg-zinc-800/50 p-4 rounded-lg space-y-2">
                                                        <h4 className="font-medium">You'll Unlock:</h4>
                                                        <ul className="space-y-1">
                                                            {tier.perks.map((perk: string, index: number) => (
                                                                <li key={index} className="flex items-center gap-2 text-sm">
                                                                    <Check className="h-4 w-4 text-green-500" />
                                                                    <span>{perk}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                        <Info className="h-4 w-4" />
                                                        <p>Tips are non-refundable and go directly to the artist.</p>
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3">
                                                    <Button
                                                        variant="outline"
                                                        className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                                        onClick={() => setShowTipModal(false)}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        className="bg-violet-600 hover:bg-violet-700"
                                                        onClick={handleTipArtist}
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                                                                <span>Processing...</span>
                                                            </div>
                                                        ) : (
                                                            "Confirm Tip"
                                                        )}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-center mt-8">
                        <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-300">
                            View All Artists with Backstage Access
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </section>
        )
    }

    // Render royalty & staking mechanics section
    const renderRoyaltyMechanicsSection = () => {
        return (
            <section className="py-16 md:py-24 relative">
                <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Royalty & Staking Mechanics</h2>
                        <p className="text-zinc-300 max-w-3xl mx-auto">
                            Learn how staking works and how royalties are distributed to stakers and artists.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className="text-2xl font-bold">For Artists</h3>
                            <p className="text-zinc-300">
                                As an artist, you have full control over how your riffs are monetized through staking and royalties.
                            </p>

                            <div className="space-y-4">
                                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                                    <h4 className="font-bold mb-2 flex items-center gap-2">
                                        <Switch defaultChecked />
                                        Enable/Disable Staking
                                    </h4>
                                    <p className="text-zinc-400 text-sm">
                                        Toggle staking on or off for each riff. You can set global defaults in your profile or customize
                                        settings per riff.
                                    </p>
                                </div>

                                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                                    <h4 className="font-bold mb-2">Royalty Share Percentage</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Staker Share</span>
                                            <span>15%</span>
                                        </div>
                                        <Slider defaultValue={[15]} max={50} step={5} />
                                        <p className="text-zinc-400 text-sm">
                                            Set the percentage of royalties that will be shared among stakers. The remaining 85% goes directly
                                            to you.
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                                    <h4 className="font-bold mb-2">Maximum Pool Size (Optional)</h4>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Input
                                            type="text"
                                            placeholder="10,000"
                                            className="bg-zinc-800 border-zinc-700"
                                            defaultValue="50000"
                                        />
                                        <div className="bg-zinc-800 px-3 py-2 rounded-md">
                                            <span className="text-sm font-medium">RIFF</span>
                                        </div>
                                    </div>
                                    <p className="text-zinc-400 text-sm">
                                        Limit the total amount of RIFF that can be staked on your riff. This creates scarcity and can
                                        incentivize early stakers.
                                    </p>
                                </div>

                                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                                    <h4 className="font-bold mb-2">Payout Frequency</h4>
                                    <Select defaultValue="monthly">
                                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-zinc-800">
                                            <SelectItem value="monthly">Monthly</SelectItem>
                                            <SelectItem value="quarterly">Quarterly</SelectItem>
                                            <SelectItem value="biannually">Bi-annually</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-zinc-400 text-sm mt-2">
                                        Choose how often royalties are distributed to stakers. More frequent payouts may attract more
                                        stakers.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            className="space-y-6"
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h3 className="text-2xl font-bold">For Fans & Collectors</h3>
                            <p className="text-zinc-300">
                                As a fan, you can support artists by staking your RIFF tokens and earn a share of future royalties.
                            </p>

                            <div className="space-y-4">
                                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                                    <h4 className="font-bold mb-2 flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-violet-400" />
                                        Lock Period
                                    </h4>
                                    <p className="text-zinc-400 text-sm">
                                        Staked RIFF tokens are locked for 90 days. This ensures stability for artists and prevents market
                                        manipulation.
                                    </p>
                                </div>

                                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                                    <h4 className="font-bold mb-2">Royalty Sources</h4>
                                    <ul className="space-y-2 text-zinc-400 text-sm">
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                            <span>Marketplace resale royalties</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                            <span>Remix and collaboration revenue</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                            <span>Future licensing or sync income</span>
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500"></div>
                                            <span>Secondary market transactions</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                                    <h4 className="font-bold mb-2">Royalty Calculation</h4>
                                    <p className="text-zinc-400 text-sm mb-3">
                                        Your share of royalties is proportional to your stake in the total staking pool:
                                    </p>
                                    <div className="bg-zinc-800/50 p-3 rounded-lg text-sm">
                                        <code className="text-violet-300">
                                            Your Royalty = (Your Stake / Total Staked) × Staker Royalty Pool
                                        </code>
                                    </div>
                                    <p className="text-zinc-400 text-sm mt-3">
                                        For example, if you stake 1,000 RIFF on a riff with 10,000 RIFF total staked, you'll receive 10% of
                                        the royalties allocated to stakers.
                                    </p>
                                </div>

                                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                                    <h4 className="font-bold mb-2">Unstaking Process</h4>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <span className="text-sm font-bold">1</span>
                                        </div>
                                        <p className="text-zinc-400 text-sm">Wait for the 90-day lock period to complete</p>
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <span className="text-sm font-bold">2</span>
                                        </div>
                                        <p className="text-zinc-400 text-sm">Claim any pending royalties</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <span className="text-sm font-bold">3</span>
                                        </div>
                                        <p className="text-zinc-400 text-sm">Unstake your RIFF tokens</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-12 text-center">
                        <Button
                            className="bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600"
                            size="lg"
                            onClick={() => {
                                document.getElementById("featured-riffs")?.scrollIntoView({ behavior: "smooth" })
                            }}
                        >
                            Start Staking Now
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <MainLayout>
            <CreativeGradientBackground variant="invest">
                <div className="min-h-screen pb-16">
                    {renderHeroSection()}
                    {renderBuyRIFFSection()}
                    {renderFeaturedRiffsSection()}
                    {renderHowItWorksSection()}
                    {renderBackstageAccessSection()}
                    {renderRoyaltyMechanicsSection()}
                </div>
            </CreativeGradientBackground>
        </MainLayout>
    )
}
