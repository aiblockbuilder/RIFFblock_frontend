// Pinata service for uploading metadata to IPFS
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "ea91cc0012586b19825f"
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET || "ee3198e6740653f9a701a6fccebd85114e9ae72aa813c8acf761f1ba4ab1d978"
const PINATA_GATEWAY_URL = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || "https://gateway.pinata.cloud/ipfs/"

export interface NFTMetadata {
    name: string
    description: string
    image: string
    audio: string
    attributes: Array<{
        trait_type: string
        value: string | number | boolean
    }>
    external_url?: string
    animation_url?: string
}

export class PinataService {
    /**
     * Test Pinata credentials by making a simple API call
     * @returns Promise with test result
     */
    async testCredentials(): Promise<{ valid: boolean; message: string }> {
        try {
            console.log("Testing Pinata credentials...")
            
            const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
                method: 'GET',
                headers: {
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_API_SECRET,
                }
            })

            console.log("Pinata test response status:", response.status, response.statusText)

            if (response.ok) {
                const result = await response.json()
                console.log("Pinata test successful:", result)
                return { valid: true, message: "Credentials are valid" }
            } else {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`
                
                try {
                    const errorData = await response.json()
                    console.error("Pinata test error response:", errorData)
                    
                    if (errorData.error) {
                        errorMessage = `Authentication failed: ${errorData.error}`
                    } else if (errorData.message) {
                        errorMessage = `Authentication failed: ${errorData.message}`
                    } else {
                        errorMessage = `Authentication failed: ${JSON.stringify(errorData)}`
                    }
                } catch (parseError) {
                    errorMessage = `Authentication failed: ${response.status} ${response.statusText}`
                }
                
                return { valid: false, message: errorMessage }
            }
        } catch (error: any) {
            console.error("Error testing Pinata credentials:", error)
            return { valid: false, message: `Test failed: ${error.message}` }
        }
    }

    /**
     * Upload metadata to IPFS via Pinata
     * @param metadata The NFT metadata object
     * @returns Promise with the IPFS hash (CID)
     */
    async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
        try {
            console.log("Uploading metadata to Pinata:", {
                metadataName: metadata.name,
                apiKey: PINATA_API_KEY.substring(0, 8) + "...",
                apiSecret: PINATA_API_SECRET.substring(0, 8) + "..."
            })

            const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_API_SECRET,
                },
                body: JSON.stringify({
                    pinataMetadata: {
                        name: metadata.name,
                        keyvalues: {
                            type: 'nft-metadata',
                            collection: 'riffblock',
                        }
                    },
                    pinataOptions: {
                        cidVersion: 1,
                        wrapWithDirectory: false
                    },
                    pinataContent: metadata
                })
            })

            console.log("Pinata metadata response status:", response.status, response.statusText)

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`
                
                try {
                    const errorData = await response.json()
                    console.error("Pinata metadata error response:", errorData)
                    
                    if (errorData.error) {
                        errorMessage = `Pinata API error: ${errorData.error}`
                    } else if (errorData.message) {
                        errorMessage = `Pinata API error: ${errorData.message}`
                    } else if (typeof errorData === 'string') {
                        errorMessage = `Pinata API error: ${errorData}`
                    } else {
                        errorMessage = `Pinata API error: ${JSON.stringify(errorData)}`
                    }
                } catch (parseError) {
                    // If we can't parse the error response, use the status text
                    errorMessage = `Pinata API error: ${response.status} ${response.statusText}`
                }
                
                throw new Error(errorMessage)
            }

