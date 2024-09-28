How to use SDK

```
import { BlockSubSDK } from "blocksub-sdk";

const sdk = new BlockSubSDK(wallet, "https://api.devnet.solana.com", "BvuGGNocQNB8ybd6mYjy9HScPc3hf2bUWnQjVzbmDRCF");

// Subscribe
await sdk.subscribe(userPublicKey, "premium_plan", 1000, 30);

// Check Subscription Status
const isActive = await sdk.checkSubscriptionStatus(subscriptionAccountPubKey);
console.log("Is subscription active?", isActive);

// Extend Subscription
await sdk.extendSubscription(subscriptionAccountPubKey, 30, 500); // Extend by 30 days, pay 500 lamports more

```
