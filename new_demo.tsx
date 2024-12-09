import { Connection, PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, web3, BN, IdlAccounts } from '@coral-xyz/anchor';
import { IDL } from './src/idl/idl';
import React, { useState } from 'react';

// Define types based on your IDL
type SubscriptionIDL = typeof IDL;

interface SubscriptionAccount {
  user: PublicKey;
  plan: string;
  paymentAmount: BN;
  startDate: BN;
  expiryDate: BN;
}

interface SubscriptionDetails {
  user: string;
  plan: string;
  paymentAmount: string;
  startDate: Date;
  expiryDate: Date;
}

// Initialize connection and program ID
const PROGRAM_ID = new PublicKey("5j1xSY5sZMgDS4feyzvaHzgr9JHHMERf5FWdp8CiorFy");
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Utility function to get provider
const getProvider = (): AnchorProvider => {
  if (!window.solana) {
    throw new Error("Please install Phantom wallet");
  }
  
  const provider = new AnchorProvider(
    connection,
    window.solana as any,
    { commitment: "confirmed" }
  );
  
  return provider;
};

// Subscription service class
class SubscriptionService {
  program: Program<SubscriptionIDL>;
  provider: AnchorProvider;

  constructor() {
    this.provider = getProvider();
    this.program = new Program(IDL, PROGRAM_ID, this.provider);
  }

  // Create new subscription
  async subscribe(plan: string, paymentAmount: number, durationInDays: number): Promise<{
    tx: string;
    subscriptionAccount: string;
  }> {
    try {
      const subscriptionKeypair = Keypair.generate();

      const tx = await this.program.methods
        .subscribe(
          plan,
          new BN(paymentAmount),
          new BN(durationInDays)
        )
        .accounts({
          subscriptionAccount: subscriptionKeypair.publicKey,
          user: this.provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([subscriptionKeypair])
        .rpc();

      return {
        tx,
        subscriptionAccount: subscriptionKeypair.publicKey.toString()
      };
    } catch (error) {
      console.error("Error creating subscription:", error);
      throw error;
    }
  }

  // Check subscription status
  async checkStatus(subscriptionAccountPubkey: string): Promise<boolean> {
    try {
      const isActive = await this.program.methods
        .checkSubscriptionStatus()
        .accounts({
          subscriptionAccount: new PublicKey(subscriptionAccountPubkey),
        })
        .view();

      return isActive;
    } catch (error) {
      console.error("Error checking subscription status:", error);
      throw error;
    }
  }

  // Fetch subscription details
  async getSubscriptionDetails(subscriptionAccountPubkey: string): Promise<SubscriptionDetails> {
    try {
      const account = await this.program.account.subscriptionAccount.fetch(
        new PublicKey(subscriptionAccountPubkey)
      ) as SubscriptionAccount;

      return {
        user: account.user.toString(),
        plan: account.plan,
        paymentAmount: account.paymentAmount.toString(),
        startDate: new Date(account.startDate.toNumber() * 1000),
        expiryDate: new Date(account.expiryDate.toNumber() * 1000)
      };
    } catch (error) {
      console.error("Error fetching subscription details:", error);
      throw error;
    }
  }
}

// React component
const SubscriptionComponent: React.FC = () => {
  const [subscriptionAccount, setSubscriptionAccount] = useState<string | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [details, setDetails] = useState<SubscriptionDetails | null>(null);
  const subscriptionService = new SubscriptionService();

  const handleSubscribe = async (): Promise<void> => {
    try {
      const result = await subscriptionService.subscribe(
        "premium",
        1000000000, // 1 SOL in lamports
        30 // 30 days
      );
      
      setSubscriptionAccount(result.subscriptionAccount);
      console.log("Transaction signature:", result.tx);
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  };

  const checkStatus = async (): Promise<void> => {
    if (!subscriptionAccount) return;
    
    try {
      const status = await subscriptionService.checkStatus(subscriptionAccount);
      setIsActive(status);
    } catch (error) {
      console.error("Error checking status:", error);
    }
  };

  const getDetails = async (): Promise<void> => {
    if (!subscriptionAccount) return;
    
    try {
      const details = await subscriptionService.getSubscriptionDetails(subscriptionAccount);
      setDetails(details);
    } catch (error) {
      console.error("Error getting details:", error);
    }
  };

  return (
    <div>
      <button onClick={handleSubscribe}>Subscribe</button>
      
      {subscriptionAccount && (
        <>
          <button onClick={checkStatus}>Check Status</button>
          <button onClick={getDetails}>Get Details</button>
          
          <div>
            <p>Subscription Account: {subscriptionAccount}</p>
            <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
            
            {details && (
              <div>
                <h3>Subscription Details:</h3>
                <p>Plan: {details.plan}</p>
                <p>Amount: {details.paymentAmount} lamports</p>
                <p>Start Date: {details.startDate.toLocaleDateString()}</p>
                <p>Expiry Date: {details.expiryDate.toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionComponent;