import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Disc, ExternalLink, Music, Wallet, Zap, Twitter, MessageCircle, Send } from "lucide-react"
import TokenomicsChart from "@/components/tokenomics-chart"
import BuyWidget from "@/components/buy-widget"
import HorizontalRoadmap from "@/components/horizontal-roadmap"
import MobileMenu from "@/components/mobile-menu"
import AboutSection from "@/components/about-section"
import FlowingBackground from "@/components/flowing-background"
import SectionTransition from "@/components/section-transition"
import FloatingShapes from "@/components/floating-shapes"
import WaveAnimation from "@/components/wave-animation"
import WalletConnect from "@/components/wallet-connect"

export default function RIFFblockLanding() {
  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#token", label: "Token" },
    { href: "#buy", label: "Buy" },
    { href: "#roadmap", label: "Roadmap" },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-hidden">
      {/* Unified flowing background */}
      <FlowingBackground speed={0.5} intensity={1} />

      {/* Subtle floating shapes for depth */}
      <FloatingShapes density={0.7} speed={0.5} opacity={0.3} />

      {/* Header */}
      <header className="backdrop-blur-md bg-black/10 fixed top-0 left-0 right-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Disc className="h-8 w-8 text-violet-500" />
            <span className="font-bold text-xl tracking-tight">
              RIFF<span className="text-violet-500">block</span>
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
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

      <main className="pt-16">
        {/* Hero Section with Image Background */}
        <section className="relative overflow-hidden py-20 md:py-32 min-h-[80vh] flex items-center">
          {/* Image Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-background.jpg"
              alt="RIFFblock background"
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 backdrop-blur-sm"></div>
          </div>

          <div className="container relative z-10 px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="inline-block px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium mb-4 backdrop-blur-md">
                ICO LIVE NOW • 30% BONUS ENDS IN 3 DAYS
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-blue-400 to-violet-400 leading-tight">
                Own the Future
                <br />
                of Music
              </h1>
              <p className="text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto backdrop-blur-sm bg-black/10 rounded-lg p-2">
                RIFFblock is revolutionizing how artists create, distribute, and monetize music through blockchain
                technology. Join the movement.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-600/90 to-blue-500/90 hover:from-violet-700/90 hover:to-blue-600/90 text-lg shadow-lg shadow-violet-500/20 backdrop-blur-md"
                >
                  Buy RIFF Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                {/* Add WalletConnect button in hero section */}
                <WalletConnect size="lg" className="text-lg" />
              </div>
              <div className="pt-8 flex flex-wrap items-center justify-center gap-8">
                <div className="flex flex-col items-center backdrop-blur-md bg-black/20 px-6 py-3 rounded-lg">
                  <span className="text-3xl font-bold text-white">$2.4M</span>
                  <span className="text-sm text-zinc-400">Raised</span>
                </div>
                <div className="hidden sm:block h-10 border-r border-zinc-800/30"></div>
                <div className="flex flex-col items-center backdrop-blur-md bg-black/20 px-6 py-3 rounded-lg">
                  <span className="text-3xl font-bold text-white">4,200+</span>
                  <span className="text-sm text-zinc-400">Contributors</span>
                </div>
                <div className="hidden sm:block h-10 border-r border-zinc-800/30"></div>
                <div className="flex flex-col items-center backdrop-blur-md bg-black/20 px-6 py-3 rounded-lg">
                  <span className="text-3xl font-bold text-white">68%</span>
                  <span className="text-sm text-zinc-400">Sold</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section with smooth transition */}
        <SectionTransition intensity="medium">
          <section id="about" className="py-20">
            <div className="container px-4 md:px-6">
              <AboutSection />
            </div>
          </section>
        </SectionTransition>

        {/* Buy Section with smooth transition */}
        <SectionTransition intensity="subtle">
          <section id="buy" className="py-20 relative overflow-hidden">
            <div className="container relative z-10 px-4 md:px-6">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-blue-300">
                  Buy RIFF Now
                </h2>
                <p className="text-zinc-400">
                  Join the RIFFblock ecosystem today. Purchase RIFF tokens at the current price of $0.042 per token.
                </p>
              </div>
              <div className="max-w-xl mx-auto backdrop-blur-md">
                <BuyWidget />
              </div>
            </div>
          </section>
        </SectionTransition>

        {/* Token Utility Section with smooth transition */}
        <SectionTransition intensity="medium">
          <section id="token" className="py-20">
            <div className="container px-4 md:px-6">
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-blue-300">
                  RIFF Token Utility
                </h2>
                <p className="text-zinc-400">
                  The RIFF token powers the entire ecosystem with a total supply of 100 billion tokens, providing
                  multiple benefits to holders and creating a sustainable economy.
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="space-y-6">
                  <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl hover:bg-black/30 transition-all hover:shadow-lg hover:shadow-violet-500/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-violet-500/20 rounded-full flex items-center justify-center shrink-0">
                        <Music className="h-5 w-5 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">Buy Music NFTs</h3>
                        <p className="text-zinc-400">
                          Use RIFF tokens to purchase exclusive music NFTs from your favorite artists.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl hover:bg-black/30 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                        <Zap className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">Artist Tipping</h3>
                        <p className="text-zinc-400">
                          Support your favorite artists directly by tipping them with RIFF tokens.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl hover:bg-black/30 transition-all hover:shadow-lg hover:shadow-indigo-500/10">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
                        <Wallet className="h-5 w-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1">Staking Rewards</h3>
                        <p className="text-zinc-400">
                          Stake your RIFF tokens to earn passive income and exclusive platform benefits.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center backdrop-blur-sm bg-black/20 p-6 rounded-xl">
                  <TokenomicsChart />
                </div>
              </div>
            </div>
          </section>
        </SectionTransition>

        {/* Roadmap Section with smooth transition */}
        <SectionTransition intensity="subtle">
          <section id="roadmap" className="py-20 relative overflow-hidden">
            <div className="container relative z-10 px-4 md:px-6">
              <div className="max-w-5xl mx-auto">
                <HorizontalRoadmap />
              </div>
            </div>
          </section>
        </SectionTransition>

        {/* Join Section with smooth transition */}
        <SectionTransition intensity="medium">
          <section className="py-20 relative overflow-hidden">
            {/* Restore the original wave animation background */}
            <div className="absolute inset-0 z-0 w-full h-full">
              <WaveAnimation type="particles" speed={0.3} intensity={0.6} />
            </div>
            <div className="container px-4 md:px-6 relative z-10">
              <div className="max-w-3xl mx-auto text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-blue-300">
                  Join the Movement
                </h2>
                <p className="text-zinc-400">
                  Stay updated with the latest news, token sales, and platform developments.
                </p>
              </div>
              <div className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-2 mb-8">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="bg-black/30 border-zinc-800/50 focus:border-violet-500 text-white backdrop-blur-md"
                  />
                  <Button className="bg-gradient-to-r from-violet-600/90 to-blue-500/90 hover:from-violet-700/90 hover:to-blue-600/90 mt-2 sm:mt-0 backdrop-blur-md">
                    Subscribe
                  </Button>
                </div>
                <div className="flex justify-center gap-6">
                  <Link
                    href="#"
                    className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-zinc-800/30 hover:border-blue-500/50 transition-all hover:bg-blue-500/10"
                  >
                    <Twitter className="h-5 w-5 text-blue-400" />
                  </Link>
                  <Link
                    href="#"
                    className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-zinc-800/30 hover:border-violet-500/50 transition-all hover:bg-violet-500/10"
                  >
                    <MessageCircle className="h-5 w-5 text-violet-400" />
                  </Link>
                  <Link
                    href="#"
                    className="w-12 h-12 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-zinc-800/30 hover:border-indigo-500/50 transition-all hover:bg-indigo-500/10"
                  >
                    <Send className="h-5 w-5 text-indigo-400" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </SectionTransition>
      </main>

      {/* Footer */}
      <footer className="py-12 bg-black/30 backdrop-blur-md">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <Disc className="h-6 w-6 text-violet-500" />
                <span className="font-bold text-lg tracking-tight">
                  RIFF<span className="text-violet-500">block</span>
                </span>
              </Link>
              <p className="text-zinc-400 text-sm">Revolutionizing the music industry through blockchain technology.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Token
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Whitepaper
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Telegram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Medium
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} RIFFblock. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Smart Contract
              </Link>
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
