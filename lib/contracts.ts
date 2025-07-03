// Add ethereum to window type
declare global {
    interface Window {
        ethereum?: any
    }
}

// Import ethers
import { ethers } from 'ethers'

// Import contract ABIs from JSON files
import RIFF_NFT_ABI from './RIFF_NFT_ABI.json'
import RIFF_STAKING_ABI from './RIFF_STAKING_ABI.json'

// Network configuration for Amoy testnet
const AMOY_TESTNET = {
    chainId: "0x13882", // 80002 in hex (Amoy testnet)
    chainName: "Polygon Amoy Testnet",
    nativeCurrency: {
        name: "MATIC",
        symbol: "MATIC",
        decimals: 18,
    },
    rpcUrls: [
        "https://rpc.ankr.com/polygon_amoy/033a2a445ed7489e3e3e7422d6cb3453d837f990f20b00e5a733fa5dd8412412",
        "https://rpc.ankr.com/polygon_amoy",
        "https://polygon-amoy-bor.publicnode.com"
    ],
    blockExplorerUrls: ["https://www.oklink.com/amoy"],
}

// Contract addresses - replace with your deployed contract addresses
const CONTRACT_ADDRESSES = {
    RIFF_NFT: process.env.NEXT_PUBLIC_RIFF_NFT_ADDRESS || "",
    RIFF_STAKING: process.env.NEXT_PUBLIC_RIFF_STAKING_ADDRESS || "",
    RIFF_TOKEN: process.env.NEXT_PUBLIC_RIFF_TOKEN_ADDRESS || ""
}

export class ContractService {
    private provider: ethers.BrowserProvider | null = null
    private signer: ethers.JsonRpcSigner | null = null

    constructor() {
        this.initializeProvider()
    }

    private async initializeProvider() {
        if (typeof window !== 'undefined' && window.ethereum) {
            try {
                this.provider = new ethers.BrowserProvider(window.ethereum)
                this.signer = await this.provider.getSigner()
                
                // Check if we're on the correct network
                await this.ensureCorrectNetwork()
            } catch (error) {
                console.error("Failed to initialize provider:", error)
            }
        }
    }

