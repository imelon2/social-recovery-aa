import { type Web3AuthContextConfig } from "@web3auth/modal/react";
import { WEB3AUTH_NETWORK, type Web3AuthOptions } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";


const web3AuthClientId = "BEL6pVtzyXtd1jtF7CEZt69Nb853eYK7UJjasRc8CU-TV704KLAw-v5i02jEeoq-rWKQZPBH5M4iJodbOeAba84"; // get from https://dashboard.web3auth.io

const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x66eee", // Base Sepolia
    rpcTarget: "https://api.web3auth.io/infura-service/v1/0x66eee/BEL6pVtzyXtd1jtF7CEZt69Nb853eYK7UJjasRc8CU-TV704KLAw-v5i02jEeoq-rWKQZPBH5M4iJodbOeAba84",
    displayName: "Arbitrum Sepolia",
    blockExplorerUrl: "https://sepolia.arbiscan.io",
    ticker: "ETH",
    tickerName: "Arbitrum Sepolia Ether",
    logo: "https://images.web3auth.io/chains/42161.svg"
};

const web3AuthOptions: Web3AuthOptions = {
  clientId: web3AuthClientId, // Get your Client ID from Web3Auth Dashboard
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // or WEB3AUTH_NETWORK.SAPPHIRE_DEVNET
  chains:[chainConfig],
  defaultChainId:"0x66eee"
};
  
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions,
};

export default web3AuthContextConfig;