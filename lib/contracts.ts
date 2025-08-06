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

// ERC20 ABI for token approvals
const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function decimals() external view returns (uint8)"
]

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
        "https://polygon-amoy-bor.publicnode.com",
        "https://polygon-amoy.drpc.org",
        "https://polygon-amoy.public.blastapi.io",
        "https://polygon-amoy.publicnode.com"
    ],
    blockExplorerUrls: ["https://www.oklink.com/amoy"],
}

// Contract addresses - deployed on Amoy testnet
const CONTRACT_ADDRESSES = {
    RIFF_NFT: process.env.NEXT_PUBLIC_RIFF_NFT_ADDRESS || "0x56e32342D64a5D1ac9349eA18af6232DB41b0F20",
    RIFF_STAKING: process.env.NEXT_PUBLIC_RIFF_STAKING_ADDRESS || "0xCf04c4C46744F867D301E4243AF89A58ffFb1292",
    RIFF_TOKEN: process.env.NEXT_PUBLIC_RIFF_TOKEN_ADDRESS || "0x963c4c0090831fcadba1fb7163efdde582f8de94"
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
     * Validate that the contract exists and is accessible with retry logic
     * @returns Promise with validation result
     */
    async validateContract(): Promise<{ valid: boolean; message: string }> {
        const maxRetries = 3
        const baseDelay = 1000 // 1 second

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const signer = await this.getSigner()
                if (!signer) {
                    return { valid: false, message: "No signer available. Please connect your wallet." }
                }

                console.log(`Validating contract at address: ${CONTRACT_ADDRESSES.RIFF_NFT} (attempt ${attempt}/${maxRetries})`)

                const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
                
                // First, try to validate using contract calls (more reliable than getCode)
                try {
                    console.log("Attempting to validate contract using ABI calls...")
                    
                    // Try multiple contract calls to ensure ABI compatibility
                    const validationPromises = [
                        contract.name().catch(() => null),
                        contract.symbol().catch(() => null),
                        contract.mintingEnabled().catch(() => null),
                        contract.mintPrice().catch(() => null)
                    ]
                    
                    const [name, symbol, mintingEnabled, mintPrice] = await Promise.all(validationPromises)
                    
                    console.log("Contract validation successful:")
                    console.log("- Contract name:", name)
                    console.log("- Contract symbol:", symbol)
                    console.log("- Minting enabled:", mintingEnabled)
                    if (mintPrice) {
                        console.log("- Mint price:", ethers.formatEther(mintPrice), "MATIC")
                    }
                    
                    // If we can call basic functions, the contract is valid
                    if (name && symbol) {
                        return { valid: true, message: "Contract is valid and accessible" }
                    } else {
                        throw new Error("Contract ABI validation failed - missing basic ERC721 functions")
                    }
                } catch (abiError: any) {
                    console.log("ABI validation failed, trying getCode method...")
                    
                    // If ABI validation fails, try getCode as fallback
                    try {
                        const code = await signer.provider?.getCode(CONTRACT_ADDRESSES.RIFF_NFT)
                        if (code === "0x") {
                            return { 
                                valid: false, 
                                message: `No contract found at address ${CONTRACT_ADDRESSES.RIFF_NFT}. Please check the contract address.` 
                            }
                        }

                        console.log("Contract code found:", code.substring(0, 66) + "...")
                        
                        // If we got code but ABI failed, it might be a different contract
                        return { 
                            valid: false, 
                            message: `Contract exists at address ${CONTRACT_ADDRESSES.RIFF_NFT} but ABI doesn't match. Please verify this is the correct RIFF NFT contract.` 
                        }
                    } catch (getCodeError: any) {
                        console.error("Error getting contract code:", getCodeError)
                        
                        // Handle "missing trie node" errors specifically
                        if (getCodeError.message?.toLowerCase().includes("missing trie node") || 
                            getCodeError.message?.toLowerCase().includes("state is not available")) {
                            
                            console.log("RPC node has sync issues, trying alternative validation...")
                            
                            // Try to switch to a better RPC endpoint and retry
                            if (attempt < maxRetries) {
                                try {
                                    console.log("Switching to better RPC endpoint due to sync issues...")
                                    await this.switchToBestRpcEndpoint()
                                    continue // Retry with new endpoint
                                } catch (switchError) {
                                    console.warn("Failed to switch RPC endpoint:", switchError)
                                }
                            }
                            
                            return { 
                                valid: false, 
                                message: `Unable to verify contract at address ${CONTRACT_ADDRESSES.RIFF_NFT}. The RPC node is experiencing sync issues.\n\nPlease try:\n1. Refreshing the page\n2. Switching networks and back\n3. Trying again in a few minutes` 
                            }
                        }
                        
                        // For other getCode errors, throw to be handled by retry logic
                        throw getCodeError
                    }
                }
            } catch (error: any) {
                console.error(`Contract validation error (attempt ${attempt}/${maxRetries}):`, error)
                
                // Check if this is a retryable error
                const isRetryableError = this.isRetryableError(error)
                
                if (attempt === maxRetries || !isRetryableError) {
                    return { valid: false, message: `Validation failed: ${error.message}` }
                }
                
                // Wait before retrying with exponential backoff
                const delay = baseDelay * Math.pow(2, attempt - 1)
                console.log(`Retrying in ${delay}ms...`)
                await new Promise(resolve => setTimeout(resolve, delay))
                
                // Try switching RPC endpoint before next attempt
                try {
                    console.log("Attempting to switch to a better RPC endpoint...")
                    await this.switchToBestRpcEndpoint()
                } catch (switchError) {
                    console.warn("Failed to switch RPC endpoint:", switchError)
                }
            }
        }
        
        return { valid: false, message: "Validation failed after all retry attempts" }
    }

    /**
     * Check if an error is retryable (network/RPC related)
     */
    private isRetryableError(error: any): boolean {
        const errorMessage = error.message?.toLowerCase() || ""
        const errorCode = error.code?.toString() || ""
        
        // Retryable errors
        const retryablePatterns = [
            "missing trie node",
            "internal json-rpc error",
            "-32603",
            "-32000",
            "network error",
            "timeout",
            "connection refused",
            "connection reset",
            "econnreset",
            "enetunreach",
            "could not coalesce error",
            "state is not available",
            "missing revert data"
        ]
        
        return retryablePatterns.some(pattern => 
            errorMessage.includes(pattern) || errorCode.includes(pattern)
        )
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
            
            // Validate contract before proceeding with retry logic
            console.log("Validating contract before minting...")
            const validation = await this.validateContract()
            if (!validation.valid) {
                throw new Error(`Contract validation failed: ${validation.message}`)
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
            
            // Retry logic for the minting transaction
            const mintMaxRetries = 3
            const mintBaseDelay = 2000 // 2 seconds for minting
            let receipt: any = null
            
            for (let mintAttempt = 1; mintAttempt <= mintMaxRetries; mintAttempt++) {
                try {
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
                    console.log(`Mint transaction sent (attempt ${mintAttempt}/${mintMaxRetries}), hash:`, tx.hash)
                    
                    // Wait for transaction confirmation
                    console.log("Waiting for transaction confirmation...")
                    receipt = await tx.wait()
                    console.log("Transaction confirmed:", receipt.hash)
                    
                    // If we get here, the transaction was successful
                    break
                } catch (mintError: any) {
                    console.error(`Mint transaction failed (attempt ${mintAttempt}/${mintMaxRetries}):`, mintError)
                    
                    if (mintAttempt === mintMaxRetries || !this.isRetryableError(mintError)) {
                        throw mintError
                    }
                    
                    const delay = mintBaseDelay * Math.pow(2, mintAttempt - 1)
                    console.log(`Retrying mint transaction in ${delay}ms...`)
                    await new Promise(resolve => setTimeout(resolve, delay))
                    
                    // Try switching RPC endpoint before next attempt
                    try {
                        console.log("Attempting to switch to a better RPC endpoint before retry...")
                        await this.switchToBestRpcEndpoint()
                    } catch (switchError) {
                        console.warn("Failed to switch RPC endpoint:", switchError)
                    }
                }
            }
            
            if (!receipt) {
                throw new Error("Failed to complete minting transaction after all retry attempts")
            }

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
     * Check if the staking contract has approval to spend RIFF tokens
     * @param amount Amount of RIFF tokens to check approval for (in wei)
     * @returns Promise with boolean indicating if approval is sufficient
     */
    async checkRiffTokenApproval(amount: string): Promise<boolean> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const userAddress = await signer.getAddress()
            const riffTokenContract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_TOKEN, ERC20_ABI, signer)
            
            const allowance = await riffTokenContract.allowance(userAddress, CONTRACT_ADDRESSES.RIFF_STAKING)
            const requiredAmount = BigInt(amount)
            
            console.log("Current allowance:", allowance.toString())
            console.log("Required amount:", requiredAmount.toString())
            
            return allowance >= requiredAmount
        } catch (error: any) {
            console.error("Error checking RIFF token approval:", error)
            throw new Error(error.message || "Failed to check token approval")
        }
    }

    /**
     * Approve the staking contract to spend RIFF tokens
     * @param amount Amount of RIFF tokens to approve (in wei)
     * @returns Promise with transaction receipt
     */
    async approveRiffTokens(amount: string): Promise<any> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const riffTokenContract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_TOKEN, ERC20_ABI, signer)
            
            console.log("Approving RIFF tokens for staking contract...")
            console.log("Amount to approve:", amount)
            console.log("Staking contract address:", CONTRACT_ADDRESSES.RIFF_STAKING)
            
            // First check current allowance
            const userAddress = await signer.getAddress()
            const currentAllowance = await riffTokenContract.allowance(userAddress, CONTRACT_ADDRESSES.RIFF_STAKING)
            console.log("Current allowance:", currentAllowance.toString())
            
            // Only approve if current allowance is insufficient
            if (currentAllowance >= BigInt(amount)) {
                console.log("Sufficient allowance already exists")
                return { hash: "already_approved" }
            }
            
            const tx = await riffTokenContract.approve(CONTRACT_ADDRESSES.RIFF_STAKING, amount)
            console.log("Approval transaction sent:", tx.hash)
            
            const receipt = await tx.wait()
            console.log("RIFF token approval successful:", receipt.hash)
            
            // Verify the approval was successful
            const newAllowance = await riffTokenContract.allowance(userAddress, CONTRACT_ADDRESSES.RIFF_STAKING)
            console.log("New allowance:", newAllowance.toString())
            
            if (newAllowance < BigInt(amount)) {
                throw new Error("Approval transaction succeeded but allowance is still insufficient")
            }
            
            return receipt
        } catch (error: any) {
            console.error("Error approving RIFF tokens:", error)
            
            // Provide more specific error messages
            if (error.message.includes("user rejected")) {
                throw new Error("Token approval was rejected by user.")
            } else if (error.message.includes("insufficient funds")) {
                throw new Error("Insufficient funds for gas fees.")
            } else if (error.message.includes("already_approved")) {
                return { hash: "already_approved" }
            } else {
                throw new Error(error.message || "Failed to approve RIFF tokens")
            }
        }
    }

    /**
     * Get RIFF token balance for the current user
     * @returns Promise with token balance in wei
     */
    async getRiffTokenBalance(): Promise<string> {
        const maxRetries = 3
        let lastError: any = null

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const signer = await this.getSigner()
                if (!signer) {
                    throw new Error("No signer available. Please connect your wallet.")
                }

                const userAddress = await signer.getAddress()
                const riffTokenContract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_TOKEN, ERC20_ABI, signer)
                
                console.log(`Attempt ${attempt}: Getting RIFF token balance for address ${userAddress}`)
                const balance = await riffTokenContract.balanceOf(userAddress)
                console.log("RIFF token balance:", balance.toString())
                
                return balance.toString()
            } catch (error: any) {
                lastError = error
                console.error(`Error getting RIFF token balance (attempt ${attempt}):`, error)
                
                // Check if this is a retryable error
                if (this.isRetryableError(error) && attempt < maxRetries) {
                    console.log(`Retrying in ${attempt * 1000}ms...`)
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000))
                    continue
                }
                
                // If it's the last attempt or not retryable, throw the error
                if (attempt === maxRetries) {
                    console.error("All attempts to get RIFF token balance failed")
                    throw new Error(`Failed to get token balance after ${maxRetries} attempts: ${error.message}`)
                }
            }
        }
        
        throw new Error(lastError?.message || "Failed to get token balance")
    }

    /**
     * Stake RIFF tokens on an NFT with automatic approval handling
     * @param tokenId The NFT token ID
     * @param amount Amount of RIFF tokens to stake (in wei)
     */
    async stakeOnRiff(tokenId: string, amount: string) {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            // Check if user has sufficient RIFF token balance
            const balance = await this.getRiffTokenBalance()
            if (BigInt(balance) < BigInt(amount)) {
                throw new Error(`Insufficient RIFF token balance. Required: ${ethers.formatUnits(amount, 18)} RIFF, Available: ${ethers.formatUnits(balance, 18)} RIFF`)
            }

            // Check if staking contract has sufficient approval
            const hasApproval = await this.checkRiffTokenApproval(amount)
            
            if (!hasApproval) {
                console.log("Insufficient approval, requesting approval...")
                const approvalReceipt = await this.approveRiffTokens(amount)
                console.log("Approval transaction confirmed:", approvalReceipt.hash)
                
                // Wait a bit for the approval to be fully processed
                await new Promise(resolve => setTimeout(resolve, 2000))
                
                // Double-check approval was successful
                const approvalConfirmed = await this.checkRiffTokenApproval(amount)
                if (!approvalConfirmed) {
                    throw new Error("Token approval failed. Please try approving the tokens again.")
                }
                console.log("Approval confirmed, proceeding with staking...")
            } else {
                console.log("Sufficient approval already exists")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_STAKING, RIFF_STAKING_ABI, signer)
            
            console.log("Calling stakeOnRiff function...")
            console.log("Token ID:", tokenId)
            console.log("Amount:", amount)
            
            const tx = await contract.stakeOnRiff(tokenId, amount)
            const receipt = await tx.wait()
            
            console.log("Staking transaction successful:", receipt.hash)
            return receipt
        } catch (error: any) {
            console.error("Error staking on riff:", error)
            
            // Provide more specific error messages
            if (error.message.includes("ERC20: insufficient allowance")) {
                throw new Error("Token approval failed. Please try approving the tokens again.")
            } else if (error.message.includes("insufficient funds")) {
                throw new Error("Insufficient RIFF tokens in your wallet for staking.")
            } else if (error.message.includes("user rejected")) {
                throw new Error("Transaction was rejected by user.")
            } else if (error.message.includes("Cannot stake on your own riff")) {
                throw new Error("You cannot stake on your own creations.")
            } else if (error.message.includes("Amount is below minimum stake")) {
                throw new Error("Stake amount is below the minimum required amount.")
            } else {
                throw new Error(error.message || "Failed to stake on riff")
            }
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
     * Get the current mint price from the NFT contract with retry logic
     * @returns Promise with mint price in wei
     */
    async getMintPrice(): Promise<string> {
        const maxRetries = 3
        const baseDelay = 1000

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const signer = await this.getSigner()
                if (!signer) {
                    throw new Error("No signer available. Please connect your wallet.")
                }

                console.log(`Getting mint price (attempt ${attempt}/${maxRetries})`)
                const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
                const mintPrice = await contract.mintPrice()
                console.log("Mint price retrieved successfully:", mintPrice.toString())
                return mintPrice.toString()
            } catch (error: any) {
                console.error(`Error getting mint price (attempt ${attempt}/${maxRetries}):`, error)
                
                if (attempt === maxRetries || !this.isRetryableError(error)) {
                    throw new Error(error.message || "Failed to get mint price")
                }
                
                const delay = baseDelay * Math.pow(2, attempt - 1)
                console.log(`Retrying getMintPrice in ${delay}ms...`)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
        
        throw new Error("Failed to get mint price after all retry attempts")
    }

    /**
     * Check if minting is currently enabled on the NFT contract with retry logic
     * @returns Promise with boolean indicating if minting is enabled
     */
    async isMintingEnabled(): Promise<boolean> {
        const maxRetries = 3
        const baseDelay = 1000

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const signer = await this.getSigner()
                if (!signer) {
                    throw new Error("No signer available. Please connect your wallet.")
                }

                console.log(`Checking minting status (attempt ${attempt}/${maxRetries})`)
                const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
                const mintingEnabled = await contract.mintingEnabled()
                console.log("Minting status retrieved successfully:", mintingEnabled)
                return mintingEnabled
            } catch (error: any) {
                console.error(`Error checking minting status (attempt ${attempt}/${maxRetries}):`, error)
                
                if (attempt === maxRetries || !this.isRetryableError(error)) {
                    throw new Error(error.message || "Failed to check minting status")
                }
                
                const delay = baseDelay * Math.pow(2, attempt - 1)
                console.log(`Retrying isMintingEnabled in ${delay}ms...`)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
        
        throw new Error("Failed to check minting status after all retry attempts")
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
        const maxRetries = 3
        let lastError: any = null

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const signer = await this.getSigner()
                if (!signer) {
                    throw new Error("No signer available. Please connect your wallet.")
                }

                const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_STAKING, RIFF_STAKING_ABI, signer)
                
                console.log(`Attempt ${attempt}: Getting minimum stake amount from contract`)
                const minStakeAmount = await contract.MIN_STAKE_AMOUNT()
                console.log("Minimum stake amount:", minStakeAmount.toString())
                return minStakeAmount.toString()
            } catch (error: any) {
                lastError = error
                console.error(`Error getting minimum stake amount (attempt ${attempt}):`, error)
                
                // Check if this is a retryable error
                if (this.isRetryableError(error) && attempt < maxRetries) {
                    console.log(`Retrying in ${attempt * 1000}ms...`)
                    await new Promise(resolve => setTimeout(resolve, attempt * 1000))
                    continue
                }
                
                // If it's the last attempt or not retryable, use hardcoded fallback
                if (attempt === maxRetries) {
                    console.error("All attempts to get minimum stake amount failed, using hardcoded value")
                    const hardcodedMinStake = "100000000000000000000000" // 100,000 * 10^18
                    console.log("Using hardcoded minimum stake amount:", hardcodedMinStake)
                    return hardcodedMinStake
                }
            }
        }
        
        // Fallback to hardcoded value
        const hardcodedMinStake = "100000000000000000000000" // 100,000 * 10^18
        console.log("Using hardcoded minimum stake amount:", hardcodedMinStake)
        return hardcodedMinStake
    }

    /**
     * Get the minimum stake amount in human-readable format
     * @returns Promise with minimum stake amount in RIFF tokens
     */
    async getMinimumStakeAmountFormatted(): Promise<string> {
        try {
            const minStakeAmountWei = await this.getMinimumStakeAmount()
            const minStakeAmountTokens = ethers.formatUnits(minStakeAmountWei, 18)
            return minStakeAmountTokens
        } catch (error: any) {
            console.error("Error getting formatted minimum stake amount:", error)
            throw new Error(error.message || "Failed to get minimum stake amount")
        }
    }

    /**
     * Validate if a stake amount meets the minimum requirement
     * @param amount Amount to validate (in wei)
     * @returns Promise with validation result
     */
    async validateStakeAmount(amount: string): Promise<{ valid: boolean; minAmount: string; formattedMinAmount: string; error?: string }> {
        try {
            const minStakeAmount = await this.getMinimumStakeAmount()
            const formattedMinAmount = await this.getMinimumStakeAmountFormatted()
            
            const amountBigInt = BigInt(amount)
            const minAmountBigInt = BigInt(minStakeAmount)
            
            if (amountBigInt < minAmountBigInt) {
                return {
                    valid: false,
                    minAmount: minStakeAmount,
                    formattedMinAmount,
                    error: `Stake amount must be at least ${formattedMinAmount} RIFF tokens`
                }
            }
            
            return {
                valid: true,
                minAmount: minStakeAmount,
                formattedMinAmount,
                error: undefined
            }
        } catch (error: any) {
            console.error("Error validating stake amount:", error)
            
            // If we can't get the minimum stake amount from the contract, use the hardcoded value
            const hardcodedMinStake = "100000000000000000000000" // 100,000 * 10^18
            const hardcodedFormatted = "100000" // 100,000 RIFF
            
            const amountBigInt = BigInt(amount)
            const minAmountBigInt = BigInt(hardcodedMinStake)
            
            if (amountBigInt < minAmountBigInt) {
                return {
                    valid: false,
                    minAmount: hardcodedMinStake,
                    formattedMinAmount: hardcodedFormatted,
                    error: `Stake amount must be at least ${hardcodedFormatted} RIFF tokens`
                }
            }
            
            return {
                valid: true,
                minAmount: hardcodedMinStake,
                formattedMinAmount: hardcodedFormatted,
                error: undefined
            }
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
     * Force refresh the provider connection
     */
    async refreshProvider(): Promise<void> {
        try {
            console.log("Refreshing provider connection...")
            
            if (typeof window !== 'undefined' && window.ethereum) {
                // Reinitialize the provider
                this.provider = new ethers.BrowserProvider(window.ethereum)
                this.signer = await this.provider.getSigner()
                
                // Test the connection
                await this.provider.getBlockNumber()
                console.log("Provider connection refreshed successfully")
            } else {
                throw new Error("No ethereum provider available")
            }
        } catch (error: any) {
            console.error("Failed to refresh provider:", error)
            throw new Error("Failed to refresh provider connection")
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
     * Test contract connection and provide detailed status
     */
    async testContractConnection(): Promise<{ 
        connected: boolean; 
        network: string; 
        contractExists: boolean; 
        mintingEnabled: boolean; 
        mintPrice: string; 
        error?: string 
    }> {
        try {
            // Check if wallet is connected
            const signer = await this.getSigner()
            if (!signer) {
                return { 
                    connected: false, 
                    network: "Unknown", 
                    contractExists: false, 
                    mintingEnabled: false, 
                    mintPrice: "0",
                    error: "No wallet connected" 
                }
            }

            // Check network
            const network = await this.getCurrentNetwork()
            const networkName = network?.name || "Unknown"

            // Test contract validation
            const validation = await this.validateContract()
            if (!validation.valid) {
                return { 
                    connected: true, 
                    network: networkName, 
                    contractExists: false, 
                    mintingEnabled: false, 
                    mintPrice: "0",
                    error: validation.message 
                }
            }

            // Get contract details with comprehensive validation
            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
            
            // Test multiple contract functions to ensure ABI compatibility
            const [name, symbol, mintingEnabled, mintPrice] = await Promise.all([
                contract.name().catch(() => null),
                contract.symbol().catch(() => null),
                contract.mintingEnabled().catch(() => null),
                contract.mintPrice().catch(() => null)
            ])
            
            // Check if contract has basic ERC721 functionality
            const hasBasicERC721 = name && symbol
            const hasCustomFunctions = mintingEnabled !== null && mintPrice !== null
            
            return {
                connected: true,
                network: networkName,
                contractExists: hasBasicERC721 && hasCustomFunctions,
                mintingEnabled: mintingEnabled || false,
                mintPrice: mintPrice ? mintPrice.toString() : "0",
                error: hasBasicERC721 && hasCustomFunctions ? undefined : "Contract ABI mismatch"
            }
        } catch (error: any) {
            return {
                connected: false,
                network: "Unknown",
                contractExists: false,
                mintingEnabled: false,
                mintPrice: "0",
                error: error.message
            }
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
            
            // Test the best endpoint before switching
            console.log("Testing best RPC endpoint...")
            const testProvider = new ethers.JsonRpcProvider(rpcTest.bestEndpoint)
            await testProvider.getBlockNumber()
            console.log("Best RPC endpoint is working")
            
            // Update the provider to use the best endpoint
            // Note: We can't directly change the BrowserProvider's RPC, but we can
            // ensure the current provider is working and try to get a fresh connection
            if (this.provider) {
                try {
                    // Test current provider
                    await this.provider.getBlockNumber()
                    console.log("Current provider is still working")
                } catch (currentError) {
                    console.log("Current provider failed, reinitializing...")
                    // Reinitialize the provider
                    this.provider = new ethers.BrowserProvider(window.ethereum)
                    this.signer = await this.provider.getSigner()
                }
            }
            
            console.log("RPC endpoint switch completed")
        } catch (error: any) {
            console.error("Failed to switch RPC endpoint:", error)
            
            // If all endpoints failed, try to reinitialize the current provider
            try {
                console.log("Attempting to reinitialize current provider...")
                this.provider = new ethers.BrowserProvider(window.ethereum)
                this.signer = await this.provider.getSigner()
                console.log("Provider reinitialized")
            } catch (reinitError) {
                console.error("Failed to reinitialize provider:", reinitError)
                throw new Error("Unable to find a working RPC endpoint. Please try refreshing the page.")
            }
        }
    }

    /**
     * Manually approve RIFF tokens with a specific amount (utility function)
     * @param amount Amount of RIFF tokens to approve (in wei)
     * @param spenderAddress Optional spender address (defaults to staking contract)
     * @returns Promise with transaction receipt
     */
    async manualApproveRiffTokens(amount: string, spenderAddress?: string): Promise<any> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const riffTokenContract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_TOKEN, ERC20_ABI, signer)
            const spender = spenderAddress || CONTRACT_ADDRESSES.RIFF_STAKING
            
            console.log("Manually approving RIFF tokens...")
            console.log("Amount to approve:", amount)
            console.log("Spender address:", spender)
            
            const tx = await riffTokenContract.approve(spender, amount)
            console.log("Manual approval transaction sent:", tx.hash)
            
            const receipt = await tx.wait()
            console.log("Manual RIFF token approval successful:", receipt.hash)
            
            return receipt
        } catch (error: any) {
            console.error("Error in manual RIFF token approval:", error)
            throw new Error(error.message || "Failed to manually approve RIFF tokens")
        }
    }

    /**
     * Get current RIFF token allowance for a specific spender
     * @param spenderAddress The spender address to check allowance for
     * @returns Promise with allowance amount in wei
     */
    async getRiffTokenAllowance(spenderAddress?: string): Promise<string> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const userAddress = await signer.getAddress()
            const riffTokenContract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_TOKEN, ERC20_ABI, signer)
            const spender = spenderAddress || CONTRACT_ADDRESSES.RIFF_STAKING
            
            const allowance = await riffTokenContract.allowance(userAddress, spender)
            console.log(`Current allowance for ${spender}:`, allowance.toString())
            
            return allowance.toString()
        } catch (error: any) {
            console.error("Error getting RIFF token allowance:", error)
            throw new Error(error.message || "Failed to get token allowance")
        }
    }
}

// Export singleton instance
export const contractService = new ContractService() 