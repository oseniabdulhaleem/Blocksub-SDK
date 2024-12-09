import * as anchor from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { SubscriptionContract } from "./types/blocksub_contract";
import idl from "./idl/idl";

export class BlockSubSDK {
  private connection: Connection;
  private provider: AnchorProvider;
  private program: Program<SubscriptionContract>;

  constructor(networkUrl: string, wallet: WalletContextState, programId: string) {
    this.connection = new Connection(networkUrl, "confirmed");

    // Ensure wallet supports signing transactions
    if (!wallet.signTransaction) {
      throw new Error("Wallet does not support transaction signing");
    }

    // Create a valid provider with connection and wallet
    this.provider = new AnchorProvider(this.connection, wallet as any, {});

    const programPublicKey = new PublicKey(programId);
    this.program = new Program<SubscriptionContract>(idl as any, programPublicKey, this.provider);





  }

  // Subscribe a user to a plan
  async subscribe(
    userPublicKey: PublicKey,
    plan: string,
    amount: number,
    durationInDays: number
  ): Promise<void> {
    const subscriptionAccount = anchor.web3.Keypair.generate();

    // Correctly pass the user's public key where a public key is expected
    const tx = await this.program.methods
      .subscribe(plan, new anchor.BN(amount), new anchor.BN(durationInDays))
      .accounts({
        subscriptionAccount: subscriptionAccount.publicKey,
        user: userPublicKey, // Pass userPublicKey instead of provider's wallet public key here
      })
      .signers([subscriptionAccount])
      .rpc();

    console.log("Subscription transaction:", tx);
  }

  // Check subscription status
  async checkSubscriptionStatus(
    subscriptionAccountPubKey: PublicKey
  ): Promise<boolean> {
    const subscriptionAccount =
      await this.program.account.subscriptionAccount.fetch(
        subscriptionAccountPubKey
      );
    const currentTimestamp = Math.floor(Date.now() / 1000);
    return currentTimestamp < subscriptionAccount.expiryDate;
  }

  // Extend subscription by making an additional payment before expiry
  async extendSubscription(
    subscriptionAccountPubKey: PublicKey,
    additionalDuration: number,
    additionalAmount: number
  ): Promise<void> {
    const subscriptionAccount =
      await this.program.account.subscriptionAccount.fetch(
        subscriptionAccountPubKey
      );

    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (currentTimestamp < subscriptionAccount.expiryDate) {
      const newExpiryDate =
        subscriptionAccount.expiryDate + additionalDuration * 24 * 60 * 60;

      const tx = await this.program.methods
        .subscribe(
          subscriptionAccount.plan,
          new anchor.BN(additionalAmount),
          new anchor.BN(additionalDuration)
        )
        .accounts({
          subscriptionAccount: subscriptionAccountPubKey,
          user: this.provider.wallet.publicKey, // Pass user’s public key
        })
        .rpc();

      console.log("Subscription extended:", tx);
    } else {
      throw new Error("Subscription has already expired");
    }
  }
}
