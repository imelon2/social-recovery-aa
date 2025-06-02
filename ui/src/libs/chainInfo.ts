import { mainnet, sepolia, holesky, arbitrum, arbitrumNova, arbitrumSepolia } from 'viem/chains';

const supportedChains = {
    mainnet,
    sepolia,
    holesky,
    arbitrum,
    arbitrumNova,
    arbitrumSepolia,
  };
  
  export const getChainInfoFromChainId = (chainId: number) => {
    for (const chain of Object.values(supportedChains)) {
      if ('id' in chain) {
        if (chain.id === chainId) {
          return chain;
        }
      }
    }
  
    return undefined;
  };