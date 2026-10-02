# l2gas ⚡

> Zero-dependency CLI to check **real-time gas prices and transfer costs** on Base, Arbitrum, and Polygon L2 networks — directly from your terminal.

[![npm version](https://img.shields.io/npm/v/l2gas)](https://www.npmjs.com/package/l2gas)
[![npm downloads](https://img.shields.io/npm/dm/l2gas)](https://www.npmjs.com/package/l2gas)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js ≥18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

## Why l2gas?

- **Zero dependencies** — uses native Node.js `fetch` (Node 18+). Nothing to install but the package itself.
- **Real data** — queries public RPC endpoints directly, no API key required.
- **Instant** — all 3 chains queried in parallel, results in under 2 seconds.
- **Scriptable** — `--json` flag for piping into other tools.

## Install

```bash
npm install -g l2gas
```

## Usage

```bash
# Check all chains at once
l2gas

# Check a specific chain
l2gas base
l2gas arbitrum
l2gas polygon

# JSON output (for scripts, CI, dashboards)
l2gas --json
l2gas base --json
```

## Example Output

```
===============================================================
  ⚡ L2GAS | REAL-TIME L2 GAS & TRANSFER COST TRACKER
===============================================================

Chain               Gas (Gwei)      Est. Transfer ($)     Block
---------------------------------------------------------------
Base                0.006 Gwei        $0.00031              #52065623
Arbitrum One        0.020 Gwei        $0.00105              #510896438
Polygon PoS         248.4 Gwei        $0.00209              #94810303
---------------------------------------------------------------
```

## JSON Mode

```bash
l2gas --json
```

```json
{
  "timestamp": "2026-10-02T05:48:00.000Z",
  "chains": [
    {
      "chain": "Base",
      "chainId": 8453,
      "currency": "ETH",
      "gasPriceGwei": 0.006,
      "transferCostNative": "0.00000013",
      "transferCostUsd": 0.00031,
      "blockNumber": 52065623,
      "status": "ONLINE"
    }
  ]
}
```

## Use as a Library

```js
const { getChainGas, getAllChainsGas } = require('l2gas');

// Single chain
const base = await getChainGas('base');
console.log(base.gasPriceGwei, base.transferCostUsd);

// All chains in parallel
const all = await getAllChainsGas();
all.forEach(c => console.log(c.chain, c.transferCostUsd));
```

## Supported Chains

| Chain | RPC | ChainId |
|---|---|---|
| Base | `mainnet.base.org` | 8453 |
| Arbitrum One | `arb1.arbitrum.io/rpc` | 42161 |
| Polygon PoS | `polygon-bor-rpc.publicnode.com` | 137 |

## Support

If this tool saves you time, consider a tip — it runs fully autonomously with no backend costs:

- **EVM (Base / Arbitrum / Polygon):** `0x720ffce9834B4e83eBf63b6B9f142B8B77f54281`
- **Solana:** `2DLPwCgHCKyFuAbzJ4APCsiMy9GcztXavk94wtW6uxpV`

## License

MIT
