#!/usr/bin/env node

const { getAllChainsGas, getChainGas, CHAINS } = require('../lib/index');

const SUPPORT_WALLET_EVM = '0x720ffce9834B4e83eBf63b6B9f142B8B77f54281';
const SUPPORT_WALLET_SOL = '2DLPwCgHCKyFuAbzJ4APCsiMy9GcztXavk94wtW6uxpV';
const VERSION = '1.1.1';

const CHAIN_ALIASES = {
    op: 'optimism', eth: 'base', zk: 'zksync', 'zksync-era': 'zksync'
};

async function main() {
    const args = process.argv.slice(2);
    const isJson = args.includes('--json');
    const isWatch = args.includes('--watch');
    const thresholdArg = args.find(a => a.startsWith('--threshold=') || a.startsWith('--max-gwei='));
    const threshold = thresholdArg ? parseFloat(thresholdArg.split('=')[1]) : null;
    const chainArgs = args.filter(a => !a.startsWith('-'));
    const resolvedChains = chainArgs.map(c => CHAIN_ALIASES[c] || c).filter(c => CHAINS[c]);

    if (args.includes('--version') || args.includes('-v')) {
        console.log(`@psicossz/l2gas v${VERSION}`);
        process.exit(0);
    }

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
@psicossz/l2gas v${VERSION} — Real-time L2 gas & transfer cost tracker

Usage: l2gas [chains...] [options]

Chains (default: all):
  base       Base (OP Stack)          #8453
  arbitrum   Arbitrum One (Nitro)     #42161
  optimism   Optimism (OP Stack)      #10
  polygon    Polygon PoS              #137
  linea      Linea (zkEVM)            #59144
  scroll     Scroll (zkEVM)           #534352
  zksync     zkSync Era (zkRollup)    #324

Options:
  --json               Output as JSON (CI/scripting friendly)
  --threshold=<gwei>   Exit code 1 if ANY chain exceeds <gwei> (use in CI/CD)
  --max-gwei=<gwei>    Alias for --threshold
  --watch              Re-check every 30s
  --version            Show version
  --help               Show this message

Examples:
  l2gas                          # All chains
  l2gas base arbitrum            # Specific chains
  l2gas --json                   # JSON output
  l2gas --threshold=0.01         # Fail CI if gas > 0.01 Gwei
  l2gas base --threshold=0.005   # Check only Base, fail if > 0.005 Gwei

Support this tool:
  EVM (Base/Arbitrum/Polygon/Optimism): ${SUPPORT_WALLET_EVM}
  Solana:                               ${SUPPORT_WALLET_SOL}
`);
        process.exit(0);
    }

    async function runOnce() {
        const chainsToQuery = resolvedChains.length > 0 ? resolvedChains : null;

        try {
            const data = await getAllChainsGas(chainsToQuery);

            if (isJson) {
                const output = {
                    version: VERSION,
                    timestamp: new Date().toISOString(),
                    chains: data,
                    support_wallet_evm: SUPPORT_WALLET_EVM
                };
                console.log(JSON.stringify(output, null, 2));

                // Threshold check for CI
                if (threshold !== null) {
                    const exceeded = data.filter(c => c.status === 'ONLINE' && c.gasPriceGwei > threshold);
                    if (exceeded.length > 0) {
                        process.stderr.write(`[l2gas] THRESHOLD EXCEEDED: ${exceeded.map(c => `${c.chain} ${c.gasPriceGwei} Gwei`).join(', ')} > ${threshold} Gwei\n`);
                        process.exitCode = 1;
                        return;
                    }
                }
                return;
            }

            console.log('\n╔══════════════════════════════════════════════════════════════╗');
            console.log(`║  ⚡ L2GAS v${VERSION} | REAL-TIME L2 GAS & TRANSFER COSTS        ║`);
            console.log('╚══════════════════════════════════════════════════════════════╝\n');
            console.log('Chain               Tech          Gas (Gwei)    Transfer ($)   Block');
            console.log('──────────────────────────────────────────────────────────────────');

            let thresholdExceeded = false;
            for (const item of data) {
                if (item.status === 'ONLINE') {
                    const name = item.chain.padEnd(18);
                    const layer = (item.layer || '').padEnd(12);
                    const gas = `${item.gasPriceGwei} Gwei`.padEnd(14);
                    const cost = `$${item.transferCostUsd}`.padEnd(15);
                    const block = `#${item.blockNumber}`;
                    const alert = threshold && item.gasPriceGwei > threshold ? ' ⚠️ OVER THRESHOLD' : '';
                    console.log(`${name}  ${layer}  ${gas}  ${cost}  ${block}${alert}`);
                    if (threshold && item.gasPriceGwei > threshold) thresholdExceeded = true;
                } else {
                    console.log(`${item.chain.padEnd(18)}  ${'ERROR'.padEnd(12)}  [${item.error?.slice(0, 45)}]`);
                }
            }

            console.log('──────────────────────────────────────────────────────────────────');
            console.log('☕ Support: EVM ' + SUPPORT_WALLET_EVM);
            console.log('           SOL ' + SUPPORT_WALLET_SOL);
            console.log('══════════════════════════════════════════════════════════════════\n');

            if (thresholdExceeded) {
                console.error(`[l2gas] ⚠️  Gas threshold of ${threshold} Gwei exceeded — deploy paused.`);
                process.exitCode = 1;
                return;
            }
        } catch (err) {
            console.error('[l2gas ERROR]', err.message);
            process.exitCode = 1;
            return;
        }
    }

    if (isWatch) {
        console.log('[l2gas] Watch mode — refreshing every 30s. Ctrl+C to stop.\n');
        await runOnce();
        setInterval(runOnce, 30000);
    } else {
        await runOnce();
    }
}

main();
