# l2gas ⚡

> Zero-dependency CLI and GitHub Action to monitor **real-time gas prices & transfer costs** across the Superchain and L2 ecosystems (Base, OP Mainnet, Arbitrum, Linea, Scroll, Polygon, zkSync Era) — with automated CI/CD threshold protection.

[![npm version](https://img.shields.io/npm/v/@psicossz/l2gas)](https://www.npmjs.com/package/@psicossz/l2gas)
[![npm downloads](https://img.shields.io/npm/dm/@psicossz/l2gas)](https://www.npmjs.com/package/@psicossz/l2gas)
[![Optimism Atlas](https://img.shields.io/badge/Optimism%20Atlas-Verified%20Project-FF0420?logo=optimism&logoColor=white)](https://atlas.optimism.io/project/0xce87ab3d255716619560dc4e70c62f9b74eade5cb554d68a46aaa3a4fc7525b9)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-L2%20Gas%20Check-blue?logo=github)](https://github.com/marketplace/actions/l2-gas-check)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Node.js ≥18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org)

---

## Why l2gas?

- **Zero dependencies** — pure Node.js 18+ native `fetch`, `AbortSignal.timeout`, and `BigInt` math.
- **Direct RPC Queries** — reads public JSON-RPC nodes directly in parallel, zero API keys required.
- **CI/CD Threshold Gate** — `--threshold=<gwei>` returns exit code `1` if gas surges, automatically pausing contract deploys.
- **Fast & Parallel** — all 7 chains queried simultaneously in <2 seconds.
- **Marketplace Composite Action** — plug-and-play into any GitHub Actions pipeline with zero installation overhead.

---

## Quick Start (No Install)

Run instantly with `npx`:

```bash
npx @psicossz/l2gas
```

### Global Install

```bash
npm install -g @psicossz/l2gas
l2gas
```

---

## Usage

```bash
# Check all 7 supported L2 networks
l2gas

# Query specific networks
l2gas base arbitrum optimism

# Output formatted JSON for automation / jq piping
l2gas --json
l2gas base --json

# CI/CD Gas Gate: exit with code 1 if ANY queried chain exceeds 0.05 Gwei
l2gas base arbitrum --threshold=0.05

# Continuous Watch Mode (refreshes every 30 seconds)
l2gas --watch
```

---

## Output Example

```text
╔══════════════════════════════════════════════════════════════╗
║  ⚡ L2GAS v1.1.1 | REAL-TIME L2 GAS & TRANSFER COSTS        ║
╚══════════════════════════════════════════════════════════════╝

Chain               Tech          Gas (Gwei)    Transfer ($)   Block
──────────────────────────────────────────────────────────────────
Base                OP Stack      0.006 Gwei      $0.000315    #52067080
Arbitrum One        Nitro         0.020 Gwei      $0.001050    #510906381
Optimism            OP Stack      0.001 Gwei      $0.000053    #157661493
Polygon PoS         PoS           304.3 Gwei      $0.002556    #94811082
Linea               zkEVM         0.263 Gwei      $0.013839    #32207812
Scroll              zkEVM         0.0001 Gwei     $0.000006    #35249012
zkSync Era          zkRollup      0.045 Gwei      $0.002376    #72300380
──────────────────────────────────────────────────────────────────
```

---

## 🤖 GitHub Actions Integration

Protect your deploy scripts from burning gas during onchain spikes.

### Using the Composite Action

```yaml
# .github/workflows/deploy.yml
name: Smart Contract Deploy

on:
  push:
    branches: [main]

jobs:
  gas-check:
    name: Verify Gas Before Deploying
    runs-on: ubuntu-latest
    steps:
      - name: Check L2 Gas Threshold
        uses: psicossz29-netizen/l2gas-cli@v1
        with:
          chains: 'base arbitrum'
          max-gwei: '0.05'
          fail-on-exceed: 'true'

  deploy:
    name: Deploy to Mainnet
    needs: gas-check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy Contracts
        run: npx hardhat run scripts/deploy.js --network base
```

---

## Programmatic Library Usage

```bash
npm install @psicossz/l2gas
```

```javascript
const { getChainGas, getAllChainsGas } = require('@psicossz/l2gas');

// Query single chain
const baseGas = await getChainGas('base');
console.log(`Base Gas: ${baseGas.gasPriceGwei} Gwei | Est Transfer: $${baseGas.transferCostUsd}`);

// Query subset in parallel
const superchain = await getAllChainsGas(['base', 'optimism']);
superchain.forEach(chain => {
  console.log(`${chain.chain}: ${chain.gasPriceGwei} Gwei`);
});
```

---

## Supported Networks

| Network | Tech Stack | Chain ID | Public RPC Endpoint |
|---|---|---|---|
| **Base** | OP Stack | `8453` | `https://mainnet.base.org` |
| **Optimism** | OP Stack | `10` | `https://mainnet.optimism.io` |
| **Arbitrum One** | Nitro | `42161` | `https://arb1.arbitrum.io/rpc` |
| **Polygon PoS** | PoS | `137` | `https://polygon-bor-rpc.publicnode.com` |
| **Linea** | zkEVM | `59144` | `https://rpc.linea.build` |
| **Scroll** | zkEVM | `534352` | `https://rpc.scroll.io` |
| **zkSync Era** | zkRollup | `324` | `https://mainnet.era.zksync.io` |

---

## Public Goods & Grant Attribution

- **Optimism Atlas ID:** [`0xce87ab3d255716619560dc4e70c62f9b74eade5cb554d68a46aaa3a4fc7525b9`](https://atlas.optimism.io/project/0xce87ab3d255716619560dc4e70c62f9b74eade5cb554d68a46aaa3a4fc7525b9)
- **EVM Grant / Governance Address:** `0x7e42646289Fcc0eAdfFb820B3b5aD57765eBC606`
- **Technical Writeup:** [Read on Dev.to](https://dev.to/psicossz29netizen/i-built-a-zero-dependency-cli-to-pause-deploys-when-l2-gas-spikes-288j)

---

## License

[MIT](LICENSE.md) © 2026 psicossz29-netizen
