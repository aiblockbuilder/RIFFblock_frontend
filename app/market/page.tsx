"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
    Search,
    Filter,
    Play,
    Pause,
    Heart,
    Share2,
    ShoppingCart,
    Sparkles,
    TrendingUp,
    Star,
    Upload,
    Disc,
    Volume2,
    VolumeX,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react"
import WalletConnect from "@/components/wallet-connect"
import MainLayout from "@/components/layouts/main-layout"
import VerticalLineWaveform from "@/components/vertical-line-waveform"
import StringLights from "@/components/string-lights"

// Import mock data
import { featuredArtists, riffs, bargainRiffs, genres, moods, instruments } from "@/data/market-data"

// Define types for our data
interface Riff {
    id: number
    title: string
    artist: string
    artistId: number
    genre: string
    mood?: string
    instrument?: string
    price: number
    currency: string
    image: string
    audio?: string
    createdAt: string
    stakable: boolean
    backstage: boolean
    unlockable: boolean
    tips: number
    description?: string
}

interface Artist {
    id: number;
    name: string;
    image: string;
    category: string;
}

export default function MarketPage() {
    const [selectedRiff, setSelectedRiff] = useState<Riff | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentAudio, setCurrentAudio] = useState<Riff | null>(null)
    const [soundEnabled, setSoundEnabled] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [selectedGenre, setSelectedGenre] = useState("All")
    const [selectedMood, setSelectedMood] = useState("All")
    const [selectedInstrument, setSelectedInstrument] = useState("All")
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50])
    const [showStakableOnly, setShowStakableOnly] = useState(false)
    const [showBackstageOnly, setShowBackstageOnly] = useState(false)
    const [showUnlockableOnly, setShowUnlockableOnly] = useState(false)
    const [sortOption, setSortOption] = useState("Newest")
    const [searchQuery, setSearchQuery] = useState("")
    const [activeShelf, setActiveShelf] = useState<string | null>(null)
    const [activeBin, setActiveBin] = useState<string | null>(null)
    const [showNowPlaying, setShowNowPlaying] = useState(false)

    const audioRef = useRef<HTMLAudioElement>(null)
    const ambienceRef = useRef<HTMLAudioElement>(null)
    const vinylFlipRef = useRef<HTMLAudioElement>(null)
    const pathname = usePathname()
    const shelfRefs = useRef<Record<string, HTMLDivElement | null>>({})
    const filterSidebarRef = useRef<HTMLDivElement>(null)

    // Group featured artists by category
    const artistsByCategory = featuredArtists.reduce<Record<string, Artist[]>>((acc, artist) => {
        if (!acc[artist.category]) {
            acc[artist.category] = []
        }
        acc[artist.category].push(artist)
        return acc
    }, {})

    // Filter riffs based on selected filters
    const filteredRiffs = riffs.filter((riff) => {
        // Search query filter
        if (
            searchQuery &&
            !riff.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !riff.artist.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !riff.genre.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false
        }

        // Genre filter
        if (selectedGenre !== "All" && riff.genre !== selectedGenre) return false

        // Mood filter
        if (selectedMood !== "All" && riff.mood !== selectedMood) return false

        // Instrument filter
        if (selectedInstrument !== "All" && riff.instrument !== selectedInstrument) return false

        // Price range filter
        if (riff.price < priceRange[0] || riff.price > priceRange[1]) return false

        // Stakable filter
        if (showStakableOnly && !riff.stakable) return false

        // Backstage filter
        if (showBackstageOnly && !riff.backstage) return false

        // Unlockable filter
        if (showUnlockableOnly && !riff.unlockable) return false

        return true
    })

    // Sort filtered riffs
    const sortedRiffs = [...filteredRiffs].sort((a, b) => {
        switch (sortOption) {
            case "A-Z":
                return a.title.localeCompare(b.title)
            case "Z-A":
                return b.title.localeCompare(a.title)
            case "Lowest Price":
                return a.price - b.price
            case "Highest Price":
                return b.price - a.price
            case "Most Tipped":
                return b.tips - a.tips
            case "Newest":
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
    })

    // Group riffs by genre for bins
    const riffsByGenre = genres.reduce<Record<string, Riff[]>>((acc, genre) => {
        acc[genre] = sortedRiffs.filter((riff) => riff.genre === genre)
        return acc
    }, {})

    // Group riffs by mood for bins
    const riffsByMood = moods.reduce<Record<string, Riff[]>>((acc, mood) => {
        acc[mood] = sortedRiffs.filter((riff) => riff.mood === mood)
        return acc
    }, {})

    // Group riffs by instrument for bins
    const riffsByInstrument = instruments.reduce<Record<string, Riff[]>>((acc, instrument) => {
        acc[instrument] = sortedRiffs.filter((riff) => riff.instrument === instrument)
        return acc
    }, {})

    // Handle play/pause audio
    const togglePlay = (riff: Riff, e?: React.MouseEvent) => {
        e?.stopPropagation()

        if (currentAudio && currentAudio.id === riff.id) {
            if (isPlaying) {
                audioRef.current?.pause()
            } else {
                audioRef.current?.play()
            }
            setIsPlaying(!isPlaying)
        } else {
            if (audioRef.current) {
                audioRef.current.pause()
            }
            setCurrentAudio(riff)
            setIsPlaying(true)
            // In a real app, we would load the audio file here
            // For now, we'll just simulate it
            setTimeout(() => {
                if (audioRef.current) {
                    audioRef.current.play()
                }
            }, 100)
        }

        setShowNowPlaying(true)
    }

    // Open riff detail modal
    const openRiffDetail = (riff: Riff) => {
        setSelectedRiff(riff)
        playVinylFlipSound()
    }

    // Close riff detail modal
    const closeRiffDetail = () => {
        setSelectedRiff(null)
    }

    // Toggle ambient sounds
    const toggleSound = () => {
        setSoundEnabled(!soundEnabled)

        if (!soundEnabled) {
            if (ambienceRef.current) {
                ambienceRef.current.volume = 0.2
                ambienceRef.current.play().catch((err) => console.error("Error playing ambience:", err))
            }
        } else {
            if (ambienceRef.current) {
                ambienceRef.current.pause()
            }
        }
    }

    // Toggle filter sidebar
    const toggleFilters = () => {
        setShowFilters(!showFilters)
        playVinylFlipSound()
    }

    // Reset filters
    const resetFilters = () => {
        setSelectedGenre("All")
        setSelectedMood("All")
        setSelectedInstrument("All")
        setPriceRange([0, 50])
        setShowStakableOnly(false)
        setShowBackstageOnly(false)
        setShowUnlockableOnly(false)
        setSortOption("Newest")
        setSearchQuery("")
    }

    // Vinyl flip sound effect
    const playVinylFlipSound = () => {
        if (soundEnabled && vinylFlipRef.current) {
            vinylFlipRef.current.currentTime = 0
            vinylFlipRef.current.play().catch((err) => console.error("Error playing vinyl flip sound:", err))
        }
    }

    // Scroll shelf horizontally
    const scrollShelf = (category: string, direction: "left" | "right") => {
        if (shelfRefs.current[category]) {
            const scrollAmount = direction === "left" ? -300 : 300
            shelfRefs.current[category]?.scrollBy({
                left: scrollAmount,
                behavior: "smooth",
            })
        }
        playVinylFlipSound()
    }

    // Set active shelf on hover
    const handleShelfHover = (category: string | null) => {
        setActiveShelf(category)
    }

    // Set active bin on hover
    const handleBinHover = (binType: string | null) => {
        setActiveBin(binType)
    }

    // Handle search input
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value)
    }

    // Simulate vinyl crackle sound on component mount
    useEffect(() => {
        // Initialize audio elements
        return () => {
            // Cleanup sounds on unmount
            if (audioRef.current) {
                audioRef.current.pause()
            }
            if (ambienceRef.current) {
                ambienceRef.current.pause()
            }
            if (vinylFlipRef.current) {
                vinylFlipRef.current.pause()
            }
        }
    }, [])

    // Close filter sidebar when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                showFilters &&
                filterSidebarRef.current &&
                !filterSidebarRef.current.contains(event.target as Node) &&
                // Exclude the filter toggle button from closing the sidebar
                !(event.target as Element).closest("[data-filter-toggle]")
            ) {
                setShowFilters(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showFilters])

    return (
        <MainLayout>
            <div className="min-h-screen relative">
                {/* Wood grain background */}
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: 'url("/images/wood-background-texture.png")',
                        backgroundRepeat: "repeat",
                        backgroundSize: "500px",
                        filter: "brightness(0.9) contrast(1.1)",
                        opacity: 0.9,
                    }}
                ></div>

                {/* Dark overlay for better readability */}
                <div className="fixed inset-0 bg-black/60 z-0"></div>

                {/* String lights at the ceiling */}
                {/* <StringLights /> */}

                {/* Audio elements */}
                <audio
                    ref={audioRef}
                    src={currentAudio?.audio || "/placeholder-audio.mp3"}
                    onEnded={() => setIsPlaying(false)}
                />
                <audio ref={ambienceRef} src="/vinyl-crackle.mp3" loop />
                <audio ref={vinylFlipRef} src="/vinyl-flip.mp3" />

                {/* Page header with sound toggle */}
                <div className="container px-4 md:px-6 mb-8 pt-4 mt-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-orange-100 mb-2 font-serif">The RIFF Store</h1>
                            <p className="text-orange-200/70 max-w-2xl">
                                Browse our crates, discover new sounds, and support your favorite artists.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <motion.div
                                className="flex items-center gap-2 bg-orange-900/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-orange-800/50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <button onClick={toggleSound} className="text-orange-200/70 hover:text-orange-100 transition-colors">
                                    {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                                </button>
                                <span className="text-xs text-orange-200/70">{soundEnabled ? "Ambience On" : "Ambience Off"}</span>
                            </motion.div>
                            <motion.button
                                onClick={toggleFilters}
                                className="bg-orange-900/30 backdrop-blur-sm p-2 rounded-full text-orange-200/70 hover:text-orange-100 transition-colors border border-orange-800/50"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                data-filter-toggle
                            >
                                <Filter size={18} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative mt-6 max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-orange-500/50" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search for riffs, artists, or genres..."
                            className="block w-full pl-10 pr-3 py-2 border border-orange-800/30 rounded-full bg-stone-900/80 backdrop-blur-sm text-orange-100 placeholder-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-transparent"
                            value={searchQuery}
                            onChange={handleSearchInput}
                        />
                    </div>
                </div>

                {/* Wall Display - Featured Artists & Curated Collections */}
                <div className="container px-4 md:px-6 mb-12 relative z-10">
                    <div className="relative">
                        {/* Section header */}
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-orange-100 font-serif">Wall Display</h2>
                            <div className="flex gap-2">
                                <button className="text-sm text-orange-200/70 hover:text-orange-100 transition-colors">View All</button>
                            </div>
                        </div>

                        {/* Shelves */}
                        <div className="space-y-8">
                            {Object.entries(artistsByCategory).map(([category, artists], index) => (
                                <div
                                    key={category}
                                    className="space-y-3"
                                    onMouseEnter={() => handleShelfHover(category)}
                                    onMouseLeave={() => handleShelfHover(null)}
                                >
                                    <div className="flex items-center gap-2">
                                        {category === "Trending Creators" && <TrendingUp size={16} className="text-orange-400" />}
                                        {category === "Curated Themes" && <Sparkles size={16} className="text-orange-400" />}
                                        {category === "Staff Picks" && <Star size={16} className="text-orange-400" />}
                                        {category === "New Uploads This Week" && <Upload size={16} className="text-orange-400" />}
                                        <h3 className="text-sm font-medium text-orange-200 font-serif">{category}</h3>
                                    </div>

                                    {/* Wooden shelf with albums */}
                                    <div className="relative">
                                        {/* Wooden shelf texture */}
                                        <div className="absolute h-[120px] w-full wood-grain-pattern rounded-md opacity-90"></div>

                                        {/* Shadow under shelf */}
                                        <div className="absolute h-2 w-full bottom-0 bg-black/40 blur-sm"></div>

                                        {/* Scroll buttons */}
                                        <motion.button
                                            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-r-full p-1 text-orange-200/70 hover:text-orange-100 transition-colors ${activeShelf === category ? "opacity-100" : "opacity-0"
                                                }`}
                                            onClick={() => scrollShelf(category, "left")}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            style={{ transformOrigin: "center" }}
                                        >
                                            <ChevronLeft size={25} />
                                        </motion.button>

                                        <motion.button
                                            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-l-full p-1 text-orange-200/70 hover:text-orange-100 transition-colors ${activeShelf === category ? "opacity-100" : "opacity-0"
                                                }`}
                                            onClick={() => scrollShelf(category, "right")}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            style={{ transformOrigin: "center" }}
                                        >
                                            <ChevronRight size={25} />
                                        </motion.button>

                                        {/* Albums on shelf */}
                                        <div
                                            className="relative overflow-x-auto py-2 no-scrollbar"
                                            ref={(el) => {
                                                shelfRefs.current[category] = el; // No return statement
                                            }}
                                        >
                                            <div className="flex gap-4 px-2 pb-2 pt-1" style={{ width: "max-content" }}>
                                                {artists.map((artist) => (
                                                    <motion.div
                                                        key={artist.id}
                                                        className="group relative w-[100px] cursor-pointer"
                                                        onClick={() => openRiffDetail(artist as unknown as Riff)}
                                                        whileHover={{
                                                            y: -5,
                                                            scale: 1.05,
                                                            transition: { type: "spring", stiffness: 300, damping: 10 },
                                                        }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <div className="relative h-[100px] w-[100px] rounded-md overflow-hidden shadow-lg transform transition-transform group-hover:shadow-orange-500/20">
                                                            {/* Album cover */}
                                                            <Image
                                                                src={artist.image || "/placeholder.svg"}
                                                                alt={artist.name}
                                                                fill
                                                                className="object-cover"
                                                            />

                                                            {/* Vinyl record edge peeking out */}
                                                            <div className="absolute left-0 top-0 w-1 h-full bg-black"></div>

                                                            {/* Overlay gradient */}
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                            {/* Title */}
                                                            <div className="absolute bottom-2 left-2 right-2 text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {artist.name}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Floor Bins - Genre/Tag Browsing */}
                <div className="container px-4 md:px-6 mb-12 relative z-10">
                    <div className="relative">
                        {/* Section header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-orange-100 font-serif">Genre Crates</h2>
                            <div className="flex gap-2">
                                <motion.button
                                    className={`text-sm px-3 py-1 rounded-full transition-colors ${selectedGenre === "All"
                                        ? "bg-orange-500/30 text-orange-100 border border-orange-600/30"
                                        : "bg-orange-900/20 text-orange-200/70 hover:bg-orange-800/30 hover:text-orange-100 border border-orange-800/30"
                                        }`}
                                    onClick={() => setSelectedGenre("All")}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    All Genres
                                </motion.button>
                            </div>
                        </div>

                        {/* Genre crates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {genres.map((genre) => (
                                <motion.div
                                    key={genre}
                                    className={`relative overflow-hidden rounded-md cursor-pointer ${selectedGenre === genre
                                        ? "ring-2 ring-orange-500/50 shadow-lg shadow-orange-500/20"
                                        : "hover:shadow-md hover:shadow-orange-500/10"
                                        }`}
                                    onClick={() => {
                                        setSelectedGenre(genre === selectedGenre ? "All" : genre)
                                        playVinylFlipSound()
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ transformOrigin: "center" }}

                                >
                                    {/* Wooden crate texture */}
                                    <div className="absolute inset-0 wood-grain-pattern opacity-70"></div>

                                    <div className="relative p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Disc size={18} className="text-orange-400" />
                                            <span className="font-medium text-orange-100 font-serif">{genre}</span>
                                        </div>
                                        <span className="text-xs text-orange-200/70">
                                            {riffs.filter((riff) => riff.genre === genre).length} riffs
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Riff cards in crates */}
                        <div
                            className="relative overflow-hidden rounded-lg mb-8"
                            onMouseEnter={() => handleBinHover("genre")}
                            onMouseLeave={() => handleBinHover(null)}
                        >
                            {/* Wooden crate texture */}
                            <div className="absolute inset-0 wood-grain-pattern opacity-70"></div>

                            <div className="relative p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-orange-100 font-serif">
                                        {selectedGenre === "All" ? "All Genres" : selectedGenre}
                                    </h3>
                                    <span className="text-xs text-orange-200/70">
                                        {selectedGenre === "All" ? sortedRiffs.length : riffsByGenre[selectedGenre]?.length || 0} riffs
                                    </span>
                                </div>

                                {/* Scroll buttons */}
                                <motion.button
                                    className={`absolute left-4 top-1/2 z-10 bg-black/50 rounded-full p-1 text-orange-200/70 hover:text-orange-100 transition-colors ${activeBin === "genre" ? "opacity-100" : "opacity-0"}`}
                                    onClick={() => {
                                        const bin = document.getElementById("genre-bin")
                                        if (bin) bin.scrollBy({ left: -300, behavior: "smooth" })
                                        playVinylFlipSound()
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ChevronLeft size={25} />
                                </motion.button>

                                <motion.button
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1 text-orange-200/70 hover:text-orange-100 transition-colors ${activeBin === "genre" ? "opacity-100" : "opacity-0"
                                        }`}
                                    onClick={() => {
                                        const bin = document.getElementById("genre-bin")
                                        if (bin) bin.scrollBy({ left: 300, behavior: "smooth" })
                                        playVinylFlipSound()
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{ transformOrigin: "center" }}
                                >
                                    <ChevronRight size={25} />
                                </motion.button>

                                {/* Horizontally scrollable bin content */}
                                <div id="genre-bin" className="overflow-x-auto no-scrollbar">
                                    <div className="flex gap-4 pb-2" style={{ width: "max-content" }}>
                                        {(selectedGenre === "All" ? sortedRiffs : riffsByGenre[selectedGenre] || []).map((riff) => (
                                            <AlbumCard
                                                key={riff.id}
                                                riff={riff}
                                                isPlaying={currentAudio?.id === riff.id && isPlaying}
                                                onPlay={(e) => togglePlay(riff, e)}
                                                onClick={() => openRiffDetail(riff)}
                                                onFlip={playVinylFlipSound}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mood Bins */}
                <div className="container px-4 md:px-6 mb-12 relative z-10">
                    <div className="relative">
                        {/* Section header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-orange-100 font-serif">Mood Crates</h2>
                            <div className="flex gap-2">
                                <motion.button
                                    className={`text-sm px-3 py-1 rounded-full transition-colors ${selectedMood === "All"
                                        ? "bg-orange-500/30 text-orange-100 border border-orange-600/30"
                                        : "bg-orange-900/20 text-orange-200/70 hover:bg-orange-800/30 hover:text-orange-100 border border-orange-800/30"
                                        }`}
                                    onClick={() => setSelectedMood("All")}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    All Moods
                                </motion.button>
                            </div>
                        </div>

                        {/* Mood crates */}
                        <div
                            className="relative overflow-hidden rounded-lg mb-8"
                            onMouseEnter={() => handleBinHover("mood")}
                            onMouseLeave={() => handleBinHover(null)}
                        >
                            {/* Wooden crate texture */}
                            <div className="absolute inset-0 wood-grain-pattern opacity-70"></div>

                            <div className="relative p-4">
                                <div className="flex items-center gap-4 mb-4 overflow-x-auto no-scrollbar">
                                    {moods.map((mood) => (
                                        <motion.button
                                            key={mood}
                                            className={`px-3 py-1 rounded-full whitespace-nowrap ${selectedMood === mood
                                                ? "bg-orange-500/30 text-orange-100 border border-orange-600/30"
                                                : "bg-orange-900/20 text-orange-200/70 hover:bg-orange-800/30 hover:text-orange-100 border border-orange-800/30"
                                                }`}
                                            onClick={() => {
                                                setSelectedMood(mood === selectedMood ? "All" : mood)
                                                playVinylFlipSound()
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {mood}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Scroll buttons */}
                                <motion.button
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1 text-orange-200/70 hover:text-orange-100 transition-colors ${activeBin === "mood" ? "opacity-100" : "opacity-0"
                                        }`}
                                    onClick={() => {
                                        const bin = document.getElementById("mood-bin")
                                        if (bin) bin.scrollBy({ left: -300, behavior: "smooth" })
                                        playVinylFlipSound()
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{ transformOrigin: "center" }}
                                >
                                    <ChevronLeft size={25} />
                                </motion.button>

                                <motion.button
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1 text-orange-200/70 hover:text-orange-100 transition-colors ${activeBin === "mood" ? "opacity-100" : "opacity-0"
                                        }`}
                                    onClick={() => {
                                        const bin = document.getElementById("mood-bin")
                                        if (bin) bin.scrollBy({ left: 300, behavior: "smooth" })
                                        playVinylFlipSound()
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{ transformOrigin: "center" }}
                                >
                                    <ChevronRight size={25} />
                                </motion.button>

                                {/* Horizontally scrollable bin content */}
                                <div id="mood-bin" className="overflow-x-auto no-scrollbar">
                                    <div className="flex gap-4 pb-2" style={{ width: "max-content" }}>
                                        {(selectedMood === "All" ? sortedRiffs : riffsByMood[selectedMood] || []).map((riff) => (
                                            <AlbumCard
                                                key={riff.id}
                                                riff={riff}
                                                isPlaying={currentAudio?.id === riff.id && isPlaying}
                                                onPlay={(e) => togglePlay(riff, e)}
                                                onClick={() => openRiffDetail(riff)}
                                                onFlip={playVinylFlipSound}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instrument Bins */}
                <div className="container px-4 md:px-6 mb-12 relative z-10">
                    <div className="relative">
                        {/* Section header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-orange-100 font-serif">Instrument Crates</h2>
                            <div className="flex gap-2">
                                <motion.button
                                    className={`text-sm px-3 py-1 rounded-full transition-colors ${selectedInstrument === "All"
                                        ? "bg-orange-500/30 text-orange-100 border border-orange-600/30"
                                        : "bg-orange-900/20 text-orange-200/70 hover:bg-orange-800/30 hover:text-orange-100 border border-orange-800/30"
                                        }`}
                                    onClick={() => setSelectedInstrument("All")}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    All Instruments
                                </motion.button>
                            </div>
                        </div>

                        {/* Instrument crates */}
                        <div
                            className="relative overflow-hidden rounded-lg mb-8"
                            onMouseEnter={() => handleBinHover("instrument")}
                            onMouseLeave={() => handleBinHover(null)}
                        >
                            {/* Wooden crate texture */}
                            <div className="absolute inset-0 wood-grain-pattern opacity-70"></div>

                            <div className="relative p-4">
                                <div className="flex items-center gap-4 mb-4 overflow-x-auto no-scrollbar">
                                    {instruments.map((instrument) => (
                                        <motion.button
                                            key={instrument}
                                            className={`px-3 py-1 rounded-full whitespace-nowrap ${selectedInstrument === instrument
                                                ? "bg-orange-500/30 text-orange-100 border border-orange-600/30"
                                                : "bg-orange-900/20 text-orange-200/70 hover:bg-orange-800/30 hover:text-orange-100 border border-orange-800/30"
                                                }`}
                                            onClick={() => {
                                                setSelectedInstrument(instrument === selectedInstrument ? "All" : instrument)
                                                playVinylFlipSound()
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {instrument}
                                        </motion.button>
                                    ))}
                                </div>

                                {/* Scroll buttons */}
                                <motion.button
                                    className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1 text-orange-200/70 hover:text-orange-100 transition-colors ${activeBin === "instrument" ? "opacity-100" : "opacity-0"
                                        }`}
                                    onClick={() => {
                                        const bin = document.getElementById("instrument-bin")
                                        if (bin) bin.scrollBy({ left: -300, behavior: "smooth" })
                                        playVinylFlipSound()
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{ transformOrigin: "center" }}
                                >
                                    <ChevronLeft size={25} />
                                </motion.button>

                                <motion.button
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1 text-orange-200/70 hover:text-orange-100 transition-colors ${activeBin === "instrument" ? "opacity-100" : "opacity-0"
                                        }`}
                                    onClick={() => {
                                        const bin = document.getElementById("instrument-bin")
                                        if (bin) bin.scrollBy({ left: 300, behavior: "smooth" })
                                        playVinylFlipSound()
                                    }}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{ transformOrigin: "center" }}
                                >
                                    <ChevronRight size={25} />
                                </motion.button>

                                {/* Horizontally scrollable bin content */}
                                <div id="instrument-bin" className="overflow-x-auto no-scrollbar">
                                    <div className="flex gap-4 pb-2" style={{ width: "max-content" }}>
                                        {(selectedInstrument === "All" ? sortedRiffs : riffsByInstrument[selectedInstrument] || []).map(
                                            (riff) => (
                                                <AlbumCard
                                                    key={riff.id}
                                                    riff={riff}
                                                    isPlaying={currentAudio?.id === riff.id && isPlaying}
                                                    onPlay={(e) => togglePlay(riff, e)}
                                                    onClick={() => openRiffDetail(riff)}
                                                    onFlip={playVinylFlipSound}
                                                />
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bargain Bin */}
                <div className="container px-4 md:px-6 mb-12 relative z-10">
                    <div
                        className="relative overflow-hidden rounded-lg"
                        onMouseEnter={() => handleBinHover("bargain")}
                        onMouseLeave={() => handleBinHover(null)}
                    >
                        {/* Wooden crate texture with special styling */}
                        <div className="absolute inset-0 wood-grain-pattern opacity-70"></div>

                        {/* Worn sticker effect */}
                        <div className="absolute top-0 left-10 transform -rotate-6 bg-red-500/80 px-4 py-1 rounded-sm z-10 shadow-md">
                            <span className="text-white font-bold text-sm">BARGAIN BIN</span>
                        </div>

                        <div className="relative p-4 pt-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles size={18} className="text-orange-400" />
                                <h3 className="font-medium text-orange-100 font-serif">Discover Underrated Gems</h3>
                            </div>

                            {/* Scroll buttons */}
                            <motion.button
                                className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1 text-orange-200/70 hover:text-orange-100 transition-colors ${activeBin === "bargain" ? "opacity-100" : "opacity-0"
                                    }`}
                                onClick={() => {
                                    const bin = document.getElementById("bargain-bin")
                                    if (bin) bin.scrollBy({ left: -300, behavior: "smooth" })
                                    playVinylFlipSound()
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ChevronLeft size={25} />
                            </motion.button>

                            <motion.button
                                className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 rounded-full p-1 text-orange-200/70 hover:text-orange-100 transition-colors ${activeBin === "bargain" ? "opacity-100" : "opacity-0"
                                    }`}
                                onClick={() => {
                                    const bin = document.getElementById("bargain-bin")
                                    if (bin) bin.scrollBy({ left: 300, behavior: "smooth" })
                                    playVinylFlipSound()
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ChevronRight size={25} />
                            </motion.button>

                            {/* Horizontally scrollable bin content */}
                            <div id="bargain-bin" className="overflow-x-auto no-scrollbar">
                                <div className="flex gap-4 pb-2" style={{ width: "max-content" }}>
                                    {bargainRiffs.map((riff) => (
                                        <AlbumCard
                                            key={riff.id}
                                            riff={riff}
                                            isPlaying={currentAudio?.id === riff.id && isPlaying}
                                            onPlay={(e) => togglePlay(riff, e)}
                                            onClick={() => openRiffDetail(riff)}
                                            onFlip={playVinylFlipSound}
                                            isBargain
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter sidebar */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            ref={filterSidebarRef}
                            className="fixed inset-y-0 right-0 w-64 md:w-80 bg-gradient-to-l from-stone-800 to-stone-900/95 backdrop-blur-md shadow-lg shadow-black/30 z-40 p-4 border-l border-orange-800/30"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-medium text-orange-100 font-serif">Filters</h3>
                                <motion.button
                                    onClick={toggleFilters}
                                    className="text-orange-200/70 hover:text-orange-100 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={18} />
                                </motion.button>
                            </div>

                            <div className="space-y-6">
                                {/* Sort options */}
                                <div>
                                    <h4 className="text-sm font-medium text-orange-200 mb-2 font-serif">Sort By</h4>
                                    <div className="space-y-1">
                                        {["Newest", "A-Z", "Z-A", "Lowest Price", "Highest Price", "Most Tipped"].map((option) => (
                                            <motion.button
                                                key={option}
                                                className={`block w-full text-left text-sm py-1 transition-colors ${sortOption === option ? "text-orange-400" : "text-orange-200/70 hover:text-orange-100"
                                                    }`}
                                                onClick={() => setSortOption(option)}
                                                whileHover={{ x: 5 }}
                                            >
                                                {option}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                {/* Genre filter */}
                                <div>
                                    <h4 className="text-sm font-medium text-orange-200 mb-2 font-serif">Genre</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <motion.button
                                            className={`text-xs px-2 py-1 rounded-full transition-colors ${selectedGenre === "All"
                                                ? "bg-orange-500/30 text-orange-100 border border-orange-600/30"
                                                : "bg-orange-900/20 text-orange-200/70 hover:bg-orange-800/30 hover:text-orange-100 border border-orange-800/30"
                                                }`}
                                            onClick={() => setSelectedGenre("All")}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            All
                                        </motion.button>

                                        {genres.slice(0, 6).map((genre) => (
                                            <motion.button
                                                key={genre}
                                                className={`text-xs px-2 py-1 rounded-full transition-colors ${selectedGenre === genre
                                                    ? "bg-orange-500/30 text-orange-100 border border-orange-600/30"
                                                    : "bg-orange-900/20 text-orange-200/70 hover:bg-orange-800/30 hover:text-orange-100 border border-orange-800/30"
                                                    }`}
                                                onClick={() => setSelectedGenre(genre)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {genre}
                                            </motion.button>
                                        ))}
                                        <button className="text-xs text-orange-400 hover:underline">More...</button>
                                    </div>
                                </div>

                                {/* Mood filter */}
                                <div>
                                    <h4 className="text-sm font-medium text-orange-200 mb-2 font-serif">Mood</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <motion.button
                                            className={`text-xs px-2 py-1 rounded-full transition-colors ${selectedMood === "All"
                                                ? "bg-orange-500/30 text-orange-100 border border-orange-600/30"
                                                : "bg-orange-900/20 text-orange-200/70 hover:bg-orange-800/30 hover:text-orange-100 border border-orange-800/30"
                                                }`}
                                            onClick={() => setSelectedMood("All")}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            All
                                        </motion.button>

                                        {moods.slice(0, 6).map((mood) => (
                                            <motion.button
                                                key={mood}
                                                className={`text-xs px-2 py-1 rounded-full transition-colors ${selectedMood === mood
                                                    ? "bg-orange-500/30 text-orange-100 border border-orange-600/30"
                                                    : "bg-orange-900/20 text-orange-200/70 hover:bg-orange-800/30 hover:text-orange-100 border border-orange-800/30"
                                                    }`}
                                                onClick={() => setSelectedMood(mood)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {mood}
                                            </motion.button>
                                        ))}
                                        <button className="text-xs text-orange-400 hover:underline">More...</button>
                                    </div>
                                </div>

                                {/* Price range */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-medium text-orange-200 font-serif">Price Range</h4>
                                        <span className="text-xs text-orange-200/70">
                                            {priceRange[0]} - {priceRange[1]} RIFF
                                        </span>
                                    </div>
                                    <Slider
                                        defaultValue={priceRange}
                                        min={0}
                                        max={50}
                                        step={1}
                                        onValueChange={(value) => setPriceRange(value as [number, number])}
                                        className="my-4"
                                    />
                                </div>

                                {/* Toggle filters */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="stakable" className="text-sm text-orange-200">
                                            Stakable Only
                                        </Label>
                                        <Switch
                                            id="stakable"
                                            checked={showStakableOnly}
                                            onCheckedChange={setShowStakableOnly}
                                            className="data-[state=checked]:bg-orange-600"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="backstage" className="text-sm text-orange-200">
                                            Backstage Available
                                        </Label>
                                        <Switch
                                            id="backstage"
                                            checked={showBackstageOnly}
                                            onCheckedChange={setShowBackstageOnly}
                                            className="data-[state=checked]:bg-orange-600"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="unlockable" className="text-sm text-orange-200">
                                            Unlockable Content
                                        </Label>
                                        <Switch
                                            id="unlockable"
                                            checked={showUnlockableOnly}
                                            onCheckedChange={setShowUnlockableOnly}
                                            className="data-[state=checked]:bg-orange-600"
                                        />
                                    </div>
                                </div>

                                {/* Reset filters */}
                                <Button
                                    variant="outline"
                                    className="w-full mt-4 border-orange-700/50 text-orange-200 hover:text-orange-100 hover:bg-orange-900/30"
                                    onClick={resetFilters}
                                >
                                    Reset Filters
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Riff detail modal */}
                <AnimatePresence>
                    {selectedRiff && (
                        <motion.div
                            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="relative bg-gradient-to-br from-stone-800 to-stone-900/90 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-orange-800/30"
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            >
                                {/* Close button */}
                                <motion.button
                                    onClick={closeRiffDetail}
                                    className="absolute top-4 right-4 text-orange-200/70 hover:text-orange-100 transition-colors z-10 bg-black/30 rounded-full p-1"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={18} />
                                </motion.button>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left side - Album art and audio player */}
                                        <div>
                                            <motion.div
                                                className="relative aspect-square rounded-md overflow-hidden mb-4 shadow-lg shadow-black/50"
                                                initial={{ rotateY: 0 }}
                                                whileHover={{ rotateY: 15 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            >
                                                {/* Vinyl record behind album art */}
                                                <div className="absolute inset-0 vinyl-texture rounded-full m-4 z-0"></div>
                                                <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 to-orange-800/20 z-0"></div>

                                                {/* Album art */}
                                                <Image
                                                    src={selectedRiff.image || "/placeholder.svg"}
                                                    alt={selectedRiff.title}
                                                    fill
                                                    className="object-cover z-10"
                                                />

                                                {/* Vinyl record edge peeking out */}
                                                <div className="absolute left-0 top-0 w-2 h-full bg-black z-20"></div>
                                            </motion.div>

                                            {/* Audio player */}
                                            <div className="bg-stone-950/80 rounded-md p-3 border border-orange-900/30">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <motion.button
                                                        onClick={(e) => togglePlay(selectedRiff, e)}
                                                        className="bg-orange-700 p-2 rounded-full"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        {currentAudio?.id === selectedRiff.id && isPlaying ? (
                                                            <Pause size={20} className="text-white" />
                                                        ) : (
                                                            <Play size={20} className="text-white" />
                                                        )}
                                                    </motion.button>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-orange-100">{selectedRiff.title}</h4>
                                                        <p className="text-xs text-orange-200/70">{selectedRiff.artist}</p>
                                                    </div>
                                                </div>

                                                {/* Waveform visualization */}
                                                <div className="h-16 w-full">
                                                    {/* <VerticalLineWaveform
                                                        isPlaying={currentAudio?.id === selectedRiff.id && isPlaying}
                                                        color="orange"
                                                    /> */}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right side - Details and actions */}
                                        <div>
                                            <h3 className="text-xl font-bold text-orange-100 mb-1 font-serif">{selectedRiff.title}</h3>
                                            <Link href={`/profile/${selectedRiff.artistId}`} className="text-orange-400 hover:underline">
                                                {selectedRiff.artist}
                                            </Link>

                                            <div className="flex items-center gap-2 mt-4 mb-6">
                                                <div className="bg-orange-900/30 px-2 py-1 rounded text-xs text-orange-200 border border-orange-800/30">
                                                    {selectedRiff.genre}
                                                </div>
                                                {selectedRiff.mood && (
                                                    <div className="bg-orange-900/30 px-2 py-1 rounded text-xs text-orange-200 border border-orange-800/30">
                                                        {selectedRiff.mood}
                                                    </div>
                                                )}
                                                {selectedRiff.instrument && (
                                                    <div className="bg-orange-900/30 px-2 py-1 rounded text-xs text-orange-200 border border-orange-800/30">
                                                        {selectedRiff.instrument}
                                                    </div>
                                                )}
                                                {selectedRiff.stakable && (
                                                    <div className="bg-violet-500/20 px-2 py-1 rounded text-xs text-violet-300 border border-violet-500/30">
                                                        Stakable
                                                    </div>
                                                )}
                                                {selectedRiff.backstage && (
                                                    <div className="bg-orange-500/20 px-2 py-1 rounded text-xs text-orange-300 border border-orange-500/30">
                                                        Backstage
                                                    </div>
                                                )}
                                                {selectedRiff.unlockable && (
                                                    <div className="bg-emerald-500/20 px-2 py-1 rounded text-xs text-emerald-300 border border-emerald-500/30">
                                                        Unlockable
                                                    </div>
                                                )}
                                            </div>

                                            <div className="bg-stone-950/80 rounded-md p-4 mb-6 border border-orange-900/20">
                                                <h4 className="text-sm font-medium text-orange-100 mb-2 font-serif">Description</h4>
                                                <p className="text-sm text-orange-200/70">
                                                    {selectedRiff.description ||
                                                        `This is a sample description for ${selectedRiff.title} by ${selectedRiff.artist}. In a real app, this would contain details about the riff, its inspiration, and any other relevant information provided by the artist.`}
                                                </p>
                                            </div>

                                            <div className="bg-stone-950/80 rounded-md p-4 mb-6 border border-orange-900/20">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-medium text-orange-100 font-serif">Price</h4>
                                                    <p className="text-lg font-bold text-orange-500">
                                                        {selectedRiff.price} {selectedRiff.currency}
                                                    </p>
                                                </div>

                                                {selectedRiff.stakable && (
                                                    <div className="mt-2 pt-2 border-t border-orange-900/30">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <h4 className="text-xs text-orange-200/70">Staking Rewards</h4>
                                                            <p className="text-xs text-orange-200/70">10% of royalties</p>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-xs text-orange-200/70">Lock Period</h4>
                                                            <p className="text-xs text-orange-200/70">90 days</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action buttons */}
                                            <div className="flex flex-wrap gap-3">
                                                <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button className="w-full bg-orange-700 hover:bg-orange-800 text-white">
                                                        <ShoppingCart size={16} className="mr-2" />
                                                        Buy Now
                                                    </Button>
                                                </motion.div>

                                                {selectedRiff.stakable && (
                                                    <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full border-orange-700/50 text-orange-200 hover:text-orange-100 hover:bg-orange-900/30"
                                                        >
                                                            <Sparkles size={16} className="mr-2" />
                                                            Stake
                                                        </Button>
                                                    </motion.div>
                                                )}

                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-orange-200 hover:text-orange-100 hover:bg-orange-900/30"
                                                    >
                                                        <Heart size={18} />
                                                    </Button>
                                                </motion.div>

                                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-orange-200 hover:text-orange-100 hover:bg-orange-900/30"
                                                    >
                                                        <Share2 size={18} />
                                                    </Button>
                                                </motion.div>
                                            </div>

                                            {/* Connect wallet prompt */}
                                            <div className="mt-6 text-center">
                                                <p className="text-sm text-orange-200/70 mb-2">Connect your wallet to buy or stake this riff</p>
                                                <WalletConnect
                                                    variant="outline"
                                                    className="mx-auto border-orange-700/50 text-orange-200 hover:text-orange-100 hover:bg-orange-900/30"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Now Spinning widget */}
                <AnimatePresence>
                    {showNowPlaying && currentAudio && (
                        <motion.div
                            className="fixed bottom-4 left-4 bg-stone-950/90 backdrop-blur-md rounded-full shadow-lg shadow-black/30 p-2 flex items-center gap-3 z-30 max-w-[200px] sm:max-w-xs border border-orange-900/30"
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -100, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        >
                            <motion.div
                                className="relative h-10 w-10 rounded-full overflow-hidden"
                                animate={{ rotate: isPlaying ? 360 : 0 }}
                                transition={{ duration: 8, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
                            >
                                <Image
                                    src={currentAudio.image || "/riffblock-logo.png"}
                                    alt="Now Spinning"
                                    fill
                                    className="object-cover"
                                />
                            </motion.div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-medium text-orange-100 truncate">Now Spinning</p>
                                <p className="text-xs text-orange-200/70 truncate">
                                    {currentAudio ? `${currentAudio.title} - ${currentAudio.artist}` : "Nothing playing"}
                                </p>
                            </div>
                            <motion.button
                                className="ml-auto text-orange-200/70 hover:text-orange-100 transition-colors"
                                onClick={() => setShowNowPlaying(false)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X size={14} />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </MainLayout>
    )
}

// Album Card Component
interface AlbumCardProps {
    riff: Riff
    isPlaying: boolean
    onPlay: (e: React.MouseEvent) => void
    onClick: () => void
    onFlip: () => void
    isBargain?: boolean
}

function AlbumCard({ riff, isPlaying, onPlay, onClick, onFlip, isBargain = false }: AlbumCardProps) {
    return (
        <motion.div
            className="group relative w-[160px] cursor-pointer"
            onClick={onClick}
            whileHover={{
                y: -5,
                rotateY: 5,
                transition: { type: "spring", stiffness: 300, damping: 10 },
            }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={onFlip}
        >
            {/* Vinyl record card */}
            <div
                className={`relative h-[160px] w-[160px] rounded-md overflow-hidden shadow-lg bg-stone-900 ${isBargain ? "border-2 border-red-500/30" : "border border-orange-900/30"
                    }`}
            >
                {/* Vinyl record behind album art */}
                <div className="absolute inset-0 vinyl-texture rounded-full m-4 z-0"></div>

                {/* Album art */}
                <Image src={riff.image || "/placeholder.svg"} alt={riff.title} fill className="object-cover z-10" />

                {/* Vinyl record edge peeking out */}
                <div className="absolute left-0 top-0 w-1 h-full bg-black z-20"></div>

                {/* Optional vinyl crackle overlay */}
                <div className="absolute inset-0 bg-[url('/vinyl-texture.png')] bg-cover opacity-10 mix-blend-overlay z-20"></div>

                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-70 group-hover:opacity-90 transition-opacity z-30"></div>

                {/* Play button */}
                <motion.button
                    className="absolute top-1/3 left-1/3 bg-orange-700/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-40"
                    onClick={onPlay}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    style={{ transformOrigin: "center" }}
                >
                    {isPlaying ? <Pause size={20} className="text-white" /> : <Play size={20} className="text-white" />}
                </motion.button>

                {/* Badges */}
                <div className="absolute top-2 right-2 flex flex-col gap-1 z-40">
                    {riff.stakable && (
                        <div className="bg-violet-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-sm">Stakable</div>
                    )}
                    {riff.backstage && (
                        <div className="bg-orange-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-sm">Backstage</div>
                    )}
                    {riff.unlockable && (
                        <div className="bg-emerald-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-sm">Unlockable</div>
                    )}
                    {isBargain && (
                        <div className="bg-red-500/80 text-white text-[10px] px-1.5 py-0.5 rounded-sm animate-pulse">Bargain</div>
                    )}
                </div>

                {/* Riff info */}
                <div className="absolute bottom-0 left-0 right-0 p-2 z-40">
                    <h4 className="text-sm font-medium text-orange-100 truncate">{riff.title}</h4>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-orange-200/70 truncate">{riff.artist}</p>
                        <p className="text-xs font-medium text-orange-400">
                            {riff.price} {riff.currency}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