            const result = await response.json()
            console.log("Pinata metadata upload successful:", result.IpfsHash)
            return result.IpfsHash
        } catch (error: any) {
            console.error("Error uploading metadata to IPFS:", error)
            throw new Error(`Failed to upload metadata to IPFS: ${error.message}`)
        }
    }

    /**
     * Upload a file to IPFS via Pinata
     * @param file The file to upload
     * @param fileName Optional custom filename
     * @returns Promise with the IPFS hash (CID)
     */
    async uploadFileToIPFS(file: File, fileName?: string): Promise<string> {
        try {
            console.log("Uploading file to Pinata:", {
                fileName: fileName || file.name,
                fileSize: file.size,
                fileType: file.type,
                apiKey: PINATA_API_KEY.substring(0, 8) + "...",
                apiSecret: PINATA_API_SECRET.substring(0, 8) + "..."
            })

            const formData = new FormData()
            formData.append('file', file, fileName || file.name)

            // Add metadata
            const metadata = JSON.stringify({
                name: fileName || file.name,
                keyvalues: {
                    type: 'riff-audio',
                    collection: 'riffblock',
                }
            })
            formData.append('pinataMetadata', metadata)

            // Add options
            const options = JSON.stringify({
                cidVersion: 1,
                wrapWithDirectory: false
            })
            formData.append('pinataOptions', options)

            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                headers: {
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_API_SECRET,
                },
                body: formData
            })

            console.log("Pinata response status:", response.status, response.statusText)

            if (!response.ok) {
                let errorMessage = `HTTP ${response.status}: ${response.statusText}`
                
                try {
                    const errorData = await response.json()
                    console.error("Pinata error response:", errorData)
                    
                    if (errorData.error) {
                        errorMessage = `Pinata API error: ${errorData.error}`
                    } else if (errorData.message) {
                        errorMessage = `Pinata API error: ${errorData.message}`
                    } else if (typeof errorData === 'string') {
                        errorMessage = `Pinata API error: ${errorData}`
                    } else {
                        errorMessage = `Pinata API error: ${JSON.stringify(errorData)}`
                    }
                } catch (parseError) {
                    // If we can't parse the error response, use the status text
                    errorMessage = `Pinata API error: ${response.status} ${response.statusText}`
                }
                
                throw new Error(errorMessage)
            }

            const result = await response.json()
            console.log("Pinata upload successful:", result.IpfsHash)
            return result.IpfsHash
        } catch (error: any) {
            console.error("Error uploading file to IPFS:", error)
            throw new Error(`Failed to upload file to IPFS: ${error.message}`)
        }
    }

    /**
     * Get the full IPFS gateway URL from a CID
     * @param cid The IPFS content identifier
     * @returns The full gateway URL
     */
    getIPFSGatewayUrl(cid: string): string {
        return `${PINATA_GATEWAY_URL}${cid}`
    }

    /**
     * Convert a regular URL to IPFS URI format
     * @param cid The IPFS content identifier
     * @returns The IPFS URI
     */
    getIPFSUri(cid: string): string {
        return `ipfs://${cid}`
    }

    /**
     * Validate uploaded metadata by fetching it back from IPFS
     * @param cid The IPFS content identifier
     * @returns Promise with the metadata object
     */
    async validateMetadata(cid: string): Promise<NFTMetadata> {
        try {
            const response = await fetch(this.getIPFSGatewayUrl(cid))
            
            if (!response.ok) {
                throw new Error(`Failed to fetch metadata from IPFS: ${response.statusText}`)
            }
            
            const metadata = await response.json()
            return metadata
        } catch (error: any) {
            console.error("Error validating metadata:", error)
            throw new Error(`Failed to validate metadata: ${error.message}`)
        }
    }

    /**
     * Upload both audio file and metadata, then return the metadata URI
     * @param audioFile The audio file to upload
     * @param metadata The NFT metadata (without audio URL)
     * @param coverImage Optional cover image file
     * @param defaultImageUrl Default image URL to use if no cover image is provided
     * @returns Promise with the metadata IPFS URI
     */
    async uploadAudioAndMetadata(
        audioFile: File, 
        metadata: Omit<NFTMetadata, 'audio' | 'image'>, 
        coverImage?: File,
        defaultImageUrl?: string
    ): Promise<string> {
        try {
            // First, upload the audio file
            const audioCid = await this.uploadFileToIPFS(audioFile)
            const audioUrl = this.getIPFSGatewayUrl(audioCid)

            // Upload cover image if provided, otherwise use default
            let imageUrl = defaultImageUrl || "/audio-waveform-visualization.png"
            if (coverImage) {
                const imageCid = await this.uploadFileToIPFS(coverImage, `cover-${Date.now()}.${coverImage.name.split('.').pop()}`)
                imageUrl = this.getIPFSGatewayUrl(imageCid)
            }

            // Then, create the complete metadata with the audio and image URLs
            const completeMetadata: NFTMetadata = {
                ...metadata,
                audio: audioUrl,
                image: imageUrl
            }

            // Upload the metadata
            const metadataCid = await this.uploadMetadataToIPFS(completeMetadata)
            
            // Return the metadata URI
            return this.getIPFSUri(metadataCid)
        } catch (error: any) {
            console.error("Error uploading audio and metadata:", error)
            throw new Error(`Failed to upload audio and metadata: ${error.message}`)
        }
    }
}

// Export singleton instance
export const pinataService = new PinataService() 