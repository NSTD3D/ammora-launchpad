import { createPublicClient, defineChain, http } from "viem";
import { AmmoraDataApiClient, giwaSepoliaVNext } from "@ammora-protocol/sdk";

export const giwaSepolia = defineChain({
  id: 91342,
  name: "GIWA Sepolia",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: { default: { http: ["https://sepolia-rpc.giwa.io"] } },
  blockExplorers: { default: { name: "GIWA Explorer", url: "https://sepolia-explorer.giwa.io" } },
});

export const publicClient = createPublicClient({ chain: giwaSepolia, transport: http() });
export const dataApi = new AmmoraDataApiClient("https://ammora-giwa-sepolia-data.fly.dev");
export const CHAIN_ID = 91_342n;
export const launchContracts = giwaSepoliaVNext.contracts.launch;
