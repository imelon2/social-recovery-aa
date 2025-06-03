import {
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  http,
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

declare global {
  interface Window {
    ethereum?: any;
  }
}

function AA() {
  const [addressInfo, setAddressInfo] = useState<IAddressComponentProps[]>([]);
  const [publicClient, setPublicClient] = useState<PublicClient>();
  const [nexusClient, setNexusClient] = useState<NexusClient>();

  const connect = async () => {
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
  };

  const getBalance = async () => {
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
  };

  // @TODO AA Send Transaction
  const sendTransaction = () => {
    if (!publicClient) {
      return;
    }
  };
  return (
    <>
      <div>
        <button onClick={connect}>connect metamask</button>
        <button disabled={addressInfo.length == 0} onClick={getBalance}>
          getBalance
        </button>
        <button disabled={addressInfo.length == 0} onClick={sendTransaction}>
          sendTransaction
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
