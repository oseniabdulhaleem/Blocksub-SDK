"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlockSubSDK = void 0;
const anchor = __importStar(require("@coral-xyz/anchor"));
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const blocksub_contract_json_1 = __importDefault(require("./idl/blocksub_contract.json"));
class BlockSubSDK {
    constructor(networkUrl, wallet, programId) {
        this.connection = new web3_js_1.Connection(networkUrl, "confirmed");
        // Ensure wallet supports signing transactions
        if (!wallet.signTransaction) {
            throw new Error("Wallet does not support transaction signing");
        }
        // Create a valid provider with connection and wallet
        this.provider = new anchor_1.AnchorProvider(this.connection, wallet, {});
        const programPublicKey = new web3_js_1.PublicKey(programId);
        this.program = new anchor_1.Program(blocksub_contract_json_1.default, programPublicKey, this.provider);
    }
    // Subscribe a user to a plan
    subscribe(userPublicKey, plan, amount, durationInDays) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionAccount = anchor.web3.Keypair.generate();
            // Correctly pass the user's public key where a public key is expected
            const tx = yield this.program.methods
                .subscribe(plan, new anchor.BN(amount), new anchor.BN(durationInDays))
                .accounts({
                subscriptionAccount: subscriptionAccount.publicKey,
                user: userPublicKey, // Pass userPublicKey instead of provider's wallet public key here
            })
                .signers([subscriptionAccount])
                .rpc();
            console.log("Subscription transaction:", tx);
        });
    }
    // Check subscription status
    checkSubscriptionStatus(subscriptionAccountPubKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionAccount = yield this.program.account.subscriptionAccount.fetch(subscriptionAccountPubKey);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            return currentTimestamp < subscriptionAccount.expiryDate;
        });
    }
    // Extend subscription by making an additional payment before expiry
    extendSubscription(subscriptionAccountPubKey, additionalDuration, additionalAmount) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionAccount = yield this.program.account.subscriptionAccount.fetch(subscriptionAccountPubKey);
            const currentTimestamp = Math.floor(Date.now() / 1000);
            if (currentTimestamp < subscriptionAccount.expiryDate) {
                const newExpiryDate = subscriptionAccount.expiryDate + additionalDuration * 24 * 60 * 60;
                const tx = yield this.program.methods
                    .subscribe(subscriptionAccount.plan, new anchor.BN(additionalAmount), new anchor.BN(additionalDuration))
                    .accounts({
                    subscriptionAccount: subscriptionAccountPubKey,
                    user: this.provider.wallet.publicKey, // Pass user’s public key
                })
                    .rpc();
                console.log("Subscription extended:", tx);
            }
            else {
                throw new Error("Subscription has already expired");
            }
        });
    }
}
exports.BlockSubSDK = BlockSubSDK;
