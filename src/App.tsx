import { useCallback, useEffect, useState } from "react";
import { createWalletClient, custom, type Address } from "viem";
import { ALCClient, buildCreateALCSegmentedV3LaunchWithTokenConfig, type AmmoraLaunchSummary } from "@ammora-protocol/sdk";
import { CHAIN_ID, dataApi, giwaSepolia, launchContracts, publicClient } from "./chain";

type Eth = { request: (a: { method: string; params?: unknown[] }) => Promise<unknown> };
const eth = () => (window as unknown as { ethereum?: Eth }).ethereum;
const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;
const explorer = (path: string) => `${giwaSepolia.blockExplorers.default.url}/${path}`;

export function App() {
  const [account, setAccount] = useState<Address>();
  const [launches, setLaunches] = useState<AmmoraLaunchSummary[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", symbol: "", metadataURI: "", creatorMetadataURI: "" });

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const page = await dataApi.getLaunches({ chainId: CHAIN_ID });
      setLaunches(page.items);
    } catch (e) {
      setStatus(`Could not load launches: ${(e as Error).message}`);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const CHAIN_HEX = `0x${giwaSepolia.id.toString(16)}`;

  async function ensureChain(p: Eth) {
    try {
      await p.request({ method: "wallet_switchEthereumChain", params: [{ chainId: CHAIN_HEX }] });
    } catch {
      await p.request({ method: "wallet_addEthereumChain", params: [{
        chainId: CHAIN_HEX, chainName: giwaSepolia.name, nativeCurrency: giwaSepolia.nativeCurrency,
        rpcUrls: giwaSepolia.rpcUrls.default.http, blockExplorerUrls: [giwaSepolia.blockExplorers.default.url],
      }] });
    }
  }

  async function connect() {
    const p = eth();
    if (!p) return setStatus("No wallet found. Install MetaMask or another EVM wallet.");
    try {
      const [addr] = (await p.request({ method: "eth_requestAccounts" })) as Address[];
      setAccount(addr);
      setStatus("");
      await ensureChain(p);
    } catch (e) {
      setStatus(`Wallet error: ${(e as Error).message}. Switch MetaMask to GIWA Sepolia manually if needed.`);
    }
  }

  useEffect(() => {
    const p = eth();
    if (!p) return;
    void (p.request({ method: "eth_accounts" }) as Promise<Address[]>).then((a) => a[0] && setAccount(a[0]));
    const on = (p as unknown as { on?: (e: string, f: (a: Address[]) => void) => void }).on;
    on?.call(p, "accountsChanged", (a) => setAccount(a[0]));
  }, []);

  async function createLaunch(e: React.FormEvent) {
    e.preventDefault();
    const p = eth();
    if (!p || !account) return setStatus("Connect your wallet first.");
    try {
      setStatus("Reading the live launch config…");
      const alc = new ALCClient(publicClient, launchContracts.factory, launchContracts.configRegistry, { trustCurveAddress: true });
      const { items } = await alc.listConfigs({ limit: 16 });
      const cfg = items.find((c) => c.enabled);
      if (!cfg) throw new Error("No enabled launch config on the registry.");
      const tx = await alc.planLaunchWithTokenConfigFromConfig({
        factory: launchContracts.factory,
        name: form.name, symbol: form.symbol,
        metadataURI: form.metadataURI || "ipfs://",
        creatorMetadataURI: form.creatorMetadataURI || "ipfs://",
        configId: cfg.configId, tokenDecimals: 9,
      });
      setStatus("Confirm in your wallet…");
      const wallet = createWalletClient({ account, chain: giwaSepolia, transport: custom(p) });
      const hash = await wallet.sendTransaction({ to: launchContracts.factory, data: tx.data, value: tx.value });
      setStatus(`Sent: ${hash}`);
      await publicClient.waitForTransactionReceipt({ hash });
      setStatus(`Launched. Tx ${short(hash)} confirmed. The list updates once the indexer catches up.`);
      setTimeout(() => void refresh(), 8000);
    } catch (err) {
      setStatus(`Launch failed: ${(err as Error).message.split("\n")[0]}`);
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });
  void buildCreateALCSegmentedV3LaunchWithTokenConfig;

  return (
    <main>
      <header>
        <h1>Launchpad</h1>
        <p>Create tokens on bonding curves with the Ammora SDK. GIWA Sepolia testnet.</p>
        <button onClick={connect}>{account ? short(account) : "Connect wallet"}</button>
      </header>

      <section>
        <h2>Launch a token</h2>
        <form onSubmit={createLaunch}>
          <input required placeholder="Token name" value={form.name} onChange={set("name")} />
          <input required placeholder="Symbol" maxLength={10} value={form.symbol} onChange={set("symbol")} />
          <input placeholder="Metadata URI (ipfs://…)" value={form.metadataURI} onChange={set("metadataURI")} />
          <input placeholder="Creator metadata URI (optional)" value={form.creatorMetadataURI} onChange={set("creatorMetadataURI")} />
          <button type="submit" disabled={!account}>Launch token</button>
        </form>
        {status && <p className="status">{status}</p>}
      </section>

      <section>
        <h2>Live launches</h2>
        {loading ? <p>Loading…</p> : launches.length === 0 ? <p>No launches yet. Create the first one above.</p> : (
          <ul>
            {launches.map((l) => (
              <li key={l.id}>
                <a href={explorer(`address/${l.address}`)} target="_blank" rel="noreferrer">{short(l.address)}</a>
                <span>{l.status.replace("_", " ").toLowerCase()}</span>
                <span>by {short(l.creatorAddress)}</span>
                <a href={explorer(`tx/${l.createdTxHash}`)} target="_blank" rel="noreferrer">tx</a>
              </li>
            ))}
          </ul>
        )}
      </section>
      <footer>Testnet only. Built with @ammora-protocol/sdk.</footer>
    </main>
  );
}
