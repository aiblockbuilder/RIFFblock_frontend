# Token Approval Troubleshooting Guide

## Issue: "ERC20: insufficient allowance" Error

If you encounter this error when trying to stake RIFF tokens, it means the staking contract doesn't have permission to spend your RIFF tokens.

## What Causes This Error?

1. **First-time staking**: You need to approve the staking contract to spend your tokens
2. **Insufficient approval amount**: Your previous approval was for a smaller amount than you're trying to stake
3. **Network issues**: The approval transaction may not have been confirmed properly
4. **Wallet issues**: Your wallet may have rejected the approval transaction

## How to Fix

### Method 1: Use the Debug Tool (Recommended)

1. Look for the **"Debug Token Approval"** button in the top-right corner of the Market page
2. Click it to open the token approval debugger
3. Click **"Check Allowance"** to see your current approval status
4. Enter the amount you want to approve (e.g., 1000000 for 1M RIFF tokens)
5. Click **"Approve Tokens"** and confirm the transaction in your wallet
6. Wait for the transaction to be confirmed
7. Try staking again

### Method 2: Manual Wallet Approval

1. Open your wallet (MetaMask, etc.)
2. Go to the **"Activity"** or **"History"** tab
3. Look for any pending approval transactions and confirm them
4. If no pending transactions, you may need to manually approve the staking contract

### Method 3: Reset Approval

If the above methods don't work:

1. Use the debug tool to approve a very large amount (e.g., 999999999 RIFF)
2. This will effectively give unlimited approval to the staking contract
3. Try staking again

## Prevention Tips

1. **Always confirm approval transactions** in your wallet
2. **Wait for transaction confirmations** before proceeding
3. **Use sufficient gas fees** to ensure transactions are processed
4. **Keep some MATIC** in your wallet for gas fees

## Common Issues

### "Transaction Rejected by User"
- You may have accidentally rejected the approval transaction
- Try the approval process again

### "Insufficient Funds for Gas"
- Make sure you have enough MATIC tokens for gas fees
- Try reducing the approval amount

### "Transaction Pending"
- Wait for the transaction to be confirmed on the blockchain
- Check your wallet's transaction history

## Technical Details

- **Staking Contract Address**: `0xCf04c4C46744F867D301E4243AF89A58ffFb1292`
- **RIFF Token Address**: `0x963c4c0090831fcadba1fb7163efdde582f8de94`
- **Network**: Polygon Amoy Testnet

## Still Having Issues?

1. Check that you're connected to the correct network (Polygon Amoy Testnet)
2. Ensure you have sufficient RIFF tokens in your wallet
3. Try refreshing the page and reconnecting your wallet
4. Contact support if the issue persists

## Minimum Stake Requirements

- **Minimum stake amount**: 100,000 RIFF tokens
- **Maximum stake amount**: Varies by riff (check the staking modal)
- **Lock period**: 90 days (cannot withdraw early) 