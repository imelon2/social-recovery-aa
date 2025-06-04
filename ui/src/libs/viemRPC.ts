import { Address, PublicClient } from "viem";

export class ViemRPC {
  publicClient: PublicClient;

  constructor(_publicClient: PublicClient) {
    this.publicClient = _publicClient;
  }

  async getBalance(address: Address) {
    return await this.publicClient.getBalance({
      address: address,
    });
  }
}
