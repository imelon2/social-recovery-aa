import {
  createPublicClient,
  createWalletClient,
  custom,
  decodeFunctionResult,
  encodeFunctionData,
  formatEther,
  http,
  parseAbi,
  parseEther,
  PublicClient,
} from "viem";
import { arbitrumSepolia } from "viem/chains";
import {
  createBicoPaymasterClient,
  createSmartAccountClient,
  NexusClient,
  toNexusAccount,
} from "@biconomy/abstractjs";
import { BICONOMY_PAYMASTER_ADDRESS, BICONOMY_PAYMASTER_DEPOSIT_ADDRESS, BUNDLER_URL, PAYMASTER_URL } from "../config/aaContextConfig";
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

function AAWithPM() {
  const [addressInfo, setAddressInfo] = useState<IAddressComponentProps[]>([]);
  const [publicClient, setPublicClient] = useState<PublicClient>();
  const [nexusClient, setNexusClient] = useState<NexusClient>();
  const [loading, setLoading] = useState({
    connectState: false,
    getBalanceState: false,
    sendState: false,
  })

  const connect = async () => {
    try {
      setLoading({ ...loading, connectState: true })

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
        paymaster: createBicoPaymasterClient({ paymasterUrl: PAYMASTER_URL }),
      });
      setNexusClient(_nexusClient);


      // getBalance
      const smartAccountBalance = await client.getBalance({
        address: _nexusClient.account.address,
      });
      const EOABalance = await client.getBalance({ address: accountAddress });
      const PMBalance = await getPaymasterBalance()
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
        {
          address: BICONOMY_PAYMASTER_DEPOSIT_ADDRESS,
          balance: formatEther(PMBalance!),
          tag: "PM",
        },
      ]);

    } catch (error) {
      alert(error)
      setLoading({ ...loading, connectState: false })
    } finally {
      setLoading({ ...loading, connectState: false })
    }
  };

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
      setLoading({ ...loading, getBalanceState: false })
    }
  };


  const getPaymasterBalance = async () => {
    if (!publicClient) {
      return;
    }
    const abi = parseAbi(['function getBalance(address) view returns (uint256)'])

    const result = await publicClient.call({
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
      setLoading({ ...loading, sendState: false })
    } finally {
      setLoading({ ...loading, sendState: false })
    }
  };

  return (
    <>
      <div>
        <button onClick={connect}>{loading.connectState ? <CircularIndeterminate /> : "connect metamask"}</button>
        <button disabled={addressInfo.length == 0} onClick={getBalance}>
          {loading.getBalanceState ? <CircularIndeterminate /> : "getBalance"}
        </button>
        <button disabled={addressInfo.length == 0} onClick={sendTransaction}>
          {loading.sendState ? <CircularIndeterminate /> : "sendTransaction"}
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

export default AAWithPM;
