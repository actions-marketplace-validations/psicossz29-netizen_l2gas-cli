#!/usr/bin/env node

const { getAllChainsGas, getChainGas, CHAINS } = require('../lib/index');

const SUPPORT_WALLET_EVM = "0x720ffce9834B4e83eBf63b6B9f142B8B77f54281";
const SUPPORT_WALLET_SOL = "2DLPwCgHCKyFuAbzJ4APCsiMy9GcztXavk94wtW6uxpV";

async function main() {
    const args = process.argv.slice(2);
    const isJson = args.includes('--json');
    const chainArg = args.find(a => !a.startsWith('-'))?.toLowerCase();

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Usage: l2gas [options] [chain]

Chains:
  base       Query Base L2 gas
  arbitrum   Query Arbitrum One gas
  polygon    Query Polygon PoS gas

Options:
  --json     Output results as formatted JSON
  --help     Show this message

Donations & Support:
  EVM (Base/Polygon): ${SUPPORT_WALLET_EVM}
  Solana:             ${SUPPORT_WALLET_SOL}
`);
        process.exit(0);
    }

    try {
        let data;
        if (chainArg && CHAINS[chainArg]) {
            data = [await getChainGas(chainArg)];
        } else {
            data = await getAllChainsGas();
        }

        if (isJson) {
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                chains: data,
                support_wallet: SUPPORT_WALLET_EVM
            }, null, 2));
            return;
        }

        console.log('\n===============================================================');
        console.log('  ⚡ L2GAS | REAL-TIME L2 GAS & TRANSFER COST TRACKER');
        console.log('===============================================================\n');

        console.log('Chain               Gas (Gwei)      Est. Transfer ($)     Block');
        console.log('---------------------------------------------------------------');

        for (const item of data) {
            if (item.status === 'ONLINE') {
                const chainName = item.chain.padEnd(18, ' ');
                const gas = `${item.gasPriceGwei} Gwei`.padEnd(16, ' ');
                const cost = `$${item.transferCostUsd}`.padEnd(22, ' ');
                const block = `#${item.blockNumber}`;
                console.log(`${chainName}  ${gas}  ${cost}  ${block}`);
            } else {
                console.log(`${item.chain.padEnd(18, ' ')}  [DEGRADED: ${item.error}]`);
            }
        }

        console.log('\n---------------------------------------------------------------');
        console.log('☕ Support Autonomous Genesis Node Development:');
        console.log(`   EVM (Base/Polygon/Arbitrum): ${SUPPORT_WALLET_EVM}`);
        console.log(`   Solana:                     ${SUPPORT_WALLET_SOL}`);
        console.log('===============================================================\n');

    } catch (err) {
        console.error('[ERROR]', err.message);
        process.exit(1);
    }
}

main();
