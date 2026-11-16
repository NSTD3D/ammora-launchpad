import { createPublicClient, defineChain, http } from "viem";
import { AmmoraDataApiClient, giwaSepoliaSealed, giwaSepoliaMerged, giwaSepoliaVNext, giwaSepoliaAudited } from "@ammora-protocol/sdk";

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
// Tried in order; the first one whose registry responds with an enabled config is used.
export const launchCandidates = [
  { name: "sealed", launch: giwaSepoliaSealed.contracts.launch },
  { name: "merged", launch: giwaSepoliaMerged.contracts.launch },
  { name: "vnext", launch: giwaSepoliaVNext.contracts.launch },
  { name: "audited", launch: giwaSepoliaAudited.contracts.launch },
] as const;
