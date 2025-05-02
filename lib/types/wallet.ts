// Clean up wallet types by removing unused types and simplifying the structure
// Wallet connection types
export type WalletType = "metamask" | "walletconnect" | null

// Network types
export interface NetworkInfo {
  chainId: number
  name: string
  currency: string
  symbol: string
  decimals: number
  rpcUrl: string
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
    rpcUrl: "https://ethereum.publicnode.com",
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
    rpcUrl: "https://polygon-rpc.com",
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
    rpcUrl: "https://arb1.arbitrum.io/rpc",
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
    rpcUrl: "https://mainnet.optimism.io",
    blockExplorer: "https://optimistic.etherscan.io",
    icon: "/images/networks/optimism.png",
  },
}
