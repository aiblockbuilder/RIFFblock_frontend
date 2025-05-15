"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, CreditCard, ArrowRight } from "lucide-react"
import Image from "next/image"
import WalletConnect from "@/components/wallet-connect"

export default function BuyWidget() {
  const [amount, setAmount] = useState("1000")
  const [riffAmount, setRiffAmount] = useState("23,809.52")
  const [isWalletConnected, setIsWalletConnected] = useState(false)

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setAmount(value)

    // Calculate RIFF amount (1 RIFF = $0.042)
    const riff = Number.parseFloat(value) / 0.042
    setRiffAmount(isNaN(riff) ? "0" : riff.toLocaleString(undefined, { maximumFractionDigits: 2 }))
  }

  // Mock function to handle purchase with connected wallet
  const handlePurchase = () => {
    // In a real implementation, this would interact with a smart contract
    alert(`Purchase of ${riffAmount} RIFF tokens initiated!`)
  }

  return (
    <div className="bg-zinc-900/50 backdrop-blur-sm rounded-xl border border-zinc-800 p-6 hover:shadow-lg hover:shadow-violet-500/5 transition-all">
      <Tabs defaultValue="crypto" className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger
            value="crypto"
            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Crypto
          </TabsTrigger>
          <TabsTrigger
            value="fiat"
            className="data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Fiat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="crypto" className="space-y-6">
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant="outline"
              className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white flex flex-col items-center p-3 h-auto"
            >
              <Image src="/eth-logo.svg" alt="ETH" width={24} height={24} className="mb-1" />
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
              <Image src="/POL-logo.png" alt="POL" width={24} height={24} className="mb-1" />
              <span className="text-xs">POL</span>
            </Button>
            <Button
              variant="outline"
              className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white flex flex-col items-center p-3 h-auto"
            >
              <Image src="/usdt-logo.png" alt="USDT" width={24} height={24} className="mb-1" />
              <span className="text-xs">USDT</span>
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">You Pay</label>
              <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-violet-500 bg-zinc-900/50">
                <Input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="border-0 bg-transparent text-white text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="px-3 py-2 bg-zinc-800">
                  <span className="text-sm font-medium">USD</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">You Receive</label>
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
              <div className="text-xs text-zinc-500 mt-1">1 RIFF = $0.042 USD</div>
            </div>
          </div>

          <div className="pt-2">
            {/* Replace static button with WalletConnect component */}
            <WalletConnect
              className="w-full"
              onConnected={() => setIsWalletConnected(true)}
              customConnectedButton={
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white"
                >
                  Buy RIFF Tokens
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              }
            />
          </div>
        </TabsContent>

        <TabsContent value="fiat" className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">You Pay</label>
              <div className="flex items-center border border-zinc-800 rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-violet-500 bg-zinc-900/50">
                <Input
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  className="border-0 bg-transparent text-white text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="px-3 py-2 bg-zinc-800">
                  <span className="text-sm font-medium">USD</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">You Receive</label>
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
              <div className="text-xs text-zinc-500 mt-1">1 RIFF = $0.042 USD</div>
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white justify-start"
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Credit Card
                </Button>
                <Button
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white justify-start"
                >
                  <Image src="/paypal-logo.png" alt="PayPal" width={16} height={16} className="mr-2" />
                  PayPal
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button className="w-full bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white">
              Continue to Payment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
