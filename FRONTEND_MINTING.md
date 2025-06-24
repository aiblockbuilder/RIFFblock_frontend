# Frontend NFT Minting Implementation

## Overview

This implementation follows industry best practices by minting NFTs on the frontend (client-side) before uploading metadata to the backend. This approach provides better security, user experience, and follows the standard pattern used by major NFT platforms.

## Architecture

### Flow
1. **User uploads audio file** → Frontend validation
2. **User fills riff information** → Metadata preparation
3. **User configures monetization** → Pricing and royalty settings
4. **User configures staking** → Staking parameters
5. **Preview & Confirm** → Final review
6. **Mint NFT** → Smart contract interaction (if minting as NFT)
7. **Upload to backend** → Store metadata and IPFS links

### Key Benefits

#### Security
- **Private keys never leave user's wallet**
- **Users sign transactions directly**
- **No server-side private key management**

#### User Experience
- **Real-time transaction status** in wallet
- **Direct blockchain interaction**
- **Transparent gas costs**

#### Industry Standard
- **Same pattern as OpenSea, Foundation, etc.**
- **Familiar to Web3 users**
- **Better decentralization**

## Implementation Details

### Contract Service (`lib/contracts.ts`)

The `ContractService` class handles all smart contract interactions:

```typescript
// Mint NFT
const result = await contractService.mintRiffNFT(tokenURI)

// Stake tokens
await contractService.stakeOnRiff(tokenId, amount)

// Claim rewards
await contractService.claimRewards(tokenId)
```

### Upload Flow (`app/upload/page.tsx`)

The upload process now includes:

1. **NFT Minting** (if selected):
   ```typescript
   if (uploadType === "mint-nft") {
       const mintResult = await mintNFT()
       tokenId = mintResult.tokenId
       contractAddress = mintResult.contractAddress
   }
   ```

2. **Backend Upload**:
   ```typescript
   // Include NFT data if minted
   if (tokenId && contractAddress) {
       formData.append("isNft", "true")
       formData.append("tokenId", tokenId)
       formData.append("contractAddress", contractAddress)
   }
   ```

## Setup Requirements

### 1. Install Dependencies
```bash
npm install ethers
```

### 2. Environment Variables
Create `.env.local`:
```env
NEXT_PUBLIC_RIFF_NFT_ADDRESS=0x...
NEXT_PUBLIC_RIFF_STAKING_ADDRESS=0x...
NEXT_PUBLIC_RIFF_TOKEN_ADDRESS=0x...
```

### 3. Contract ABIs
Replace the mock ABIs in `lib/contracts.ts` with your actual contract ABIs.

### 4. IPFS Integration
For production, implement IPFS upload for NFT metadata:
```typescript
// Upload metadata to IPFS
const metadataCID = await uploadToIPFS(metadata)
const tokenURI = `ipfs://${metadataCID}`
```

## Error Handling

The implementation includes comprehensive error handling:

- **Wallet connection errors**
- **Transaction failures**
- **Network issues**
- **Gas estimation errors**

## Testing

### Development Testing
- Use mock contracts for development
- Test with testnet contracts
- Validate transaction flows

### Production Testing
- Deploy to testnet first
- Test with small amounts
- Validate all contract interactions

## Security Considerations

1. **Never store private keys on the server**
2. **Validate all user inputs**
3. **Use proper error handling**
4. **Implement rate limiting**
5. **Validate contract addresses**

## Future Enhancements

1. **Batch minting** for multiple riffs
2. **Gas optimization** strategies
3. **Transaction batching**
4. **Advanced metadata standards**
5. **Cross-chain compatibility**

## Troubleshooting

### Common Issues

1. **"No signer available"**
   - Ensure wallet is connected
   - Check wallet provider

2. **Transaction fails**
   - Check gas estimation
   - Validate contract addresses
   - Ensure sufficient balance

3. **Contract not found**
   - Verify contract addresses
   - Check network configuration
   - Validate ABI compatibility

### Debug Mode
Enable debug logging:
```typescript
console.log("Contract interaction:", { tokenId, contractAddress })
```

## Conclusion

This frontend minting approach provides the best balance of security, user experience, and industry compliance. It follows established Web3 patterns and ensures users maintain full control over their transactions. 