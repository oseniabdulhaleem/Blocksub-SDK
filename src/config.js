"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROGRAM_ID = exports.SOLANA_NETWORK = void 0;
const web3_js_1 = require("@solana/web3.js");
exports.SOLANA_NETWORK = "https://api.devnet.solana.com"; // Change to mainnet-beta if necessary
exports.PROGRAM_ID = new web3_js_1.PublicKey("BvuGGNocQNB8ybd6mYjy9HScPc3hf2bUWnQjVzbmDRCF");