    /**
     * Ensure the user is connected to the correct network (Amoy testnet)
     */
    async ensureCorrectNetwork(): Promise<boolean> {
        if (!this.provider) {
            throw new Error("Provider not initialized")
        }

        try {
            const network = await this.provider.getNetwork()
            console.log("Current network:", network.name, "Chain ID:", network.chainId.toString())

            // Check if we're on Amoy testnet (chainId: 80002)
            if (network.chainId === BigInt(80002)) {
                console.log("Already on Amoy testnet")
                return true
            }

            console.log("Switching to Amoy testnet...")
            
            // Request network switch
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: AMOY_TESTNET.chainId }],
            })

            console.log("Successfully switched to Amoy testnet")
            return true
        } catch (switchError: any) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
                try {
                    // Try adding the network with the first RPC URL
                    const networkConfig = {
                        ...AMOY_TESTNET,
                        rpcUrls: [AMOY_TESTNET.rpcUrls[0]] // Use only the first RPC URL
                    }
                    
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [networkConfig],
                    })
                    console.log("Amoy testnet added to MetaMask")
                    return true
                } catch (addError) {
                    console.error("Failed to add Amoy testnet:", addError)
                    throw new Error("Please add Amoy testnet to your wallet manually")
                }
            } else {
                console.error("Failed to switch network:", switchError)
                throw new Error("Please switch to Amoy testnet in your wallet")
            }
        }
    }

    private async getSigner() {
        if (!this.signer) {
            await this.initializeProvider()
        }
        return this.signer
    }

    /**
     * Validate that the contract exists and is accessible
     * @returns Promise with validation result
     */
    async validateContract(): Promise<{ valid: boolean; message: string }> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                return { valid: false, message: "No signer available. Please connect your wallet." }
            }

            console.log("Validating contract at address:", CONTRACT_ADDRESSES.RIFF_NFT)

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
            
            // Try to get the contract code to check if it exists
            const code = await signer.provider?.getCode(CONTRACT_ADDRESSES.RIFF_NFT)
            if (code === "0x") {
                return { 
                    valid: false, 
                    message: `No contract found at address ${CONTRACT_ADDRESSES.RIFF_NFT}. Please check the contract address.` 
                }
            }

            console.log("Contract code found:", code.substring(0, 66) + "...")

            // Try to call name() to validate the ABI (this is a standard ERC721 function)
            try {
                const name = await contract.name()
                console.log("Contract validation successful. Contract name:", name)
                return { valid: true, message: "Contract is valid and accessible" }
            } catch (error: any) {
                console.error("Contract ABI validation failed:", error)
                return { 
                    valid: false, 
                    message: `Contract exists but ABI doesn't match. Error: ${error.message}` 
                }
            }
        } catch (error: any) {
            console.error("Contract validation error:", error)
            return { valid: false, message: `Validation failed: ${error.message}` }
        }
    }

    /**
     * Mint a new RIFF NFT
     * @param toAddress Address to mint the NFT to (optional, defaults to signer address)
     * @returns Promise with token ID and contract address
     */
    async mintRiffNFT(toAddress?: string): Promise<{ tokenId: string; contractAddress: string }> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            // Ensure we're on the correct network
            await this.ensureCorrectNetwork()

            // Test RPC health before proceeding
            console.log("Testing RPC connection health...")
            const rpcHealth = await this.testRpcHealth()
            if (!rpcHealth.healthy) {
                throw new Error(`RPC connection is unhealthy: ${rpcHealth.error}. Please try switching networks or try again later.`)
            }
            console.log("RPC health check passed. Latency:", rpcHealth.latency + "ms")

            // Use provided address or default to signer address
            const mintToAddress = toAddress || await signer.getAddress()
            
            console.log("Minting NFT to address:", mintToAddress)
            console.log("Using contract address:", CONTRACT_ADDRESSES.RIFF_NFT)

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
            
            // Validate contract before proceeding
            const validation = await this.validateContract()
            if (!validation.valid) {
                throw new Error(validation.message)
            }

            // Estimate gas first
            console.log("Estimating gas for mint transaction...")
            const gasEstimate = await contract.mint.estimateGas(mintToAddress)
            console.log("Estimated gas:", gasEstimate.toString())
            
            // Add 20% buffer to gas estimate
            const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100)
            console.log("Gas limit with buffer:", gasLimit.toString())
            
            // Mint the NFT and get the token ID from the transaction
            console.log("Calling mint function...")
            const tx = await contract.mint(mintToAddress, {
                gasLimit: gasLimit
            })
            console.log("Mint transaction sent, hash:", tx.hash)
            
            // Wait for transaction confirmation
            console.log("Waiting for transaction confirmation...")
            const receipt = await tx.wait()
            console.log("Transaction confirmed:", receipt.hash)

            // Extract token ID from the transaction receipt
            // The mint function returns the token ID, so we need to get it from the transaction result
            let mintedTokenId: string = "0"
            
            // Try to get the token ID from the transaction logs
            if (receipt.logs && receipt.logs.length > 0) {
                // Look for the Transfer event which contains the token ID
                // The Transfer event signature is: Transfer(address,address,uint256)
                const transferEventSignature = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                
                for (const log of receipt.logs) {
                    if (log.topics[0] === transferEventSignature) {
                        // The token ID is in the third topic (index 3)
                        if (log.topics[3]) {
                            mintedTokenId = BigInt(log.topics[3]).toString()
                            break
                        }
                    }
                }
            }

            // If we couldn't extract from logs, try a different approach
            if (mintedTokenId === "0") {
                try {
                    // Get the total supply to determine the latest token ID
                    // Since the contract increments _tokenIds before minting, the new token ID is totalSupply - 1
                    const totalSupply = await contract.totalSupply()
                    mintedTokenId = (totalSupply - BigInt(1)).toString()
                } catch (error) {
                    console.warn("Could not get token ID from contract, using fallback method")
                    // Fallback: use a timestamp-based ID
                    mintedTokenId = Math.floor(Date.now() / 1000).toString()
                }
            }

            console.log("Minted token ID:", mintedTokenId)

            return {
                tokenId: mintedTokenId.toString(),
                contractAddress: CONTRACT_ADDRESSES.RIFF_NFT
            }
                } catch (error: any) {
            console.error("Error minting NFT:", error)
            
            // Provide more specific error messages
            if (error.message.includes("could not decode result data")) {
                throw new Error("Contract ABI mismatch or contract not deployed. Please check the contract address and ABI.")
            } else if (error.message.includes("insufficient funds")) {
                throw new Error("Insufficient funds for gas fees. Please add more tokens to your wallet.")
            } else if (error.message.includes("user rejected")) {
                throw new Error("Transaction was rejected by user.")
            } else if (error.message.includes("nonce too low")) {
                throw new Error("Transaction nonce error. Please try again.")
            } else if (error.message.includes("Internal JSON-RPC error") || error.message.includes("-32603")) {
                throw new Error("RPC provider error. Please try switching networks or try again later. If the problem persists, check your internet connection.")
            } else if (error.message.includes("gas")) {
                throw new Error("Gas estimation failed. Please try again or check your wallet balance.")
            } else {
                throw new Error(error.message || "Failed to mint NFT")
            }
        }
    }

    /**
     * Stake RIFF tokens on an NFT
     * @param tokenId The NFT token ID
     * @param amount Amount of RIFF tokens to stake (in wei)
     */
    async stakeOnRiff(tokenId: string, amount: string) {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_STAKING, RIFF_STAKING_ABI, signer)
            
            const tx = await contract.stakeOnRiff(tokenId, amount)
            const receipt = await tx.wait()
            
            return receipt
        } catch (error: any) {
            console.error("Error staking on riff:", error)
            throw new Error(error.message || "Failed to stake on riff")
        }
    }

    /**
     * Unstake RIFF tokens from an NFT
     * @param tokenId The NFT token ID
     */
    async unstakeFromRiff(tokenId: string) {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_STAKING, RIFF_STAKING_ABI, signer)
            
            const tx = await contract.unstakeFromRiff(tokenId)
            const receipt = await tx.wait()
            
            return receipt
        } catch (error: any) {
            console.error("Error unstaking from riff:", error)
            throw new Error(error.message || "Failed to unstake from riff")
        }
    }

    /**
     * Claim rewards from staking
     * @param tokenId The NFT token ID
     */
    async claimRewards(tokenId: string) {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_STAKING, RIFF_STAKING_ABI, signer)
            
            const tx = await contract.claimRewards(tokenId)
            const receipt = await tx.wait()
            
            return receipt
        } catch (error: any) {
            console.error("Error claiming rewards:", error)
            throw new Error(error.message || "Failed to claim rewards")
        }
    }

    /**
     * Get staking information for a user on a specific NFT
     * @param tokenId The NFT token ID
     * @param userAddress The user's wallet address
     */
    async getStakeInfo(tokenId: string, userAddress: string) {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_STAKING, RIFF_STAKING_ABI, signer)
            
            const [amount, stakeTime, unlockTime] = await contract.getStake(tokenId, userAddress)
            const earned = await contract.earned(tokenId, userAddress)
            
            return {
                amount: amount.toString(),
                stakeTime: stakeTime.toString(),
                unlockTime: unlockTime.toString(),
                earned: earned.toString()
            }
        } catch (error: any) {
            console.error("Error getting stake info:", error)
            throw new Error(error.message || "Failed to get stake info")
        }
    }

    /**
     * Get the current user's wallet address
     */
    async getCurrentAddress(): Promise<string | null> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                return null
            }
            return await signer.getAddress()
        } catch (error) {
            console.error("Error getting current address:", error)
            return null
        }
    }

    /**
     * Check if wallet is connected
     */
    async isWalletConnected(): Promise<boolean> {
        try {
            const signer = await this.getSigner()
            return signer !== null
        } catch (error) {
            return false
        }
    }

    /**
     * Get current network information
     */
    async getCurrentNetwork(): Promise<{ chainId: string; name: string } | null> {
        try {
            if (!this.provider) {
                return null
            }
            const network = await this.provider.getNetwork()
            return {
                chainId: network.chainId.toString(),
                name: network.name
            }
        } catch (error) {
            console.error("Error getting current network:", error)
            return null
        }
    }

    /**
     * Check if currently on Amoy testnet
     */
    async isOnAmoyTestnet(): Promise<boolean> {
        try {
            const network = await this.getCurrentNetwork()
            return network?.chainId === "80002"
        } catch (error) {
            return false
        }
    }

    /**
     * Test RPC connection health
     */
    async testRpcHealth(): Promise<{ healthy: boolean; latency: number; error?: string }> {
        try {
            if (!this.provider) {
                return { healthy: false, latency: 0, error: "Provider not initialized" }
            }

            const startTime = Date.now()
            
            // Try to get the latest block number
            const blockNumber = await this.provider.getBlockNumber()
            const latency = Date.now() - startTime

            console.log("RPC health check successful. Latest block:", blockNumber.toString(), "Latency:", latency + "ms")
            
            return { 
                healthy: true, 
                latency,
                error: undefined
            }
        } catch (error: any) {
            console.error("RPC health check failed:", error)
            return { 
                healthy: false, 
                latency: 0, 
                error: error.message 
            }
        }
    }
}

// Export singleton instance
export const contractService = new ContractService() 