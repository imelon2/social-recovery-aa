import { Web3AuthProvider } from "@web3auth/modal/react"
import web3AuthContextConfig from "../config/web3AuthContextConfig"
import { CONNECTOR_STATUS_TYPE, Web3Auth } from "@web3auth/modal"
import { useEffect, useState } from "react";
import RPC from "../libs/viemRPC"



let web3auth: Web3Auth
if (typeof window !== "undefined") {
    // privateKeyProvider = new EthereumPrivateKeyProvider({
    //     config: { chainConfig }
    // });


    web3auth = new Web3Auth(
        web3AuthContextConfig.web3AuthOptions
    );


}

function Web3AuthWithAA() {
    const [, setWeb3AuthStatus] = useState<CONNECTOR_STATUS_TYPE>("not_ready")

    useEffect(() => {
        const init = async () => {
            if (web3auth.status === "not_ready") {
                await web3auth.init();
            }
            setWeb3AuthStatus("ready")
        }

        init()
    }, [])


    const login = async () => {
        await web3auth.connect();
    }

    const logout = async () => {
        await web3auth.logout()
    }


    const getAccounts = async () => {
        if (!web3auth.provider) {
            console.log("No Provider");
            return
        }

        const address = await RPC.getAccounts(web3auth.provider);
        console.log(address);

    };

    const getBalance = async () => {
        if (!web3auth.provider) {
            console.log("No Provider");
            return
        }
        const balance = await RPC.getBalance(web3auth.provider);
        console.log(balance);

    };

    const sendTransaction = async () => {
        if (!web3auth.provider) {
            console.log("No Provider");
            return
        }

        console.log("Sending Transaction...");
        const transactionReceipt = await RPC.sendTransaction(web3auth.provider);
        console.log(transactionReceipt);
    };

    const getUserInfo = async () => {
        if (!web3auth.provider) {
            console.log("No Provider");
            return
        }

        // IMP START - Get User Information
        const user = await web3auth.getUserInfo();
        // IMP END - Get User Information
        console.log(user);
    };

    const getChainId = async () => {
        if (!web3auth.provider) {
            console.log("No Provider");
            return
        }

        // IMP START - Get User Information
        const chainId = await RPC.getChainId(web3auth.provider);
        console.log(chainId);
        // IMP END - Get User Information
    }
    return (
        <Web3AuthProvider config={web3AuthContextConfig}>
            <button onClick={login} >Login</button>
            <button onClick={logout} >Logout</button>
            <button onClick={getChainId} >getChainId</button>
            <button onClick={getAccounts} >getAccounts</button>
            <button onClick={getBalance} >getBalance</button>
            <button onClick={sendTransaction} >sendTransaction</button>
            <button onClick={getUserInfo} >getUserInfo</button>
        </Web3AuthProvider>
    )
}

export default Web3AuthWithAA