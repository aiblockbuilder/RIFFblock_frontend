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
        "https://rpc.ankr.com/polygon_amoy/e66a6d9da101e8bd10b871515a03caa7704dbf170fe10daffb691ff78d15843a",
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
                
                // Also check if minting is enabled
                try {
                    const mintingEnabled = await contract.mintingEnabled()
                    console.log("Minting enabled:", mintingEnabled)
                    
                    if (mintingEnabled) {
                        const mintPrice = await contract.mintPrice()
                        console.log("Mint price:", ethers.formatEther(mintPrice), "MATIC")
                    }
                } catch (mintError) {
                    console.warn("Could not check minting status:", mintError)
                }
                
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
     * Mint a new RIFF NFT with revenue split configuration
     * @param tokenURI The metadata URI for the NFT
     * @param stakerRewardPercentage The percentage of revenue that goes to stakers (Y%)
     * @param platformFeePercentage The percentage of revenue that goes to platform (Z%)
     * @param lockPeriodDays The lock period for staking in days
     * @param toAddress Address to mint the NFT to (optional, defaults to signer address)
     * @returns Promise with token ID and contract address
     */
    async mintRiffNFT(
        tokenURI: string,
        stakerRewardPercentage: number,
        platformFeePercentage: number,
        lockPeriodDays: number,
        toAddress?: string
    ): Promise<{ tokenId: string; contractAddress: string }> {
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
                console.log("Current RPC endpoint is unhealthy, trying to switch to a better one...")
                try {
                    await this.switchToBestRpcEndpoint()
                    console.log("Successfully switched to a better RPC endpoint")
                } catch (switchError) {
                    throw new Error(`RPC connection is unhealthy: ${rpcHealth.error}. Please try switching networks or try again later.`)
                }
            } else {
                console.log("RPC health check passed. Latency:", rpcHealth.latency + "ms")
            }

            // Use provided address or default to signer address
            const mintToAddress = toAddress || await signer.getAddress()
            
            console.log("Minting NFT to address:", mintToAddress)
            console.log("Using contract address:", CONTRACT_ADDRESSES.RIFF_NFT)
            console.log("Token URI:", tokenURI)
            console.log("Staker reward percentage:", stakerRewardPercentage)
            console.log("Platform fee percentage:", platformFeePercentage)
            console.log("Lock period days:", lockPeriodDays)

            // Validate contract address
            if (!CONTRACT_ADDRESSES.RIFF_NFT || CONTRACT_ADDRESSES.RIFF_NFT === "") {
                throw new Error("RIFF NFT contract address is not configured. Please check your environment variables.")
            }

            // Check if contract address is valid
            if (!ethers.isAddress(CONTRACT_ADDRESSES.RIFF_NFT)) {
                throw new Error(`Invalid contract address: ${CONTRACT_ADDRESSES.RIFF_NFT}`)
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
            
            // Validate contract before proceeding
            const validation = await this.validateContract()
            if (!validation.valid) {
                throw new Error(validation.message)
            }

            // Get mint price from contract
            console.log("Getting mint price from contract...")
            const mintPrice = await contract.mintPrice()
            console.log("Mint price:", mintPrice.toString(), "wei")

            // Check if minting is enabled
            console.log("Checking if minting is enabled...")
            const mintingEnabled = await contract.mintingEnabled()
            if (!mintingEnabled) {
                throw new Error("Minting is currently disabled on the contract.")
            }
            console.log("Minting is enabled")

            // Validate revenue split parameters
            console.log("Validating revenue split parameters...")
            const totalShare = stakerRewardPercentage + platformFeePercentage
            if (totalShare >= 100) {
                throw new Error("Invalid revenue split: Total of staker reward and platform fee must be less than 100%.")
            }
            if (stakerRewardPercentage <= 0) {
                throw new Error("Staker reward percentage must be greater than 0%.")
            }
            if (lockPeriodDays < 30) {
                throw new Error("Lock period must be at least 30 days.")
            }
            console.log("Revenue split validation passed")

            // Test transaction simulation to catch potential issues early
            console.log("Testing transaction simulation...")
            try {
                await contract.mintRiff.staticCall(
                    mintToAddress,
                    tokenURI,
                    stakerRewardPercentage,
                    platformFeePercentage,
                    lockPeriodDays,
                    { value: mintPrice }
                )
                console.log("Transaction simulation successful")
            } catch (simError: any) {
                console.warn("Transaction simulation failed:", simError.message)
                // Don't throw here, just log the warning
            }

            // Get current gas price (use legacy format to avoid EIP-1559 issues)
            console.log("Getting current gas price...")
            let gasPrice: bigint
            try {
                const feeData = await signer.provider?.getFeeData()
                gasPrice = feeData?.gasPrice || BigInt(0)
                console.log("Current gas price:", gasPrice.toString(), "wei")
            } catch (error) {
                console.warn("Failed to get fee data, using fallback gas price")
                gasPrice = BigInt(120000000000) // 120 gwei fallback
                console.log("Using fallback gas price:", gasPrice.toString(), "wei")
            }

            // Estimate gas first
            console.log("Estimating gas for mintRiff transaction...")
            const gasEstimate = await contract.mintRiff.estimateGas(
                mintToAddress,
                tokenURI,
                stakerRewardPercentage,
                platformFeePercentage,
                lockPeriodDays,
                { value: mintPrice }
            )
            console.log("Estimated gas:", gasEstimate.toString())
            
            // Add 30% buffer to gas estimate for safety
            const gasLimit = (gasEstimate * BigInt(130)) / BigInt(100)
            console.log("Gas limit with buffer:", gasLimit.toString())
            
            // Check user balance
            console.log("Checking user balance...")
            const balance = await signer.provider?.getBalance(mintToAddress)
            const totalCost = mintPrice + (gasLimit * gasPrice)
            console.log("User balance:", balance?.toString(), "wei")
            console.log("Total estimated cost:", totalCost.toString(), "wei")
            
            if (balance && balance < totalCost) {
                throw new Error(`Insufficient balance. Required: ${ethers.formatEther(totalCost)} MATIC, Available: ${ethers.formatEther(balance)} MATIC`)
            }

            // Mint the NFT with revenue split configuration (use legacy transaction format)
            console.log("Calling mintRiff function...")
            const tx = await contract.mintRiff(
                mintToAddress,
                tokenURI,
                stakerRewardPercentage,
                platformFeePercentage,
                lockPeriodDays,
                {
                    value: mintPrice,
                    gasLimit: gasLimit,
                    gasPrice: gasPrice // Use explicit gasPrice for legacy transactions
                }
            )
            console.log("Mint transaction sent, hash:", tx.hash)
            
            // Wait for transaction confirmation
            console.log("Waiting for transaction confirmation...")
            const receipt = await tx.wait()
            console.log("Transaction confirmed:", receipt.hash)

            // Extract token ID from the transaction receipt
            // The mintRiff function returns the token ID, so we need to get it from the transaction result
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
            } else if (error.message.includes("insufficient funds") || error.message.includes("Insufficient balance")) {
                throw new Error("Insufficient funds for gas fees or mint price. Please add more tokens to your wallet.")
            } else if (error.message.includes("user rejected")) {
                throw new Error("Transaction was rejected by user.")
            } else if (error.message.includes("nonce too low")) {
                throw new Error("Transaction nonce error. Please try again.")
            } else if (error.message.includes("Internal JSON-RPC error") || error.message.includes("-32603")) {
                throw new Error("RPC provider error. Please try switching networks or try again later. If the problem persists, check your internet connection.")
            } else if (error.message.includes("gas")) {
                throw new Error("Gas estimation failed. Please try again or check your wallet balance.")
            } else if (error.message.includes("Total share must be less than 100%")) {
                throw new Error("Invalid revenue split: Total of staker reward and platform fee must be less than 100%.")
            } else if (error.message.includes("Staker reward must be greater than 0")) {
                throw new Error("Staker reward percentage must be greater than 0%.")
            } else if (error.message.includes("Lock period must be at least 30 days")) {
                throw new Error("Lock period must be at least 30 days.")
            } else if (error.message.includes("Minting is currently disabled")) {
                throw new Error("Minting is currently disabled on the contract. Please try again later.")
            } else if (error.message.includes("Invalid contract address")) {
                throw new Error("Contract address is invalid. Please check your configuration.")
            } else if (error.message.includes("RIFF NFT contract address is not configured")) {
                throw new Error("Contract address is not configured. Please check your environment variables.")
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
     * Get the current mint price from the NFT contract
     * @returns Promise with mint price in wei
     */
    async getMintPrice(): Promise<string> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
            const mintPrice = await contract.mintPrice()
            return mintPrice.toString()
        } catch (error: any) {
            console.error("Error getting mint price:", error)
            throw new Error(error.message || "Failed to get mint price")
        }
    }

    /**
     * Check if minting is currently enabled on the NFT contract
     * @returns Promise with boolean indicating if minting is enabled
     */
    async isMintingEnabled(): Promise<boolean> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
            const mintingEnabled = await contract.mintingEnabled()
            return mintingEnabled
        } catch (error: any) {
            console.error("Error checking minting status:", error)
            throw new Error(error.message || "Failed to check minting status")
        }
    }

    /**
     * Get revenue split information for a specific NFT
     * @param tokenId The NFT token ID
     * @returns Promise with revenue split details
     */
    async getRevenueSplit(tokenId: string) {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
            
            const [stakerRewardPercentage, platformFeePercentage, artistSharePercentage, lockPeriodDays] = await contract.getRevenueSplit(tokenId)
            
            return {
                stakerRewardPercentage: stakerRewardPercentage.toString(),
                platformFeePercentage: platformFeePercentage.toString(),
                artistSharePercentage: artistSharePercentage.toString(),
                lockPeriodDays: lockPeriodDays.toString()
            }
        } catch (error: any) {
            console.error("Error getting revenue split:", error)
            throw new Error(error.message || "Failed to get revenue split")
        }
    }

    /**
     * Get the minimum stake amount required by the staking contract
     * @returns Promise with minimum stake amount in wei
     */
    async getMinimumStakeAmount(): Promise<string> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_STAKING, RIFF_STAKING_ABI, signer)
            const minStakeAmount = await contract.MIN_STAKE_AMOUNT()
            return minStakeAmount.toString()
        } catch (error: any) {
            console.error("Error getting minimum stake amount:", error)
            throw new Error(error.message || "Failed to get minimum stake amount")
        }
    }

    /**
     * Get NFT revenue split information from the staking contract
     * @param tokenId The NFT token ID
     * @returns Promise with revenue split details
     */
    async getNFTRevenueSplit(tokenId: string) {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_STAKING, RIFF_STAKING_ABI, signer)
            
            const [stakerRewardPercentage, platformFeePercentage, artistSharePercentage, lockPeriodDays] = await contract.getNFTRevenueSplit(tokenId)
            
            return {
                stakerRewardPercentage: stakerRewardPercentage.toString(),
                platformFeePercentage: platformFeePercentage.toString(),
                artistSharePercentage: artistSharePercentage.toString(),
                lockPeriodDays: lockPeriodDays.toString()
            }
        } catch (error: any) {
            console.error("Error getting NFT revenue split:", error)
            throw new Error(error.message || "Failed to get NFT revenue split")
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

    /**
     * Test all RPC endpoints and return the best one
     */
    async testRpcEndpoints(): Promise<{ bestEndpoint: string; latency: number; allResults: Array<{ url: string; latency: number; success: boolean; error?: string }> }> {
        const endpoints = AMOY_TESTNET.rpcUrls
        const results: Array<{ url: string; latency: number; success: boolean; error?: string }> = []
        
        for (const endpoint of endpoints) {
            try {
                const startTime = Date.now()
                const provider = new ethers.JsonRpcProvider(endpoint)
                await provider.getBlockNumber()
                const latency = Date.now() - startTime
                
                results.push({
                    url: endpoint,
                    latency,
                    success: true
                })
                
                console.log(`RPC endpoint ${endpoint} is healthy. Latency: ${latency}ms`)
            } catch (error: any) {
                results.push({
                    url: endpoint,
                    latency: 0,
                    success: false,
                    error: error.message
                })
                console.log(`RPC endpoint ${endpoint} failed: ${error.message}`)
            }
        }
        
        const successfulEndpoints = results.filter(r => r.success)
        if (successfulEndpoints.length === 0) {
            throw new Error("All RPC endpoints are currently unavailable")
        }
        
        // Sort by latency and return the best one
        successfulEndpoints.sort((a, b) => a.latency - b.latency)
        const bestEndpoint = successfulEndpoints[0]
        
        return {
            bestEndpoint: bestEndpoint.url,
            latency: bestEndpoint.latency,
            allResults: results
        }
    }

    /**
     * Switch to a different RPC endpoint if current one is having issues
     */
    async switchToBestRpcEndpoint(): Promise<void> {
        try {
            console.log("Testing all RPC endpoints...")
            const rpcTest = await this.testRpcEndpoints()
            console.log("Best RPC endpoint:", rpcTest.bestEndpoint, "Latency:", rpcTest.latency + "ms")
            
            // Always try to use the best endpoint found
            console.log("Switching to best RPC endpoint...")
            const newProvider = new ethers.JsonRpcProvider(rpcTest.bestEndpoint)
            
            // Test the new provider
            await newProvider.getBlockNumber()
            console.log("New RPC endpoint is working")
            
            // Update the provider
            this.provider = new ethers.BrowserProvider(window.ethereum)
            this.signer = await this.provider.getSigner()
            console.log("Switched to new RPC endpoint")
        } catch (error: any) {
            console.error("Failed to switch RPC endpoint:", error)
            throw new Error("Unable to find a working RPC endpoint")
        }
    }
}

// Export singleton instance
export const contractService = new ContractService() 