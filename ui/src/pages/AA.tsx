import { createWalletClient, custom, http } from "viem"
import { toAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains"
import { createSmartAccountClient, toNexusAccount } from "@biconomy/abstractjs";
import { BUNDLER_URL } from "../config/aaContextConfig";

declare global {
    interface Window {
        ethereum?: any;
    }
}


function AA() {

    const connect = async () => {
        if (!window.ethereum) {
            alert("MetaMask가 설치되어 있지 않습니다.");
            return;
        }

        const client = createWalletClient({
            chain: arbitrumSepolia,
            transport: custom(window.ethereum)
        })
        const [address] = await client.requestAddresses() 
        // const [address] = await client.getAddresses()

        console.log(address);
        
        // 3. Viem Account 객체로 변환
        const account = toAccount(address);

        // const nexusAccount = await toNexusAccount({
        //     signer: client,
        //     chain: arbitrumSepolia,
        //     transport: http(), // bundler 미사용시
        // });

        toAccount(address)
        const nexusClient = createSmartAccountClient({ 
            account: await toNexusAccount({ 
              signer: account, 
              chain: arbitrumSepolia, 
              transport: http(), 
            }),
            transport: http(BUNDLER_URL), 
          });
    }
    return (
        <button onClick={connect} >connect</button>

    )
}

export default AA