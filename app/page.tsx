import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import MobileMenu from "@/components/mobile-menu"
import AboutSection from "@/components/about-section"
import FlowingBackground from "@/components/flowing-background"
import SectionTransition from "@/components/section-transition"
import FloatingShapes from "@/components/floating-shapes"
import WalletConnect from "@/components/wallet-connect"
import StudioHero from "@/components/studio-hero"

export default function RIFFblockLanding() {
  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/profile", label: "Profile" },
    { href: "/market", label: "Market" },
    { href: "/upload", label: "Upload" },
    { href: "/invest", label: "Invest" },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-hidden">
      {/* Background effects only for non-hero sections */}
      <div className="absolute inset-0 top-[90vh] z-0">
        <FlowingBackground speed={0.5} intensity={1} />
        <FloatingShapes density={0.7} speed={0.5} opacity={0.3} />
      </div>

      {/* Header */}
      <header className="backdrop-blur-md bg-black/10 fixed top-0 left-0 right-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <Image src="/riffblock-logo.png" alt="RIFFblock" width={60} height={60} className="relative z-10" />
            </div>
            <span className="font-bold text-xl tracking-tight">
              RIFF<span className="text-violet-500">BLOCK</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-md font-medium text-zinc-400 hover:text-violet-400 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            {/* Replace static button with WalletConnect component */}
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

      <main className="pt-16 relative z-10">
        {/* New Studio Hero Section */}
        <StudioHero />

        {/* About Section with smooth transition */}
        <SectionTransition intensity="medium">
          <section id="about" className="py-20 relative z-10">
            <div className="container px-4 md:px-6">
              <AboutSection />
            </div>
          </section>
        </SectionTransition>
      </main>

      {/* Simplified Footer */}
      <footer className="py-8 bg-black/30 backdrop-blur-md relative z-10">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Image src="/riffblock-logo.png" alt="RIFFblock" width={48} height={48} />
              <span className="font-bold text-lg tracking-tight">
                RIFF<span className="text-violet-500">BLOCK</span>
              </span>
            </div>
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} RIFFBLOCK. All rights reserved.</p>
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
