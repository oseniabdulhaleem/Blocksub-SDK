"use strict";
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
exports.SolanaSubscriptionSDK = void 0;
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@project-serum/anchor");
const config_1 = require("./config");
const blocksub_contract_json_1 = __importDefault(require("./idl/blocksub_contract.json")); // Import IDL file
class SolanaSubscriptionSDK {
    constructor(wallet) {
        this.connection = new web3_js_1.Connection(config_1.SOLANA_NETWORK, "confirmed");
        this.provider = new anchor_1.AnchorProvider(this.connection, wallet, {
            preflightCommitment: "confirmed",
        });
        // Initialize the program with the correct IDL and program ID
        this.program = new anchor_1.Program(blocksub_contract_json_1.default, config_1.PROGRAM_ID, this.provider);
    }
    // Subscribe a user to a plan
    subscribe(userPublicKey, plan, amount, durationInDays) {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield this.program.rpc.subscribe(plan, amount, durationInDays, {
                accounts: {
                    subscription_account: userPublicKey, // Use snake_case here
                    user: this.provider.wallet.publicKey,
                    system_program: web3_js_1.SystemProgram.programId, // Correct system program field
                },
                signers: [],
            });
            console.log("Subscription transaction successful:", tx);
        });
    }
    // Check if a user is subscribed
    checkSubscriptionStatus(userPublicKey) {
        return __awaiter(this, void 0, void 0, function* () {
            const subscriptionAccount = (yield this.program.account.SubscriptionAccount.fetch(userPublicKey));
            const currentTimestamp = Math.floor(Date.now() / 1000);
            return currentTimestamp < subscriptionAccount.expiry_date;
        });
    }
}
exports.SolanaSubscriptionSDK = SolanaSubscriptionSDK;
