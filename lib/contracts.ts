// Add ethereum to window type
declare global {
    interface Window {
        ethereum?: any
    }
}

// Import ethers - you'll need to install this package
// npm install ethers
// import { ethers } from 'ethers'

// For now, using a mock implementation until ethers is installed
const ethers = {
    BrowserProvider: class MockProvider {
        constructor(provider: any) {}
        async getSigner() {
            return {
                getAddress: () => "0x1234567890123456789012345678901234567890"
            }
        }
    },
    Contract: class MockContract {
        constructor(address: string, abi: any, signer: any) {}
        async mint(tokenURI: string) {
            return { wait: () => Promise.resolve({}) }
        }
        async totalSupply() {
            return "1000"
        }
        async stakeOnRiff(tokenId: string, amount: string) {
            return { wait: () => Promise.resolve({}) }
        }
        async unstakeFromRiff(tokenId: string) {
            return { wait: () => Promise.resolve({}) }
        }
        async claimRewards(tokenId: string) {
            return { wait: () => Promise.resolve({}) }
        }
        async getStake(tokenId: string, userAddress: string) {
            return ["1000000000000000000", "1640995200", "1643587200"]
        }
        async earned(tokenId: string, userAddress: string) {
            return "500000000000000000"
        }
    }
}

// Contract ABIs - you'll need to replace these with your actual contract ABIs
const RIFF_NFT_ABI = [
    "function mint(string memory tokenURI) public returns (uint256)",
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function totalSupply() public view returns (uint256)"
]

const RIFF_STAKING_ABI = [
    "function stakeOnRiff(uint256 _tokenId, uint256 _amount) external",
    "function unstakeFromRiff(uint256 _tokenId) external",
    "function claimRewards(uint256 _tokenId) external",
    "function getStake(uint256 _tokenId, address _user) public view returns (uint256 amount, uint256 stakeTime, uint256 unlockTime)",
    "function earned(uint256 _tokenId, address _account) public view returns (uint256)"
]

// Contract addresses - replace with your deployed contract addresses
const CONTRACT_ADDRESSES = {
    RIFF_NFT: process.env.NEXT_PUBLIC_RIFF_NFT_ADDRESS || "0x1234567890123456789012345678901234567890",
    RIFF_STAKING: process.env.NEXT_PUBLIC_RIFF_STAKING_ADDRESS || "0x1234567890123456789012345678901234567890",
    RIFF_TOKEN: process.env.NEXT_PUBLIC_RIFF_TOKEN_ADDRESS || "0x1234567890123456789012345678901234567890"
}

export class ContractService {
    private provider: any = null
    private signer: any = null

    constructor() {
        this.initializeProvider()
    }

    private async initializeProvider() {
        if (typeof window !== 'undefined' && window.ethereum) {
            this.provider = new ethers.BrowserProvider(window.ethereum)
            this.signer = await this.provider.getSigner()
        }
    }

    private async getSigner() {
        if (!this.signer) {
            await this.initializeProvider()
        }
        return this.signer
    }

    /**
     * Mint a new RIFF NFT
     * @param tokenURI IPFS URI containing NFT metadata
     * @returns Promise with token ID and contract address
     */
    async mintRiffNFT(tokenURI: string): Promise<{ tokenId: string; contractAddress: string }> {
        try {
            const signer = await this.getSigner()
            if (!signer) {
                throw new Error("No signer available. Please connect your wallet.")
            }

            const contract = new ethers.Contract(CONTRACT_ADDRESSES.RIFF_NFT, RIFF_NFT_ABI, signer)
            
            // Get current token count to estimate the new token ID
            const currentSupply = await contract.totalSupply()
            const estimatedTokenId = currentSupply.toString()

            // Mint the NFT
            const tx = await contract.mint(tokenURI)
            
            // Wait for transaction confirmation
            const receipt = await tx.wait()
            
            // Get the actual token ID from the transaction
            const tokenId = estimatedTokenId

            return {
                tokenId,
                contractAddress: CONTRACT_ADDRESSES.RIFF_NFT
            }
        } catch (error: any) {
            console.error("Error minting NFT:", error)
            throw new Error(error.message || "Failed to mint NFT")
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
}

// Export singleton instance
export const contractService = new ContractService() 