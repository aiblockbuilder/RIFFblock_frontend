import { http, createConfig } from "wagmi"
import { mainnet, polygon, arbitrum, optimism } from "wagmi/chains"
import { injected, metaMask, walletConnect, coinbaseWallet } from "wagmi/connectors"
import { createWeb3Modal } from "@web3modal/wagmi/react"

// Replace with your actual WalletConnect Project ID
export const projectId = "c4f79cc821944d9680842e34466bfbd2"

// Create wagmi config
export const config = createConfig({
    chains: [mainnet, polygon, arbitrum, optimism],
    connectors: [injected(), metaMask(), walletConnect({ projectId }), coinbaseWallet({ appName: "RIFFblock" })],
    transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [arbitrum.id]: http(),
        [optimism.id]: http(),
    },
})

// Register the config for TypeScript using declaration merging
// This enables strong type-safety across React Context
declare module "wagmi" {
    interface Register {
        config: typeof config
    }
}

// Create web3modal
createWeb3Modal({
    wagmiConfig: config,
    projectId,
    themeMode: "dark",
    themeVariables: {
        "--w3m-accent-color": "#8b5cf6", // violet-500
        "--w3m-background-color": "#8b5cf6",
        "--w3m-z-index": "100",
    },
})

// Network information for UI display
export interface NetworkInfo {
    chainId: number
    name: string
    currency: string
    symbol: string
    decimals: number
    blockExplorer: string
    icon?: string
    isTestnet?: boolean
}

// Supported networks
export const SUPPORTED_NETWORKS: Record<number, NetworkInfo> = {
    // Ethereum Mainnet
    1: {
        chainId: 1,
        name: "Ethereum",
        currency: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        blockExplorer: "https://etherscan.io",
        icon: "/images/networks/ethereum.png",
    },
    // Polygon Mainnet
    137: {
        chainId: 137,
        name: "Polygon",
        currency: "Polygon",
        symbol: "MATIC",
        decimals: 18,
        blockExplorer: "https://polygonscan.com",
        icon: "/images/networks/polygon.png",
    },
    // Arbitrum
    42161: {
        chainId: 42161,
        name: "Arbitrum",
        currency: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        blockExplorer: "https://arbiscan.io",
        icon: "/images/networks/arbitrum.png",
    },
    // Optimism
    10: {
        chainId: 10,
        name: "Optimism",
        currency: "Ethereum",
        symbol: "ETH",
        decimals: 18,
        blockExplorer: "https://optimistic.etherscan.io",
        icon: "/images/networks/optimism.png",
    },
}

// Helper functions
export function formatAddress(address: string | undefined): string {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export function getNetworkInfo(chainId: number | undefined): NetworkInfo {
    if (!chainId || !SUPPORTED_NETWORKS[chainId]) {
        return SUPPORTED_NETWORKS[137] // Default to Polygon
    }
    return SUPPORTED_NETWORKS[chainId]
}

// Example ERC20 ABI with const assertion for type safety
export const erc20Abi = [
    {
        inputs: [{ name: "owner", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "decimals",
        outputs: [{ name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "name",
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "symbol",
        outputs: [{ name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "totalSupply",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
    },
] as const // Important: const assertion for type inference
