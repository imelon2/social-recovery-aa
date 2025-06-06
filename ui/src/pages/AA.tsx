import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  http,
  parseEther,
  PublicClient,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import {
  createSmartAccountClient,
  NexusClient,
  toNexusAccount,
} from "@biconomy/abstractjs";
import { BUNDLER_URL } from "../config/aaContextConfig";
import AddressComponent from "../components/AddressComponent";
import { useState } from "react";
import { IAddressComponentProps } from "../libs/types";
import { metamask_requestAccounts } from "../libs/metamaskRPC";
import CircularIndeterminate from "../components/CircularIndeterminate";

declare global {
  interface Window {
    ethereum?: any;
  }
}

function AA() {
  const [addressInfo, setAddressInfo] = useState<IAddressComponentProps[]>([]);
  const [publicClient, setPublicClient] = useState<PublicClient>();
  const [nexusClient, setNexusClient] = useState<NexusClient>();
  const [loading,setLoading] = useState({
    connectState:false,
    getBalanceState:false,
    sendState:false,
  })

  const connect = async () => {
    try {
      setLoading({...loading,connectState:true})
  
      const addresses = await metamask_requestAccounts();
      const accountAddress = addresses[0] as `0x${string}`;
  
      // Create Client
      const client = createPublicClient({
        transport: custom(window.ethereum),
      });
      setPublicClient(client);
  
      // Create Wallet
      const walletClient = createWalletClient({
        transport: custom(window.ethereum),
        account: accountAddress,
      });
  
      // Create Nexus Client
      const _nexusClient = createSmartAccountClient({
        account: await toNexusAccount({
          signer: walletClient,
          chain: arbitrumSepolia,
          transport: http(),
        }),
        transport: http(BUNDLER_URL),
      });
      setNexusClient(_nexusClient);
  
  
      // getBalance
      const smartAccountBalance = await client.getBalance({
        address: _nexusClient.account.address,
      });
      const EOABalance = await client.getBalance({ address: accountAddress });
  
      setAddressInfo([
        {
          address: accountAddress,
          balance: formatEther(EOABalance),
          tag: "EOA",
        },
        {
          address: _nexusClient.account.address,
          balance: formatEther(smartAccountBalance),
          tag: "AA",
        },
      ]);
      
    } catch (error) {
      alert(error)
      setLoading({...loading,connectState:false})
    } finally {
      setLoading({...loading,connectState:false})
    }
  };

  const getBalance = async () => {
    try {
      setLoading({...loading,getBalanceState:true})
      if (!publicClient) {
        return;
      }
      const updatedInfo = await Promise.all(
        addressInfo.map(async (item) => {
          const balance = await publicClient.getBalance({
            address: item.address as `0x${string}`,
          });
          return {
            ...item,
            balance: formatEther(balance),
          };
        })
      );
      setAddressInfo([...updatedInfo]);
    } catch (error) {
      alert(error)
      setLoading({...loading,getBalanceState:false})
    } finally {
      setLoading({...loading,getBalanceState:false})
    }
  };

  const sendTransaction = async () => {
    try {
      setLoading({...loading,sendState:true})

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
      setLoading({...loading,sendState:false})
    } finally {
      setLoading({...loading,sendState:false})
    }
  };
  return (
    <>
      <div>
        <button onClick={connect}>{loading.connectState ? <CircularIndeterminate/> : "connect metamask"}</button>
        <button disabled={addressInfo.length == 0} onClick={getBalance}>
        {loading.getBalanceState ? <CircularIndeterminate/> : "getBalance"}
        </button>
        <button disabled={addressInfo.length == 0} onClick={sendTransaction}>
        {loading.sendState ? <CircularIndeterminate/> : "sendTransaction"}
        </button>
      </div>
      <div>
        {addressInfo.length == 0 ? (
          <></>
        ) : (
          <AddressComponent props={[...addressInfo]} />
        )}
      </div>
    </>
  );
}

export default AA;
