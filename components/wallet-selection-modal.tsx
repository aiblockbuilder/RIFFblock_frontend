"use client"

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface WalletSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectWallet: (walletType: "metamask" | "walletconnect") => void
}

export default function WalletSelectionModal({ isOpen, onClose, onSelectWallet }: WalletSelectionModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const handleWalletSelect = async (walletType: "metamask" | "walletconnect") => {
    setIsConnecting(walletType)

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onSelectWallet(walletType)
    setIsConnecting(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">Connect Wallet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            className="flex items-center justify-between p-6 h-auto border-zinc-700 hover:border-violet-500 hover:bg-zinc-800"
            onClick={() => handleWalletSelect("metamask")}
            disabled={!!isConnecting}
          >
            <div className="flex items-center gap-3">
              <Image src="/images/metamask-logo.png" alt="MetaMask" width={32} height={32} className="rounded-md" />
              <div className="text-left">
                <div className="font-semibold">MetaMask</div>
                <div className="text-xs text-zinc-400">Connect using browser extension</div>
              </div>
            </div>
            {isConnecting === "metamask" && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-violet-500"></div>
            )}
          </Button>

          <Button
            variant="outline"
            className="flex items-center justify-between p-6 h-auto border-zinc-700 hover:border-violet-500 hover:bg-zinc-800"
            onClick={() => handleWalletSelect("walletconnect")}
            disabled={!!isConnecting}
          >
            <div className="flex items-center gap-3">
              <Image
                src="/images/walletconnect-logo.png"
                alt="WalletConnect"
                width={32}
                height={32}
                className="rounded-md"
              />
              <div className="text-left">
                <div className="font-semibold">WalletConnect</div>
                <div className="text-xs text-zinc-400">Connect using mobile wallet</div>
              </div>
            </div>
            {isConnecting === "walletconnect" && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent border-violet-500"></div>
            )}
          </Button>
        </div>
        <div className="text-center text-xs text-zinc-500 mt-2">
          By connecting your wallet, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  )
}
