"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { useWallet } from "@/contexts/wallet-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Upload,
    Music,
    Info,
    Check,
    Play,
    Pause,
    X,
    ArrowLeft,
    ArrowRight,
    Loader2,
    FileAudio,
    ImageIcon,
    Coins,
    Lock,
    Percent,
} from "lucide-react"
import MainLayout from "@/components/layouts/main-layout"
import WaveformVisualizer from "@/components/upload/waveform-visualizer"
import WalletConnect from "@/components/wallet-connect"
import CreativeGradientBackground from "@/components/creative-gradient-background"
import { nftApi, collectionApi } from "@/lib/api-client"
import { GENRES, MOODS, INSTRUMENTS, KEY_SIGNATURES, TIME_SIGNATURES, type Genre, type Mood, type Instrument, type KeySignature, type TimeSignature } from "@/constants/riff-options"

// Define the steps in the upload process
const STEPS = {
    FILE_UPLOAD: 0,
    RIFF_INFO: 1,
    MONETIZATION: 2,
    STAKING: 3,
    PREVIEW: 4,
}

export default function UploadPage() {
    const router = useRouter()
    const { isConnected, walletAddress } = useWallet()
    const [currentStep, setCurrentStep] = useState(STEPS.FILE_UPLOAD)
    const [isUploading, setIsUploading] = useState(false)
    const [isMinting, setIsMinting] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [uploadType, setUploadType] = useState<"just-upload" | "mint-nft">("just-upload")
    const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null)

    // File upload state
    const [file, setFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [fileDuration, setFileDuration] = useState<number | null>(null)
    const [coverImage, setCoverImage] = useState<File | null>(null)
    const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)

    // Riff info state
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [genre, setGenre] = useState<Genre>("Pop")
    const [mood, setMood] = useState<Mood>("Happy")
    const [instrument, setInstrument] = useState<Instrument>("Vocals")
    const [keySignature, setKeySignature] = useState<KeySignature>("C")
    const [timeSignature, setTimeSignature] = useState<TimeSignature>("4/4")
    const [isBargainBin, setIsBargainBin] = useState(false)
    const [collection, setCollection] = useState("new")
    const [newCollectionName, setNewCollectionName] = useState("")
    const [newCollectionDescription, setNewCollectionDescription] = useState("")

    // Monetization state
    const [price, setPrice] = useState("")
    const [currency, setCurrency] = useState("RIFF")
    const [royaltyPercentage, setRoyaltyPercentage] = useState<number>(0)
    const [enableStaking, setEnableStaking] = useState(false)

    // Unlockables state
    const [unlockSourceFiles, setUnlockSourceFiles] = useState(false)
    const [unlockRemixRights, setUnlockRemixRights] = useState(false)
    const [unlockPrivateMessages, setUnlockPrivateMessages] = useState(false)
    const [unlockBackstageContent, setUnlockBackstageContent] = useState(false)

    // Staking settings state
    const [customRoyaltyShare, setCustomRoyaltyShare] = useState(50)
    const [useProfileDefaults, setUseProfileDefaults] = useState(true)

    // Audio player refs
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const imageInputRef = useRef<HTMLInputElement | null>(null)

    // Collections state
    const [collections, setCollections] = useState<any[]>([])
    const [isLoadingCollections, setIsLoadingCollections] = useState(false)

    // Check if user is connected to wallet
    useEffect(() => {
        if (!isConnected) {
            toast({
                title: "Wallet Connection Required",
                description: "Please connect your wallet to upload riffs.",
                variant: "destructive",
            })
        }
    }, [isConnected])

    // Fetch collections when user selects "Add to Existing Collection"
    useEffect(() => {
        const fetchCollections = async () => {
            if (collection === "existing" && walletAddress) {
                setIsLoadingCollections(true)
                try {
                    const response = await collectionApi.getAllCollections(walletAddress)
                    setCollections(response)
                } catch (error) {
                    console.error("Error fetching collections:", error)
                    toast({
                        title: "Error",
                        description: "Failed to fetch collections. Please try again.",
                        variant: "destructive",
                    })
                } finally {
                    setIsLoadingCollections(false)
                }
            }
        }

        fetchCollections()
    }, [collection, walletAddress])

    // Handle file upload
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            processAudioFile(selectedFile)
        }
    }

    // Handle image upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            processImageFile(selectedFile)
        }
    }

    // Process audio file
    const processAudioFile = (selectedFile: File) => {
        // Check file type and extension
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave', 'audio/x-wav'];
        const allowedExtensions = ['.mp3', '.wav'];
        const fileExtension = selectedFile.name.toLowerCase().slice(selectedFile.name.lastIndexOf('.'));
        
        if (!allowedTypes.includes(selectedFile.type) || !allowedExtensions.includes(fileExtension)) {
            toast({
                title: "Invalid File Type",
                description: "Please upload an MP3 or WAV file.",
                variant: "destructive",
            })
            return
        }

        // Check file size (25MB max)
        const maxSize = 25 * 1024 * 1024; // 25MB in bytes
        if (selectedFile.size > maxSize) {
            toast({
                title: "File Too Large",
                description: `Maximum file size is ${maxSize / (1024 * 1024)}MB.`,
                variant: "destructive",
            })
            return
        }

        // Create audio element to check duration
        const audio = new Audio()
        const objectUrl = URL.createObjectURL(selectedFile)
        audio.src = objectUrl

        audio.onloadedmetadata = () => {
            // Check duration (1 minute max)
            if (audio.duration > 60) {
                URL.revokeObjectURL(objectUrl)
                toast({
                    title: "File Too Long",
                    description: "Maximum riff length is 1 minute.",
                    variant: "destructive",
                })
                return
            }

            setFile(selectedFile)
            setFilePreview(objectUrl)
            setFileDuration(audio.duration)
            audioRef.current = audio
        }

        audio.onerror = () => {
            URL.revokeObjectURL(objectUrl)
            toast({
                title: "Error Loading Audio",
                description: "There was a problem processing your audio file.",
                variant: "destructive",
            })
        }
    }

    // Process image file
    const processImageFile = (selectedFile: File) => {
        // Check file type
        if (!selectedFile.type.includes("image/")) {
            toast({
                title: "Invalid File Type",
                description: "Please upload an image file.",
                variant: "destructive",
            })
            return
        }

        // Check file size (5MB max)
        if (selectedFile.size > 5 * 1024 * 1024) {
            toast({
                title: "File Too Large",
                description: "Maximum image size is 5MB.",
                variant: "destructive",
            })
            return
        }

        setCoverImage(selectedFile)
        setCoverImagePreview(URL.createObjectURL(selectedFile))
    }

    // Handle drag events
    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()

        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    // Handle drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processAudioFile(e.dataTransfer.files[0])
        }
    }

    // Toggle play/pause
    const togglePlay = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            // Resume AudioContext if it was suspended
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            if (audioContext.state === "suspended") {
                audioContext.resume()
            }

            audioRef.current.play().catch((error) => {
                console.error("Error playing audio:", error)
                toast({
                    title: "Playback Error",
                    description: "There was a problem playing this audio file.",
                    variant: "destructive",
                })
            })
        }

        setIsPlaying(!isPlaying)
    }

    // Handle audio ended event
    useEffect(() => {
        const audio = audioRef.current

        const handleEnded = () => {
            setIsPlaying(false)
        }

        if (audio) {
            audio.addEventListener("ended", handleEnded)
        }

        return () => {
            if (audio) {
                audio.removeEventListener("ended", handleEnded)
            }
        }
    }, [audioRef.current])

    // Format time (seconds to mm:ss)
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    // Navigate to next step
    const nextStep = () => {
        // Validate current step
        if (currentStep === STEPS.FILE_UPLOAD && !file) {
            toast({
                title: "File Required",
                description: "Please upload an audio file to continue.",
                variant: "destructive",
            })
            return
        }

        if (currentStep === STEPS.RIFF_INFO) {
            if (!title) {
                toast({
                    title: "Title Required",
                    description: "Please enter a title for your riff.",
                    variant: "destructive",
                })
                return
            }

            if (collection === "new" && !newCollectionName) {
                toast({
                    title: "Collection Name Required",
                    description: "Please enter a name for your new collection.",
                    variant: "destructive",
                })
                return
            }
        }

        if (currentStep === STEPS.MONETIZATION && uploadType === "mint-nft") {
            if (!price) {
                toast({
                    title: "Price Required",
                    description: "Please enter a price for your NFT.",
                    variant: "destructive",
                })
                return
            }
        }

        // Move to next step
        if (currentStep < STEPS.PREVIEW) {
            setCurrentStep(currentStep + 1)

            // Skip staking step if not minting or staking disabled
            if (currentStep === STEPS.MONETIZATION && (uploadType === "just-upload" || !enableStaking)) {
                setCurrentStep(STEPS.PREVIEW)
            }
        }
    }

    // Navigate to previous step
    const prevStep = () => {
        if (currentStep > STEPS.FILE_UPLOAD) {
            setCurrentStep(currentStep - 1)

            // Skip staking step if not minting or staking disabled
            if (currentStep === STEPS.PREVIEW && (uploadType === "just-upload" || !enableStaking)) {
                setCurrentStep(STEPS.MONETIZATION)
            }
        }
    }

    // Handle submit with retry mechanism
    const handleSubmit = async () => {
        if (!file || !walletAddress) return

        setIsUploading(true)
        let retryCount = 0
        const maxRetries = 3

        const uploadWithRetry = async () => {
            try {
                const formData = new FormData()
                formData.append("audio", file)
                if (coverImage) {
                    formData.append("cover", coverImage)
                }
                formData.append("title", title)
                formData.append("description", description)
                formData.append("genre", genre)
                formData.append("mood", mood)
                formData.append("instrument", instrument)
                formData.append("keySignature", keySignature)
                formData.append("timeSignature", timeSignature)
                formData.append("isBargainBin", String(isBargainBin))
                formData.append("price", price || "0")
                formData.append("currency", currency)
                formData.append("royaltyPercentage", String(royaltyPercentage))
                formData.append("isStakable", String(enableStaking))
                formData.append("stakingRoyaltyShare", String(customRoyaltyShare))
                formData.append("unlockSourceFiles", String(unlockSourceFiles))
                formData.append("unlockRemixRights", String(unlockRemixRights))
                formData.append("unlockPrivateMessages", String(unlockPrivateMessages))
                formData.append("unlockBackstageContent", String(unlockBackstageContent))
                formData.append("walletAddress", walletAddress)

                if (collection === "new" && newCollectionName) {
                    formData.append("newCollectionName", newCollectionName)
                    formData.append("newCollectionDescription", newCollectionDescription)
                } else if (collection === "existing" && selectedCollectionId) {
                    formData.append("collectionId", selectedCollectionId)
                }

                const response = await nftApi.createRiff(walletAddress, formData)
                
                toast({
                    title: "Success",
                    description: "Your riff has been uploaded successfully!",
                })
                
                // Redirect to profile page instead of riff page
                router.push(`/profile/${walletAddress}`)
            } catch (error: any) {
                console.error("Upload error:", error)
                
                if (retryCount < maxRetries) {
                    retryCount++
                    const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
                    toast({
                        title: "Upload Failed",
                        description: `Retrying upload (${retryCount}/${maxRetries})...`,
                        variant: "destructive",
                    })
                    await new Promise(resolve => setTimeout(resolve, delay))
                    return uploadWithRetry()
                }
                
                toast({
                    title: "Upload Failed",
                    description: error.message || "Failed to upload riff. Please try again.",
                    variant: "destructive",
                })
            } finally {
                setIsUploading(false)
            }
        }

        await uploadWithRetry()
    }

    // Generate a random waveform if no cover image
    const generateWaveform = () => {
        setCoverImagePreview("/audio-waveform-visualization.png")
    }

    // Render step indicator
    const renderStepIndicator = () => {
        // Filter out skipped steps to get the list of visible steps
        const visibleSteps = Object.values(STEPS)
            .filter((step) => typeof step === "number")
            .filter((step) => {
                // Skip staking step if not minting or staking disabled
                if (step === STEPS.STAKING && (uploadType === "just-upload" || !enableStaking)) {
                    return false // Exclude this step
                }
                return true // Include this step
            })

        return (
            <div className="flex justify-center mb-8">
                <div className="flex items-center space-x-2">
                    {visibleSteps.map((step, index) => {
                        const isActive = currentStep === step
                        const isCompleted = currentStep > step
                        const displayedStepNumber = index + 1

                        return (
                            <div key={step} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive
                                        ? "bg-violet-500 text-white"
                                        : isCompleted
                                            ? "bg-green-500 text-white"
                                            : "bg-zinc-800 text-zinc-400"
                                        }`}
                                >
                                    {isCompleted ? <Check className="h-4 w-4" /> : <span>{displayedStepNumber}</span>}
                                </div>

                                {/* Render connector line only if it's not the last visible step */}
                                {index < visibleSteps.length - 1 && <div className={`w-8 h-0.5 ${isCompleted ? "bg-green-500" : "bg-zinc-800"}`}></div>}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Render file upload step
    const renderFileUploadStep = () => {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">Upload Your Riff</h2>
                    <p className="text-zinc-400">How much is your Riff worth?</p>
                </div>

                <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${dragActive
                        ? "border-violet-500 bg-violet-500/10"
                        : file
                            ? "border-green-500 bg-green-500/10"
                            : "border-zinc-700 hover:border-zinc-500"
                        }`}
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                >
                    {file ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center">
                                <div className="bg-zinc-900/80 rounded-full p-3">
                                    <FileAudio className="h-8 w-8 text-green-500" />
                                </div>
                            </div>

                            <div>
                                <p className="font-medium text-lg">{file.name}</p>
                                <p className="text-zinc-400 text-sm">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {fileDuration && formatTime(fileDuration)}
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <WaveformVisualizer audioUrl={filePreview || ""} />
                            </div>

                            <div className="flex justify-center gap-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                    onClick={() => {
                                        setFile(null)
                                        setFilePreview(null)
                                        setFileDuration(null)
                                        if (audioRef.current) {
                                            audioRef.current.pause()
                                            setIsPlaying(false)
                                        }
                                    }}
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Remove
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                    onClick={togglePlay}
                                >
                                    {isPlaying ? (
                                        <>
                                            <Pause className="mr-2 h-4 w-4" />
                                            Pause
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-2 h-4 w-4" />
                                            Play
                                        </>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                    onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.click()
                                        }
                                    }}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Replace
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center">
                                <div className="bg-zinc-900/80 rounded-full p-3">
                                    <Music className="h-8 w-8 text-violet-500" />
                                </div>
                            </div>

                            <div>
                                <p className="font-medium text-lg">Drag & drop your audio file here</p>
                                <p className="text-zinc-400 text-sm">MP3 or WAV • 25MB max • 1 minute max</p>
                            </div>

                            <div>
                                <Button
                                    variant="outline"
                                    className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                    onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.click()
                                        }
                                    }}
                                >
                                    <Upload className="mr-2 h-4 w-4" />
                                    Browse Files
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="audio/mp3,audio/wav"
                    className="hidden"
                />

                <div className="flex justify-end">
                    <Button className="bg-violet-600 hover:bg-violet-700" onClick={nextStep} disabled={!file}>
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    // Render riff info step
    const renderRiffInfoStep = () => {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">Riff Information</h2>
                    <p className="text-zinc-400">Tell us about your riff</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title *</Label>
                            <Input
                                id="title"
                                placeholder="Give your riff a name"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="bg-zinc-900/50 border-zinc-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Describe your riff, its context, or the vibe you were going for"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-zinc-900/50 border-zinc-800 min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="genre">Genre</Label>
                                <Select value={genre} onValueChange={(value: Genre) => setGenre(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select genre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GENRES.filter(g => g !== "All").map((g) => (
                                            <SelectItem key={g} value={g}>
                                                {g}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mood">Mood</Label>
                                <Select value={mood} onValueChange={(value: Mood) => setMood(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select mood" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MOODS.filter(m => m !== "All").map((m) => (
                                            <SelectItem key={m} value={m}>
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instrument">Primary Instrument</Label>
                                <Select value={instrument} onValueChange={(value: Instrument) => setInstrument(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select primary instrument" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INSTRUMENTS.filter(i => i !== "All").map((i) => (
                                            <SelectItem key={i} value={i}>
                                                {i}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="key">Key Signature</Label>
                                <Select value={keySignature} onValueChange={(value: KeySignature) => setKeySignature(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select key signature" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {KEY_SIGNATURES.map((key) => (
                                            <SelectItem key={key} value={key}>
                                                {key}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="time">Time Signature</Label>
                                <Select value={timeSignature} onValueChange={(value: TimeSignature) => setTimeSignature(value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select time signature" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TIME_SIGNATURES.map((time) => (
                                            <SelectItem key={time} value={time}>
                                                {time}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="bargain-bin" className="cursor-pointer">
                                        Bargain Bin
                                    </Label>
                                    <Switch id="bargain-bin" checked={isBargainBin} onCheckedChange={setIsBargainBin} />
                                </div>
                                <p className="text-xs text-zinc-500">Flag this riff as a bargain bin item for discounted pricing</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Collection</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${collection === "new"
                                        ? "border-violet-500 bg-violet-500/10"
                                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                                        }`}
                                    onClick={() => {
                                        setCollection("new")
                                        setSelectedCollectionId(null)
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                                            {collection === "new" && <div className="w-3 h-3 rounded-full bg-violet-500"></div>}
                                        </div>
                                        <span>Create New Collection</span>
                                    </div>

                                    {collection === "new" && (
                                        <div className="mt-3 space-y-3">
                                            <Input
                                                placeholder="Collection name"
                                                value={newCollectionName}
                                                onChange={(e) => setNewCollectionName(e.target.value)}
                                                className="bg-zinc-900/50 border-zinc-800"
                                            />
                                            <Textarea
                                                placeholder="Collection description (optional)"
                                                value={newCollectionDescription}
                                                onChange={(e) => setNewCollectionDescription(e.target.value)}
                                                className="bg-zinc-900/50 border-zinc-800 min-h-[80px]"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${collection === "existing"
                                        ? "border-violet-500 bg-violet-500/10"
                                        : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                                        }`}
                                    onClick={() => setCollection("existing")}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                                            {collection === "existing" && <div className="w-3 h-3 rounded-full bg-violet-500"></div>}
                                        </div>
                                        <span>Add to Existing Collection</span>
                                    </div>

                                    {collection === "existing" && (
                                        <div className="mt-3">
                                            {isLoadingCollections ? (
                                                <div className="flex items-center justify-center py-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : collections.length > 0 ? (
                                                <Select value={selectedCollectionId || ""} onValueChange={setSelectedCollectionId}>
                                                    <SelectTrigger className="bg-zinc-900/50 border-zinc-800">
                                                        <SelectValue placeholder="Select collection" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-zinc-900 border-zinc-800">
                                                        {collections.map((collection) => (
                                                            <SelectItem key={collection.id} value={collection.id.toString()}>
                                                                {collection.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <p className="text-sm text-zinc-500">No collections found</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Cover Image (Optional)</Label>
                            <div
                                className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${coverImagePreview ? "border-green-500 bg-green-500/10" : "border-zinc-700 hover:border-zinc-500"
                                    }`}
                                onClick={() => {
                                    if (imageInputRef.current) {
                                        imageInputRef.current.click()
                                    }
                                }}
                            >
                                {coverImagePreview ? (
                                    <div className="space-y-4">
                                        <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                                            <Image
                                                src={coverImagePreview || "/placeholder.svg"}
                                                alt="Cover preview"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>

                                        <div className="flex justify-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setCoverImage(null)
                                                    setCoverImagePreview(null)
                                                }}
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Remove
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    if (imageInputRef.current) {
                                                        imageInputRef.current.click()
                                                    }
                                                }}
                                            >
                                                <Upload className="mr-2 h-4 w-4" />
                                                Replace
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-center">
                                            <div className="bg-zinc-900/80 rounded-full p-3">
                                                <ImageIcon className="h-8 w-8 text-violet-500" />
                                            </div>
                                        </div>

                                        <div>
                                            <p className="font-medium">Add Cover Image</p>
                                            <p className="text-zinc-400 text-sm">JPG, PNG or GIF • 5MB max</p>
                                        </div>

                                        <div className="flex justify-center gap-2">
                                            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-zinc-300">
                                                <Upload className="mr-2 h-4 w-4" />
                                                Upload Image
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    generateWaveform()
                                                }}
                                            >
                                                <Music className="mr-2 h-4 w-4" />
                                                Generate Waveform
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        </div>

                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <Info className="h-5 w-5 text-blue-400" />
                                <h3 className="font-medium">Audio Preview</h3>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-center">
                                    <WaveformVisualizer audioUrl={filePreview || ""} />
                                </div>

                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                        onClick={togglePlay}
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Pause className="mr-2 h-4 w-4" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 h-4 w-4" />
                                                Play
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="text-center text-sm text-zinc-500">
                                    {file?.name} • {fileDuration && formatTime(fileDuration)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between">
                    <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-300" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <Button className="bg-violet-600 hover:bg-violet-700" onClick={nextStep}>
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    // Render monetization step
    const renderMonetizationStep = () => {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">Monetization & Rights</h2>
                    <p className="text-zinc-400">Choose how you want to share and monetize your riff</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div
                        className={`p-6 rounded-xl border cursor-pointer transition-all ${uploadType === "just-upload"
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                            }`}
                        onClick={() => setUploadType("just-upload")}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1">
                                {uploadType === "just-upload" && <div className="w-3 h-3 rounded-full bg-violet-500"></div>}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-2">Just Upload (Non-minted)</h3>
                                <ul className="space-y-2 text-zinc-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Stored via Arweave (decentralized, permanent)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Small one-time storage fee
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Appears on profile, shareable and tip-able
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <X className="h-4 w-4 text-red-500" />
                                        Not tradable, not tokenized, not stakable
                                    </li>
                                </ul>
                                <p className="text-sm text-zinc-500 mt-2">You can always mint this riff as an NFT later.</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`p-6 rounded-xl border cursor-pointer transition-all ${uploadType === "mint-nft"
                            ? "border-violet-500 bg-violet-500/10"
                            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
                            }`}
                        onClick={() => setUploadType("mint-nft")}
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1">
                                {uploadType === "mint-nft" && <div className="w-3 h-3 rounded-full bg-violet-500"></div>}
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-2">Mint as NFT Riff</h3>
                                <ul className="space-y-2 text-zinc-300">
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        ERC-721 on Polygon
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Minting fee (gas + storage)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Fully tradable, ownable, stakable
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500" />
                                        Unlock tipping, resale royalties, staking, remix mechanics
                                    </li>
                                </ul>
                                <p className="text-sm text-zinc-500 mt-2">
                                    Recommended for riffs you want to monetize and share widely.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {uploadType === "mint-nft" && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold">Set Your Value</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price</Label>
                                    <div className="flex">
                                        <Input
                                            id="price"
                                            type="text"
                                            placeholder="0.00"
                                            value={price}
                                            onChange={(e) => {
                                                // Allow only numbers and decimals
                                                const value = e.target.value.replace(/[^0-9.]/g, "")
                                                setPrice(value)
                                            }}
                                            className="bg-zinc-900/50 border-zinc-800 rounded-r-none"
                                        />
                                        <Select value={currency} onValueChange={setCurrency}>
                                            <SelectTrigger className="bg-zinc-900/50 border-zinc-800 rounded-l-none w-24">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-zinc-800">
                                                <SelectItem value="RIFF">RIFF</SelectItem>
                                                <SelectItem value="POL">POL</SelectItem>
                                                <SelectItem value="ETH">ETH</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="royalty">Royalty Percentage</Label>
                                        <span className="text-sm text-zinc-400">{royaltyPercentage}%</span>
                                    </div>
                                    <Slider
                                        id="royalty"
                                        min={0}
                                        max={25}
                                        step={1}
                                        value={[royaltyPercentage]}
                                        onValueChange={(value) => setRoyaltyPercentage(value[0])}
                                        className="py-4"
                                    />
                                    <p className="text-xs text-zinc-500">
                                        You'll receive this percentage of the sale price each time your NFT is resold.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="staking-toggle" className="cursor-pointer">
                                            Enable Staking
                                        </Label>
                                        <Switch id="staking-toggle" checked={enableStaking} onCheckedChange={setEnableStaking} />
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        Allow others to stake RIFF tokens on your riff to earn a share of royalties.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium">Unlockables</h4>
                                <p className="text-sm text-zinc-400">
                                    Add exclusive content that only the owner of this NFT can access.
                                </p>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="source-files" className="cursor-pointer flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-zinc-500" />
                                            Source File Downloads
                                        </Label>
                                        <Switch id="source-files" checked={unlockSourceFiles} onCheckedChange={setUnlockSourceFiles} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="remix-rights" className="cursor-pointer flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-zinc-500" />
                                            Remix Rights
                                        </Label>
                                        <Switch id="remix-rights" checked={unlockRemixRights} onCheckedChange={setUnlockRemixRights} />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="private-messages" className="cursor-pointer flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-zinc-500" />
                                            Private Messages/Notes
                                        </Label>
                                        <Switch
                                            id="private-messages"
                                            checked={unlockPrivateMessages}
                                            onCheckedChange={setUnlockPrivateMessages}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="backstage-content" className="cursor-pointer flex items-center gap-2">
                                            <Lock className="h-4 w-4 text-zinc-500" />
                                            "Backstage" Content
                                        </Label>
                                        <Switch
                                            id="backstage-content"
                                            checked={unlockBackstageContent}
                                            onCheckedChange={setUnlockBackstageContent}
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="profile-defaults" className="cursor-pointer">
                                            Use Profile Defaults
                                        </Label>
                                        <Switch
                                            id="profile-defaults"
                                            checked={useProfileDefaults}
                                            onCheckedChange={setUseProfileDefaults}
                                        />
                                    </div>
                                    <p className="text-xs text-zinc-500">
                                        Use your profile's default royalty, staking, and unlockables settings.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-between">
                    <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-300" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <Button className="bg-violet-600 hover:bg-violet-700" onClick={nextStep}>
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    // Render staking settings step
    const renderStakingSettingsStep = () => {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">Rifflords Staking Settings</h2>
                    <p className="text-zinc-400">Configure how others can stake on your riff</p>
                </div>

                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Coins className="h-8 w-8 text-violet-500" />
                            <div>
                                <h3 className="text-xl font-bold">Staking Configuration</h3>
                                <p className="text-zinc-400">
                                    Allow others to stake RIFF tokens on your riff to earn a share of royalties.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="royalty-share">Royalty Share for Stakers</Label>
                                    <span className="text-sm text-zinc-400">{customRoyaltyShare}%</span>
                                </div>
                                <Slider
                                    id="royalty-share"
                                    min={10}
                                    max={90}
                                    step={5}
                                    value={[customRoyaltyShare]}
                                    onValueChange={(value) => setCustomRoyaltyShare(value[0])}
                                    className="py-4"
                                />
                                <p className="text-xs text-zinc-500">
                                    This percentage of your royalties will be shared among stakers based on their stake amount. You'll
                                    keep {100 - customRoyaltyShare}% of royalties.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Percent className="h-5 w-5 text-violet-400" />
                                        <h4 className="font-medium">Your Share</h4>
                                    </div>
                                    <div className="text-3xl font-bold text-center py-4">{100 - customRoyaltyShare}%</div>
                                    <p className="text-xs text-zinc-500 text-center">Percentage of royalties you'll keep</p>
                                </div>

                                <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Coins className="h-5 w-5 text-violet-400" />
                                        <h4 className="font-medium">Stakers Share</h4>
                                    </div>
                                    <div className="text-3xl font-bold text-center py-4">{customRoyaltyShare}%</div>
                                    <p className="text-xs text-zinc-500 text-center">Percentage shared among all stakers</p>
                                </div>
                            </div>

                            <div className="pt-4">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="profile-staking-defaults" className="cursor-pointer">
                                        Use Profile Defaults
                                    </Label>
                                    <Switch
                                        id="profile-staking-defaults"
                                        checked={useProfileDefaults}
                                        onCheckedChange={setUseProfileDefaults}
                                    />
                                </div>
                                <p className="text-xs text-zinc-500">
                                    Use your profile's default staking settings instead of custom settings for this riff.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between">
                    <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-300" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <Button className="bg-violet-600 hover:bg-violet-700" onClick={nextStep}>
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </div>
        )
    }

    // Render preview step
    const renderPreviewStep = () => {
        return (
            <div className="space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-2">Preview & Confirm</h2>
                    <p className="text-zinc-400">Review your riff before {uploadType === "mint-nft" ? "minting" : "uploading"}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-4">Riff Information</h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm text-zinc-500 mb-1">Title</h4>
                                    <p className="font-medium">{title || "Untitled Riff"}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm text-zinc-500 mb-1">Upload Type</h4>
                                    <p className="font-medium">{uploadType === "mint-nft" ? "NFT Riff" : "Standard Upload"}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm text-zinc-500 mb-1">Genre</h4>
                                    <p className="font-medium">{genre || "Not specified"}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm text-zinc-500 mb-1">Mood</h4>
                                    <p className="font-medium">{mood || "Not specified"}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm text-zinc-500 mb-1">Instrument</h4>
                                    <p className="font-medium">{instrument || "Not specified"}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm text-zinc-500 mb-1">Collection</h4>
                                    <p className="font-medium">
                                        {collection === "new" ? newCollectionName || "New Collection" : "Existing Collection"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4">
                                <h4 className="text-sm text-zinc-500 mb-1">Description</h4>
                                <p className="text-zinc-300">{description || "No description provided."}</p>
                            </div>
                        </div>

                        {uploadType === "mint-nft" && (
                            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-xl font-bold mb-4">Monetization Settings</h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="text-sm text-zinc-500 mb-1">Price</h4>
                                        <p className="font-medium">
                                            {price || "0"} {currency}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm text-zinc-500 mb-1">Royalty</h4>
                                        <p className="font-medium">{royaltyPercentage}%</p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm text-zinc-500 mb-1">Staking</h4>
                                        <p className="font-medium">
                                            {enableStaking ? "Enabled" : "Disabled"}
                                            {enableStaking && ` (${customRoyaltyShare}% to stakers)`}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-sm text-zinc-500 mb-1">Unlockables</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {unlockSourceFiles && (
                                                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full text-xs">
                                                    Source Files
                                                </span>
                                            )}
                                            {unlockRemixRights && (
                                                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full text-xs">
                                                    Remix Rights
                                                </span>
                                            )}
                                            {unlockPrivateMessages && (
                                                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full text-xs">
                                                    Private Messages
                                                </span>
                                            )}
                                            {unlockBackstageContent && (
                                                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded-full text-xs">
                                                    Backstage Content
                                                </span>
                                            )}
                                            {!unlockSourceFiles &&
                                                !unlockRemixRights &&
                                                !unlockPrivateMessages &&
                                                !unlockBackstageContent && <span className="text-zinc-500 text-xs">None</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-xl font-bold mb-4">Wallet Connection</h3>

                            {isConnected ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <p className="text-zinc-300">
                                        Your wallet is connected and ready for {uploadType === "mint-nft" ? "minting" : "uploading"}.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <p className="text-zinc-300">Please connect your wallet to continue.</p>
                                    </div>

                                    <WalletConnect />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4">Preview</h3>

                            <div className="space-y-4">
                                <div className="relative aspect-square rounded-lg overflow-hidden">
                                    {coverImagePreview ? (
                                        <Image
                                            src={coverImagePreview || "/placeholder.svg"}
                                            alt="Cover preview"
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                            <Music className="h-12 w-12 text-zinc-600" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <h4 className="font-medium">{title || "Untitled Riff"}</h4>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-zinc-400">{fileDuration && formatTime(fileDuration)}</span>
                                        {uploadType === "mint-nft" && (
                                            <span className="text-violet-400">
                                                {price || "0"} {currency}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-zinc-700 text-zinc-400 hover:text-zinc-300"
                                        onClick={togglePlay}
                                    >
                                        {isPlaying ? (
                                            <>
                                                <Pause className="mr-2 h-4 w-4" />
                                                Pause
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 h-4 w-4" />
                                                Play
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-4">Summary</h3>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">File Type</span>
                                    <span>{file?.type.split("/")[1].toUpperCase() || "Unknown"}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-400">File Size</span>
                                    <span>{file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : "Unknown"}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Duration</span>
                                    <span>{fileDuration ? formatTime(fileDuration) : "Unknown"}</span>
                                </div>

                                {uploadType === "mint-nft" && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Minting Fee (est.)</span>
                                            <span>~0.001 POL</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="text-zinc-400">Storage Fee</span>
                                            <span>~5 RIFF</span>
                                        </div>
                                    </>
                                )}

                                {uploadType === "just-upload" && (
                                    <div className="flex justify-between">
                                        <span className="text-zinc-400">Storage Fee</span>
                                        <span>~2 RIFF</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between">
                    <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-300" onClick={prevStep}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>

                    <Button
                        className="bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600"
                        onClick={handleSubmit}
                        disabled={!isConnected || isUploading || isMinting}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : isMinting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Minting...
                            </>
                        ) : (
                            <>
                                {uploadType === "mint-nft" ? "Mint NFT" : "Upload Riff"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        )
    }

    // Render the appropriate step
    const renderStep = () => {
        switch (currentStep) {
            case STEPS.FILE_UPLOAD:
                return renderFileUploadStep()
            case STEPS.RIFF_INFO:
                return renderRiffInfoStep()
            case STEPS.MONETIZATION:
                return renderMonetizationStep()
            case STEPS.STAKING:
                return renderStakingSettingsStep()
            case STEPS.PREVIEW:
                return renderPreviewStep()
            default:
                return renderFileUploadStep()
        }
    }

    return (
        <MainLayout>
            <CreativeGradientBackground variant="upload">
                <div className="min-h-screen pb-16 mt-16">
                    <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                        {renderStepIndicator()}

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </CreativeGradientBackground>
        </MainLayout>
    )
}
