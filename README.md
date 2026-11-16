# Ammora Launchpad

A decentralized token launchpad built on top of the **Ammora Protocol SDK** for the **GIWA Sepolia** testnet. This web application allows users to connect their browser wallet, explore live token launches, and deploy new tokens directly through Ammora's launch registry.

## Features
- **Live Launch Feed:** Fetches and displays active token launches in real time using Ammora's Data API with direct block explorer links.
- **Wallet Integration:** Seamless browser wallet connection (e.g., MetaMask) with automatic network switching to **GIWA Sepolia (Chain ID: 91342)**.
- **Token Creation:** Interactive launch form powered by `ALCClient` that reads enabled configurations from the Ammora registry to build and submit token launch transactions.

## Tech Stack
- **Frontend:** React, TypeScript, Vite
- **Web3 / Protocol:** Ammora Protocol SDK, EVM Wallet Provider

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
Run the development server:

Bash
npm run dev
Build for production:

Bash
npm run build
