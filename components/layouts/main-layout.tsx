"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import MobileMenu from "@/components/mobile-menu"
import WalletConnect from "@/components/wallet-connect"
import FlowingBackground from "@/components/flowing-background"
import FloatingShapes from "@/components/floating-shapes"

interface MainLayoutProps {
    children: React.ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()

    // Handle scroll event to change header appearance
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
        { href: "/profile", label: "Profile" },
        { href: "/market", label: "Market" },
        { href: "/upload", label: "Upload" },
        { href: "/invest", label: "Invest" },
    ]

    return (
        <div className="min-h-screen bg-[#0d0d0d] text-white overflow-hidden">
            {/* Background effects */}
            <div className="fixed inset-0 z-0">
                <FlowingBackground speed={0.5} intensity={1} />
                <FloatingShapes density={0.7} speed={0.5} opacity={0.3} />
            </div>

            {/* Header */}
            <header
                className={`backdrop-blur-md fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/50 shadow-lg shadow-black/20" : "bg-black/10"
                    }`}
            >
                <div className="container flex items-center justify-between h-16 px-4 md:px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative">
                            <Image src="/riffblock-logo.png" alt="RIFFblock" width={48} height={48} className="relative z-10" />
                            <div className="absolute inset-0 bg-violet-500/30 blur-xl rounded-full -z-0"></div>
                        </div>
                        <span className="font-bold text-2xl tracking-tight">
                            RIFF<span className="text-violet-400">BLOCK</span>
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium text-zinc-400 hover:text-violet-400 transition-colors ${pathname === link.href ? "text-violet-400" : ""
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:block">
                            <WalletConnect variant="outline" />
                        </div>
                        <Button className="hidden sm:flex bg-gradient-to-r from-violet-600/90 to-blue-500/90 hover:from-violet-700/90 hover:to-blue-600/90 backdrop-blur-md">
                            Buy RIFF
                        </Button>
                        <MobileMenu links={navLinks} />
                    </div>
                </div>
            </header>

            {/* Main content with padding for header */}
            <div className="pt-16 relative z-10">{children}</div>

            {/* Footer */}
            <footer className="py-8 bg-black/30 backdrop-blur-md relative z-10">
                <div className="container px-4 md:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="flex items-center gap-3 mb-4 md:mb-0">
                            <div className="relative">
                                <Image src="/riffblock-logo.png" alt="RIFFblock" width={32} height={32} className="relative z-10" />
                                <div className="absolute inset-0 bg-violet-500/20 blur-lg rounded-full -z-0"></div>
                            </div>
                            <span className="font-bold text-lg tracking-tight">
                                RIFF<span className="text-violet-400">BLOCK</span>
                            </span>
                        </div>
                        <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} RIFFblock. All rights reserved.</p>
                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                                <Image src="/polygon-logo.png" alt="Polygon" width={16} height={16} />
                                <span className="text-xs text-zinc-400">Built on Polygon</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
