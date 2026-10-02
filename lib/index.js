// Zero-dependency L2 gas tracker using native Fetch (Node 18+)
const CHAINS = {
    base: {
        name: 'Base',
        chainId: 8453,
        rpc: 'https://mainnet.base.org',
        currency: 'ETH',
        priceUsdEst: 2500,
        layer: 'OP Stack'
    },
    arbitrum: {
        name: 'Arbitrum One',
        chainId: 42161,
        rpc: 'https://arb1.arbitrum.io/rpc',
        currency: 'ETH',
        priceUsdEst: 2500,
        layer: 'Nitro'
    },
    optimism: {
        name: 'Optimism',
        chainId: 10,
        rpc: 'https://mainnet.optimism.io',
        currency: 'ETH',
        priceUsdEst: 2500,
        layer: 'OP Stack'
    },
    polygon: {
        name: 'Polygon PoS',
        chainId: 137,
        rpc: 'https://polygon-bor-rpc.publicnode.com',
        currency: 'POL',
        priceUsdEst: 0.40,
        layer: 'PoS'
    },
    linea: {
        name: 'Linea',
        chainId: 59144,
        rpc: 'https://rpc.linea.build',
        currency: 'ETH',
        priceUsdEst: 2500,
        layer: 'zkEVM'
    },
    scroll: {
        name: 'Scroll',
        chainId: 534352,
        rpc: 'https://rpc.scroll.io',
        currency: 'ETH',
        priceUsdEst: 2500,
        layer: 'zkEVM'
    },
    zksync: {
        name: 'zkSync Era',
        chainId: 324,
        rpc: 'https://mainnet.era.zksync.io',
        currency: 'ETH',
        priceUsdEst: 2500,
        layer: 'zkRollup'
    }
};

async function rpcFetch(rpcUrl, method, params = []) {
    const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        signal: AbortSignal.timeout(8000)
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
}

async function getChainGas(chainKey) {
    const config = CHAINS[chainKey];
    if (!config) throw new Error(`Unknown chain: ${chainKey}. Available: ${Object.keys(CHAINS).join(', ')}`);

    try {
        const [gasPriceHex, block] = await Promise.all([
            rpcFetch(config.rpc, 'eth_gasPrice'),
            rpcFetch(config.rpc, 'eth_getBlockByNumber', ['latest', false])
        ]);

        const gasPriceWei = BigInt(gasPriceHex);
        const gasPriceGwei = (Number(gasPriceWei) / 1e9).toFixed(4);

        // Standard transfer = 21,000 gas
        const transferWei = gasPriceWei * 21000n;
        const transferNative = Number(transferWei) / 1e18;
        const transferUsd = (transferNative * config.priceUsdEst).toFixed(6);

        return {
            chain: config.name,
            chainId: config.chainId,
            layer: config.layer,
            currency: config.currency,
            gasPriceGwei: parseFloat(gasPriceGwei),
            gasPriceWei: gasPriceWei.toString(),
            transferCostNative: transferNative.toFixed(8),
            transferCostUsd: parseFloat(transferUsd),
            blockNumber: parseInt(block.number, 16),
            timestamp: Date.now(),
            status: 'ONLINE'
        };
    } catch (err) {
        return {
            chain: config.name,
            chainId: config.chainId,
            layer: config.layer,
            status: 'ERROR',
            error: err.message
        };
    }
}

async function getAllChainsGas(chainKeys) {
    const keys = chainKeys || Object.keys(CHAINS);
    const results = await Promise.all(keys.map(k => getChainGas(k)));
    return results;
}

module.exports = { CHAINS, getChainGas, getAllChainsGas };
