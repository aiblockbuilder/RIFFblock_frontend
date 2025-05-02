"use client"

import { useState, useEffect } from "react"
import { useReadContract, useAccount, useChainId } from "wagmi"
import { erc20Abi } from "@/lib/walletConfig"
import { formatUnits } from "viem"

interface TokenBalanceProps {
    tokenAddress: `0x${string}`
    symbol?: string
    decimals?: number
    className?: string
}

export default function TokenBalance({
    tokenAddress,
    symbol,
    decimals: defaultDecimals,
    className = "",
}: TokenBalanceProps) {
    const [isMounted, setIsMounted] = useState(false)
    const [formattedBalance, setFormattedBalance] = useState<string>("0")

    const { address } = useAccount()
    const chainId = useChainId()

    // Read token decimals if not provided
    const { data: tokenDecimals } = useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "decimals",
        enabled: !defaultDecimals && !!address,
    })

    // Read token symbol if not provided
    const { data: tokenSymbol } = useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
        enabled: !symbol && !!address,
    })

    // Read token balance
    const { data: balance, isLoading } = useReadContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        enabled: !!address,
    })

    // Format balance when data is available
    useEffect(() => {
        if (balance) {
            const decimalsToUse = defaultDecimals ?? tokenDecimals ?? 18
            const formatted = formatUnits(balance, decimalsToUse)
            setFormattedBalance(Number(formatted).toFixed(4))
        }
    }, [balance, defaultDecimals, tokenDecimals])

    // Client-side rendering only
    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const displaySymbol = symbol || tokenSymbol || "Tokens"

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {isLoading ? (
                <div className="animate-pulse bg-zinc-800 rounded h-5 w-20"></div>
            ) : (
                <>
                    <span className="font-medium">{formattedBalance}</span>
                    <span className="text-zinc-400">{displaySymbol}</span>
                </>
            )}
        </div>
    )
}
