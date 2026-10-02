// Zero-dependency L2 gas tracker using native Fetch
const CHAINS = {
    base: {
        name: 'Base',
        chainId: 8453,
        rpc: 'https://mainnet.base.org',
        currency: 'ETH',
        priceUsdEst: 2500
    },
    arbitrum: {
        name: 'Arbitrum One',
        chainId: 42161,
        rpc: 'https://arb1.arbitrum.io/rpc',
        currency: 'ETH',
        priceUsdEst: 2500
    },
    polygon: {
        name: 'Polygon PoS',
        chainId: 137,
        rpc: 'https://polygon-bor-rpc.publicnode.com',
        currency: 'POL',
        priceUsdEst: 0.40
    }
};

async function rpcFetch(rpcUrl, method, params = []) {
    const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data.result;
}

async function getChainGas(chainKey) {
    const config = CHAINS[chainKey];
    if (!config) throw new Error(`Unknown chain: ${chainKey}`);

    try {
        const [gasPriceHex, block] = await Promise.all([
            rpcFetch(config.rpc, 'eth_gasPrice'),
            rpcFetch(config.rpc, 'eth_getBlockByNumber', ['latest', false])
        ]);

        const gasPriceWei = BigInt(gasPriceHex);
        const gasPriceGwei = (Number(gasPriceWei) / 1e9).toFixed(4);
        
        // Standard transfer = 21,000 gas
        const transferWei = gasPriceWei * 21000n;
        const transferEth = Number(transferWei) / 1e18;
        const transferUsd = (transferEth * config.priceUsdEst).toFixed(5);

        return {
            chain: config.name,
            chainId: config.chainId,
            currency: config.currency,
            gasPriceGwei: parseFloat(gasPriceGwei),
            transferCostNative: transferEth.toFixed(8),
            transferCostUsd: parseFloat(transferUsd),
            blockNumber: parseInt(block.number, 16),
            status: 'ONLINE'
        };
    } catch (err) {
        return {
            chain: config.name,
            chainId: config.chainId,
            status: 'ERROR',
            error: err.message
        };
    }
}

async function getAllChainsGas() {
    const keys = Object.keys(CHAINS);
    const results = await Promise.all(keys.map(k => getChainGas(k)));
    return results;
}

module.exports = {
    CHAINS,
    getChainGas,
    getAllChainsGas
};
