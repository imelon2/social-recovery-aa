import { Web3AuthProvider } from "@web3auth/modal/react"
import web3AuthContextConfig from "../config/web3AuthContextConfig"
import { CONNECTOR_STATUS_TYPE, Web3Auth } from "@web3auth/modal"
import { useEffect, useState } from "react";
import RPC from "../libs/viemWeb3AuthRPC"
import { createBicoPaymasterClient, createSmartAccountClient, NexusClient, toNexusAccount } from "@biconomy/abstractjs";
import { Address, createPublicClient, createWalletClient, custom, decodeFunctionResult, encodeFunctionData, http, parseAbi, parseEther, PublicClient } from "viem";
import { arbitrumSepolia } from "viem/chains";
import { BICONOMY_PAYMASTER_ADDRESS, BICONOMY_PAYMASTER_DEPOSIT_ADDRESS, BUNDLER_URL, PAYMASTER_URL } from "../config/aaContextConfig";
import { IAddressComponentProps } from "../libs/types";
import { formatEther } from "ethers";
import AddressComponent from "../components/AddressComponent";
import CircularIndeterminate from "../components/CircularIndeterminate";



let web3auth: Web3Auth

if (typeof window !== "undefined") {
    web3auth = new Web3Auth(
        web3AuthContextConfig.web3AuthOptions
    );


}

function Web3AuthWithAA() {
    const [, setWeb3AuthStatus] = useState<CONNECTOR_STATUS_TYPE>("not_ready")
    const [addressInfo, setAddressInfo] = useState<IAddressComponentProps[]>([]);
    const [nexusClient, setNexusClient] = useState<NexusClient>();
    const [publicClient, setPublicClient] = useState<PublicClient>();
    const [loading, setLoading] = useState({
        loginState: false,
        getBalanceState: false,
        sendAaState: false,
        sendState: false,
    })

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
        try {
            setLoading({ ...loading, loginState: true })

            const provider = await web3auth.connect()

            // Create Client
            const client = createPublicClient({
                transport: custom(provider!),
                chain: arbitrumSepolia,
            });
            setPublicClient(client);

            // Create Wallet
            const address = await RPC.getAccounts(provider!);
            const walletClient = createWalletClient({
                transport: custom(provider!),
                account: address[0] as Address,
                chain: arbitrumSepolia
            });

            // Create Nexus Client
            const _nexusClient = createSmartAccountClient({
                account: await toNexusAccount({
                    signer: walletClient,
                    chain: arbitrumSepolia,
                    transport: http(),
                }),
                transport: http(BUNDLER_URL),
                paymaster: createBicoPaymasterClient({ paymasterUrl: PAYMASTER_URL }),

            });
            setNexusClient(_nexusClient);


            // getBalance
            const EOABalance = await client.getBalance({ address: walletClient.account.address });
            const smartAccountBalance = await client.getBalance({
                address: _nexusClient.account.address,
            });
            const PMBalance = await getPaymasterBalance()
            setAddressInfo([
                {
                    address: walletClient.account.address,
                    balance: formatEther(EOABalance),
                    tag: "EOA",
                },
                {
                    address: _nexusClient.account.address,
                    balance: formatEther(smartAccountBalance),
                    tag: "AA",
                },
                {
                    address: BICONOMY_PAYMASTER_DEPOSIT_ADDRESS,
                    balance: formatEther(PMBalance!),
                    tag: "PM",
                },
            ]);
        } catch (error) {
            alert(error)
            setLoading({ ...loading, loginState: false })
        } finally {
            setLoading({ ...loading, loginState: false })
        }
    }

    const logout = async () => {
        await web3auth.logout()
        setWeb3AuthStatus(web3auth.status)
    }

    const getBalance = async () => {
        try {
            setLoading({ ...loading, getBalanceState: true })
            if (!publicClient) {
                return;
            }


            const EOABalance = await publicClient.getBalance({ address: addressInfo[0].address });
            const smartAccountBalance = await publicClient.getBalance({
                address: addressInfo[1].address,
            });
            const PMBalance = await getPaymasterBalance()


            setAddressInfo([
                {
                    address: addressInfo[0].address,
                    balance: formatEther(EOABalance),
                    tag: "EOA",
                },
                {
                    address: addressInfo[1].address,
                    balance: formatEther(smartAccountBalance),
                    tag: "AA",
                },
                {
                    address: BICONOMY_PAYMASTER_DEPOSIT_ADDRESS,
                    balance: formatEther(PMBalance!),
                    tag: "PM",
                },
            ]);

        } catch (error) {
            alert(error)
            setLoading({ ...loading, getBalanceState: false })
        } finally {
            console.log(web3auth.status);
            setLoading({ ...loading, getBalanceState: false })
        }
    };

    const getPaymasterBalance = async () => {
        if (!publicClient) {
            return;
        }
        const abi = parseAbi(['function getBalance(address) view returns (uint256)'])

        const result = await publicClient?.call({
            to: BICONOMY_PAYMASTER_ADDRESS,
            data: encodeFunctionData({
                abi,
                functionName: "getBalance",
                args: [BICONOMY_PAYMASTER_DEPOSIT_ADDRESS]
            })
        })

        return decodeFunctionResult({
            abi,
            functionName: 'getBalance',
            data: result.data!,
        }) as bigint;
    }

    const sendTransaction = async () => {
        try {
            setLoading({ ...loading, sendState: true })

            if (!web3auth.provider) {
                console.log("No Provider");
                return
            }

            console.log("Sending Transaction...");
            const transactionReceipt = await RPC.sendTransaction(web3auth.provider);
            console.log(transactionReceipt);
        } catch (error) {
            alert(error)
            setLoading({ ...loading, sendState: false })
        } finally {
            setLoading({ ...loading, sendState: false })
        }
    };


    const sendAATransaction = async () => {
        try {
            setLoading({ ...loading, sendAaState: true })

            if (!nexusClient) {
                return;
            }

            const hash = await nexusClient.sendUserOperation({
                calls: [
                    {
                        to: "0xf5715961C550FC497832063a98eA34673ad7C816",
                        value: parseEther("0"),
                    },
                ],
            });
            console.log("Transaction hash: ", hash);
            const receipt = await nexusClient.waitForUserOperationReceipt({ hash });
            console.log("Transaction receipt: ", receipt);
        } catch (error) {
            alert(error)
            setLoading({ ...loading, sendAaState: false })
        } finally {
            setLoading({ ...loading, sendAaState: false })
        }
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

    return (
        <Web3AuthProvider config={web3AuthContextConfig}>
            <div>

                <button onClick={login} >{loading.loginState ? <CircularIndeterminate /> : "login"}</button>
                <button onClick={logout} disabled={web3auth.status !== "connected"}>Logout</button>
                <button disabled={addressInfo.length == 0} onClick={getBalance}>
                    {loading.getBalanceState ? <CircularIndeterminate /> : "getBalance"}
                </button>
                <button disabled={addressInfo.length == 0} onClick={sendTransaction}>
                    {loading.sendState ? <CircularIndeterminate /> : "sendTransaction"}
                </button>
                <button disabled={addressInfo.length == 0} onClick={sendAATransaction} > {loading.sendAaState ? <CircularIndeterminate /> : "sendAATransaction"}</button>
                <button disabled={addressInfo.length == 0} onClick={getUserInfo} >getUserInfo</button>
            </div>
            <div>
                {addressInfo.length == 0 ? (
                    <></>
                ) : (
                    <AddressComponent props={[...addressInfo]} />
                )}
            </div>
        </Web3AuthProvider>
    )
}

export default Web3AuthWithAA