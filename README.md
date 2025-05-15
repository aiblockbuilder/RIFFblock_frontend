# RIFFblock Frontend

A Next.js application for the RIFFblock platform - a decentralized music marketplace where artists can upload, mint, and monetize their music riffs while fans can discover, invest in, and support their favorite artists.

## Overview

The RIFFblock frontend is built with Next.js 14 using the App Router, React, TypeScript, and Tailwind CSS. It features a modern, responsive UI with interactive audio visualizations, wallet integration, and seamless API communication with the backend.

## Key Features

- **Interactive Audio Player**: Waveform visualization, playback controls
- **Wallet Integration**: Connect with MetaMask, WalletConnect, and Coinbase
- **NFT Minting**: Mint audio riffs as NFTs
- **Staking System**: Stake tokens on riffs to earn royalties
- **Artist Profiles**: Customizable artist profiles with activity feeds
- **Marketplace**: Discover and purchase riffs
- **Responsive Design**: Works on mobile, tablet, and desktop

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A modern web browser

### Installation

1. Clone the repository
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```
4. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
5. Update the environment variables in `.env`

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

```bash
npm run build
# or
yarn build
```

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: WalletConnect project ID
- `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`: Address of the NFT contract

## Technologies

- **Next.js**: React framework for server-rendered applications
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: UI component library
- **Web3.js**: Ethereum JavaScript API
- **Ethers.js**: Ethereum wallet implementation
- **Framer Motion**: Animation library
- **Howler.js**: Audio library
