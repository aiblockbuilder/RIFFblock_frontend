"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, CreditCard, ArrowRight, AlertCircle } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import WalletConnect from "@/components/wallet/WalletConnect"
import { useWalletContext } from "@/components/wallet/WalletProvider"

// Payment methods configuration
interface PaymentMethod {
  id: string
  name: string
  icon: string
  networkId: number
  symbol: string
  network: string
}

const CRYPTO_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "eth",
    name: "Ethereum",
    icon: "/images/networks/ethereum.png",
    networkId: 1, // Ethereum Mainnet
    symbol: "ETH",
    network: "Ethereum",
  },
  {
    id: "btc",
    name: "Bitcoin",
    icon: "/btc-logo.png",
    networkId: 0, // Not an EVM chain
    symbol: "BTC",
    network: "Bitcoin",
  },
  {
    id: "matic",
    name: "Polygon",
    icon: "/images/networks/polygon.png",
    networkId: 137, // Polygon
    symbol: "MATIC",
    network: "Polygon",
  },
  {
    id: "usdt",
    name: "Tether",
    icon: "/usdt-logo.png",
    networkId: 1, // We'll use Ethereum for USDT by default
    symbol: "USDT",
    network: "tron", // This indicates it's on Tron network
  },
]

export default function BuyWidget() {
  const [amount, setAmount] = useState("1000")
  const [riffAmount, setRiffAmount] = useState("23,809.52")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(CRYPTO_PAYMENT_METHODS[2]) // Default to MATIC
  const [isWrongNetwork, setIsWrongNetwork] = useState(false)

  // Use our wallet context
  const { chainId, isConnected, switchNetwork } = useWalletContext()

  // Update network status when chainId changes
  useEffect(() => {
    if (chainId && isConnected) {
      // Check if on wrong network for the selected payment method
      setIsWrongNetwork(selectedPaymentMethod.networkId !== 0 && chainId !== selectedPaymentMethod.networkId)
    }
  }, [chainId, selectedPaymentMethod.networkId, isConnected])

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "")
    setAmount(value)

    // Calculate RIFF amount (1 RIFF = $0.042)
    // Apply different conversion rates based on the selected payment method
    let conversionRate = 0.042 // Default USD rate

    if (selectedPaymentMethod.id === "eth") {
      // Example: 1 ETH = $2000, so 1 RIFF = 0.000021 ETH
      conversionRate = 0.000021
    } else if (selectedPaymentMethod.id === "btc") {
      // Example: 1 BTC = $40000, so 1 RIFF = 0.00000105 BTC
      conversionRate = 0.00000105
    } else if (selectedPaymentMethod.id === "matic") {
      // Example: 1 MATIC = $0.80, so 1 RIFF = 0.0525 MATIC
      conversionRate = 0.0525
    } else if (selectedPaymentMethod.id === "usdt") {
      // 1:1 with USD
      conversionRate = 0.042
    }

    const riff = Number.parseFloat(value) / conversionRate
    setRiffAmount(isNaN(riff) ? "0" : riff.toLocaleString(undefined, { maximumFractionDigits: 2 }))
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method)

    // Check if this is a non-EVM network that MetaMask doesn't support
    if (method.id === "btc" || (method.id === "usdt" && method.network === "tron")) {
      // Show WalletConnect suggestion for non-EVM networks
      toast({
        title: `${method.name} Selected`,
        description: `Use WalletConnect to connect to ${method.network} network.`,
        action: (
          <Button variant="outline" size="sm" className="border-violet-500/50 text-violet-500 hover:bg-violet-500/10">
            Connect
          </Button>
        ),
      })
      return
    }

    // For EVM networks, check if we need to switch networks
    if (isConnected && chainId !== method.networkId && method.networkId !== 0) {
      switchNetwork(method.networkId)
    }
  }

  // Handle purchase with connected wallet
  const handlePurchase = () => {
    if (!isConnected) {
      return
    }

    if (isWrongNetwork) {
      toast({
        title: "Wrong Network",
        description: `Please switch to the correct network for ${selectedPaymentMethod.name}`,
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would interact with a smart contract
    toast({
      title: "Purchase Initiated",
      description: `Purchase of ${riffAmount} RIFF tokens initiated!`,
    })
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
            {CRYPTO_PAYMENT_METHODS.map((method) => (
              <Button
                key={method.id}
                variant="outline"
                className={`border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:text-white flex flex-col items-center p-3 h-auto ${
                  selectedPaymentMethod.id === method.id ? "border-violet-500 bg-violet-500/10" : ""
                }`}
                onClick={() => handlePaymentMethodSelect(method)}
              >
                <Image
                  src={method.icon || "/placeholder.svg"}
                  alt={method.name}
                  width={24}
                  height={24}
                  className="mb-1"
                />
                <span className="text-xs">{method.symbol}</span>
              </Button>
            ))}
          </div>

          {isWrongNetwork && isConnected && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="text-sm text-amber-200">
                <p>Wrong network for {selectedPaymentMethod.name}.</p>
                <Button
                  variant="link"
                  className="h-auto p-0 text-amber-400"
                  onClick={() => switchNetwork(selectedPaymentMethod.networkId)}
                >
                  Switch network
                </Button>
              </div>
            </div>
          )}

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
                  <span className="text-sm font-medium">{selectedPaymentMethod.symbol}</span>
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
              <div className="text-xs text-zinc-500 mt-1">
                1 RIFF ={" "}
                {selectedPaymentMethod.id === "eth"
                  ? "0.000021 ETH"
                  : selectedPaymentMethod.id === "btc"
                    ? "0.00000105 BTC"
                    : selectedPaymentMethod.id === "matic"
                      ? "0.0525 MATIC"
                      : "$0.042 USD"}
              </div>
            </div>
          </div>

          <div className="pt-2">
            {isConnected ? (
              <Button
                onClick={handlePurchase}
                className={`w-full ${
                  isWrongNetwork
                    ? "bg-zinc-700 hover:bg-zinc-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600"
                } text-white`}
                disabled={isWrongNetwork}
              >
                {isWrongNetwork ? (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Switch Network First
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Buy RIFF Tokens
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            ) : (
              <WalletConnect className="w-full" />
            )}
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
