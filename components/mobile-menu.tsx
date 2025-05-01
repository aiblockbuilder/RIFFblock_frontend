"use client"

import { useState } from "react"
import Link from "next/link"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, X, Disc } from "lucide-react"
import WalletConnect from "@/components/wallet/WalletConnect"
import NetworkSwitcher from "@/components/wallet/NetworkSwitcher"

interface MobileMenuProps {
  links: {
    href: string
    label: string
  }[]
}

export default function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-80 bg-zinc-900 border-zinc-800 p-0">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Disc className="h-6 w-6 text-violet-500" />
              <span className="font-bold text-lg tracking-tight">
                RIFF<span className="text-violet-500">block</span>
              </span>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <nav className="flex-1 overflow-auto py-6 px-4">
            <ul className="space-y-6">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-lg font-medium text-zinc-200 hover:text-violet-400 transition-colors block py-2"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 space-y-4">
              {/* Add Network Switcher to mobile menu */}
              <NetworkSwitcher className="w-full" />
              {/* Add WalletConnect to mobile menu */}
              <WalletConnect className="w-full" />
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600"
                onClick={() => setOpen(false)}
              >
                Buy RIFF
              </Button>
            </div>
          </nav>
          <div className="p-4 border-t border-zinc-800">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-500">© {new Date().getFullYear()} RIFFblock</span>
              <div className="flex items-center gap-2 bg-zinc-900 px-2 py-1 rounded-full border border-zinc-800">
                <span className="text-xs text-zinc-400">Built on Polygon</span>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
