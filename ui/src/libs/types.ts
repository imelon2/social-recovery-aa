import { Address } from "viem";

export type IAddressComponentProps = {
  address: Address;
  balance: string;
  tag: string;
};