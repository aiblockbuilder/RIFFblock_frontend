"use client"

import type React from "react"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Twitter, MessageSquare, Send, ExternalLink, ChevronDown } from "lucide-react"
import MainLayout from "@/components/layouts/main-layout"
import SectionTransition from "@/components/section-transition"
import HorizontalRoadmap from "@/components/horizontal-roadmap"
import { useState } from "react"

export default function AboutPage() {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false)
            setIsSubmitted(true)
            setEmail("")
        }, 1500)
    }

    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6 },
        },
    }

    const staggerChildren = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-[#0d0d0d] text-white">
                {/* Hero Section */}
                <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
                    <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                        <motion.div className="text-center space-y-6" initial="hidden" animate="visible" variants={staggerChildren}>
                            <motion.div
                                variants={fadeIn}
                                className="inline-block px-4 py-2 rounded-full bg-violet-500/30 text-violet-300 text-sm font-medium backdrop-blur-md border border-violet-500/20"
                            >
                                Built by musicians. Backed by the blockchain.
                            </motion.div>

                            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl font-bold leading-tight">
                                Empowering Musicians <br className="hidden md:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                                    One Riff at a Time
                                </span>
                            </motion.h1>

                            <motion.p variants={fadeIn} className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto">
                                RIFFblock is revolutionizing how musicians create, share, and monetize their musical ideas through
                                blockchain technology.
                            </motion.p>

                            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600"
                                >
                                    Get Started
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-violet-500/50 text-violet-400 hover:bg-violet-500/10"
                                >
                                    Learn More
                                    <ChevronDown className="ml-2 h-5 w-5" />
                                </Button>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                {/* Origin Story Section */}
                <SectionTransition>
                    <section id="origin" className="py-16 md:py-24 relative">
                        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <h2 className="text-3xl md:text-4xl font-bold">Our Origin Story</h2>
                                    <p className="text-zinc-300">
                                        RIFFblock began in 2018 as a side project among a group of musicians sharing coins and tunes on a
                                        private forum. What started as a simple idea evolved into a vision to create a platform where
                                        musicians could own their ideas and connect directly with fans.
                                    </p>
                                    <p className="text-zinc-400">
                                        After years of development and refinement, RIFFblock has emerged as a revolutionary platform that
                                        bridges the gap between musical creativity and blockchain technology, enabling artists to tokenize
                                        their musical snippets and build a portfolio of digital assets.
                                    </p>
                                </motion.div>

                                <motion.div
                                    className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <Image src="/musicians-studio-collaboration.jpg" alt="Musicians collaborating" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4 text-center">
                                        <span className="text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                            The founding team jamming in 2018
                                        </span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                </SectionTransition>

                {/* Problem/Opportunity Section */}
                <SectionTransition>
                    <section id="problem" className="py-16 md:py-24 bg-zinc-900/30">
                        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">The Problem & The Opportunity</h2>
                                <p className="text-zinc-300 max-w-3xl mx-auto">
                                    Musicians face unique challenges in today's digital landscape, but these challenges present
                                    unprecedented opportunities.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[
                                    {
                                        title: "Unused Ideas",
                                        description:
                                            "Most musical ideas remain confined to phones or DAWs, never seeing the light of day or generating value.",
                                        icon: "/unused-idea.png",
                                        color: "violet",
                                    },
                                    {
                                        title: "Lack of Compensation",
                                        description:
                                            "Musicians seldom get compensated for raw creative work, only for finished products that represent a fraction of their ideas.",
                                        icon: "/lack-money.png",
                                        color: "blue",
                                    },
                                    {
                                        title: "Missed Connections",
                                        description:
                                            "There's a lack of platforms celebrating unfinished musical genius and connecting creators with appreciative audiences.",
                                        icon: "no-connection.png",
                                        color: "indigo",
                                    },
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-violet-500/30 transition-all"
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="relative w-16 h-16 mb-4">
                                                <Image src={item.icon || "/placeholder.svg"} alt={item.title} fill className="object-contain" />
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                            <p className="text-zinc-400">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </SectionTransition>

                {/* Solution Section */}
                <SectionTransition>
                    <section id="solution" className="py-16 md:py-24 relative">
                        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">The RIFFblock Solution</h2>
                                <p className="text-zinc-300 max-w-3xl mx-auto">
                                    We've created a platform that transforms how musicians share and monetize their creative process.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <h3 className="text-2xl font-bold">Key Features</h3>

                                    <div className="space-y-4">
                                        {[
                                            {
                                                title: "Upload Short Riffs",
                                                description:
                                                    "Share musical ideas up to 1 minute long, perfect for capturing those moments of inspiration.",
                                            },
                                            {
                                                title: "Mint as NFTs",
                                                description: "Transform your musical snippets into valuable digital assets on the blockchain.",
                                            },
                                            {
                                                title: "Multiple Revenue Streams",
                                                description: "Earn through direct tips, staking, and resale royalties from your creative work.",
                                            },
                                            {
                                                title: "Early Discovery",
                                                description:
                                                    "Connect with fans and collaborators at the earliest stages of the creative process.",
                                            },
                                        ].map((feature, index) => (
                                            <motion.div
                                                key={index}
                                                className="flex gap-4"
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-violet-400 font-bold">{index + 1}</span>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg">{feature.title}</h4>
                                                    <p className="text-zinc-400">{feature.description}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="relative rounded-xl overflow-hidden"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="aspect-video relative">
                                        <Image
                                            src="/music-nft-platform-interface.png"
                                            alt="RIFFblock platform interface"
                                            fill
                                            className="object-cover rounded-xl"
                                        />
                                    </div>

                                    <div className="mt-6 grid grid-cols-3 gap-4">
                                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-violet-400">1 min</div>
                                            <div className="text-xs text-zinc-500">Max Length</div>
                                        </div>
                                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-violet-400">100B</div>
                                            <div className="text-xs text-zinc-500">RIFF Supply</div>
                                        </div>
                                        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-4 text-center">
                                            <div className="text-2xl font-bold text-violet-400">10%</div>
                                            <div className="text-xs text-zinc-500">Avg Royalty</div>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                </SectionTransition>

                {/* Token Utility Section */}
                <SectionTransition>
                    <section id="token" className="py-16 md:py-24 bg-zinc-900/30">
                        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">RIFF Token Utility</h2>
                                <p className="text-zinc-300 max-w-3xl mx-auto">
                                    The RIFF token powers the entire ecosystem, providing multiple ways to engage with the platform.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    {
                                        title: "Tip Artists",
                                        description:
                                            "Send RIFF tokens directly to artists you appreciate, with no middlemen or platform fees.",
                                        icon: "utility-icon.png",
                                        color: "violet",
                                    },
                                    {
                                        title: "Purchase Riffs",
                                        description:
                                            "Buy and collect riffs as NFTs, building your digital music collection on the blockchain.",
                                        icon: "utility-icon.png",
                                        color: "blue",
                                    },
                                    {
                                        title: "Stake RIFF",
                                        description: "Stake your tokens on favorite artists to earn a share of their future royalties.",
                                        icon: "utility-icon.png",
                                        color: "indigo",
                                    },
                                    {
                                        title: "Backstage Access",
                                        description: "Unlock exclusive content and experiences by supporting artists with RIFF tokens.",
                                        icon: "utility-icon.png",
                                        color: "purple",
                                    },
                                    {
                                        title: "Remix Rights",
                                        description: "Gain permission to remix and build upon original riffs by holding RIFF tokens.",
                                        icon: "utility-icon.png",
                                        color: "pink",
                                    },
                                    {
                                        title: "Governance (Coming Soon)",
                                        description: "Participate in platform decisions and vote on collaborations with your RIFF tokens.",
                                        icon: "utility-icon.png",
                                        color: "cyan",
                                    },
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-violet-500/30 transition-all"
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="relative w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                                <Image
                                                    src={item.icon || "/placeholder.svg"}
                                                    alt={item.title}
                                                    width={24}
                                                    height={24}
                                                    className="object-contain"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                                                <p className="text-zinc-400 text-sm">{item.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </section>
                </SectionTransition>

                {/* Roadmap Section */}
                <SectionTransition>
                    <section id="roadmap" className="py-16 md:py-24 relative">
                        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Roadmap</h2>
                                <p className="text-zinc-300 max-w-3xl mx-auto">
                                    We're building RIFFblock with a clear vision for the future. Here's what we're working on.
                                </p>
                            </div>

                            <HorizontalRoadmap />
                        </div>
                    </section>
                </SectionTransition>

                {/* Join the Movement Section */}
                <SectionTransition>
                    <section id="join" className="py-16 md:py-24 bg-gradient-to-b from-zinc-900/30 to-black">
                        <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Movement</h2>
                                <p className="text-zinc-300 max-w-3xl mx-auto">
                                    Be part of the revolution in music creation and ownership. Connect with us and stay updated.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                                <motion.div
                                    className="space-y-6"
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <h3 className="text-2xl font-bold">Stay Updated</h3>
                                    <p className="text-zinc-300">
                                        Sign up for our newsletter to receive early access invitations, drop alerts, and exclusive content.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div className="flex gap-2">
                                            <Input
                                                type="email"
                                                placeholder="Enter your email"
                                                className="bg-zinc-900/50 border-zinc-800"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={isSubmitting || isSubmitted}
                                            />
                                            <Button
                                                type="submit"
                                                className="bg-violet-600 hover:bg-violet-700"
                                                disabled={isSubmitting || isSubmitted}
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                                                        <span>Submitting...</span>
                                                    </div>
                                                ) : isSubmitted ? (
                                                    <div className="flex items-center gap-2">
                                                        <span>Subscribed!</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span>Subscribe</span>
                                                        <ArrowRight className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-xs text-zinc-500">We respect your privacy. Unsubscribe at any time.</p>
                                    </form>

                                    <div className="pt-4">
                                        <h4 className="text-lg font-medium mb-3">Follow Us</h4>
                                        <div className="flex gap-4">
                                            <Link
                                                href="https://twitter.com/riffblock"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition-colors"
                                            >
                                                <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                                            </Link>
                                            <Link
                                                href="https://discord.gg/riffblock"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition-colors"
                                            >
                                                <MessageSquare className="h-5 w-5 text-[#5865F2]" />
                                            </Link>
                                            <Link
                                                href="https://t.me/riffblock"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition-colors"
                                            >
                                                <Send className="h-5 w-5 text-[#0088cc]" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-bold mb-2">Musician? Want to release your riffs?</h3>
                                        <p className="text-zinc-400 text-sm">
                                            We're onboarding artists for our beta program. Fill out this form to get started.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <Input placeholder="Name or Artist Name" className="bg-zinc-900/50 border-zinc-800" />
                                            <Input placeholder="Email Address" className="bg-zinc-900/50 border-zinc-800" />
                                        </div>
                                        <Input placeholder="Social Media Handles (optional)" className="bg-zinc-900/50 border-zinc-800" />
                                        <textarea
                                            placeholder="Brief description of your music"
                                            className="w-full h-24 px-3 py-2 bg-zinc-900/50 border border-zinc-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-zinc-900 focus:border-violet-500"
                                        />

                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">I need help with:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {["Uploading", "Minting NFTs", "Setting up wallet", "Pricing", "Promotion"].map(
                                                    (item, index) => (
                                                        <div key={index} className="flex items-center">
                                                            <input type="checkbox" id={`help-${index}`} className="mr-2" />
                                                            <label htmlFor={`help-${index}`} className="text-sm">
                                                                {item}
                                                            </label>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>

                                        <Button className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600">
                                            Submit Application
                                        </Button>

                                        <p className="text-xs text-zinc-500 text-center">
                                            We'll review your application and get back to you within 48 hours.
                                        </p>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                </SectionTransition>

                {/* Legal Footer */}
                <section className="py-8 bg-black/50 backdrop-blur-md">
                    <div className="container px-4 md:px-6 max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center">
                            <div className="mb-4 md:mb-0">
                            </div>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-end">
                                <Link href="/privacy" className="text-sm text-zinc-500 hover:text-zinc-300">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms" className="text-sm text-zinc-500 hover:text-zinc-300">
                                    Terms of Use
                                </Link>
                                <Link href="/contact" className="text-sm text-zinc-500 hover:text-zinc-300">
                                    Contact Us
                                </Link>
                                <Link
                                    href="https://polygonscan.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-zinc-500 hover:text-zinc-300"
                                >
                                    Smart Contract
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </MainLayout>
    )
}
