import {
    Connection,
    Keypair,
    PublicKey,
    Transaction,
    VersionedTransaction,
    clusterApiUrl,
} from "@solana/web3.js";
import axios from "axios";
import fs from "fs";
import { performance } from "perf_hooks";
import * as dotenv from "dotenv";
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

dotenv.config();


const SHYFT_API_KEY = process.env.SHYFT_API_KEY!;
const SHYFT_BASE_URL = process.env.SHYFT_BASE_URL!;
const NETWORK = process.env.NETWORK || "mainnet-beta";

interface TimingMetrics {
    quoteTime: number;
    swapPreparationTime: number;
    signingTime: number;
    sendTime: number;
    confirmationTime: number;
    totalTime: number;
}

const getQuote = async (
    inputToken: string,
    outputToken: string,
    amount: number
): Promise<[any, number]> => {
    const startTime = performance.now();
    const url = `https://api.jup.ag/swap/v1/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=${amount}`;
    const response = await axios.get(url);
    const endTime = performance.now();
    return [response.data, endTime - startTime];
};

const swap = async (publicKey: string, quoteResponse: any): Promise<[any, number]> => {
    const startTime = performance.now();
    const url = `https://api.jup.ag/swap/v1/swap`;
    const body = {
        userPublicKey: publicKey,
        quoteResponse: quoteResponse,
    };

    const response = await axios.post(url, body, {
        headers: { "Content-Type": "application/json" },
    });
    const endTime = performance.now();
    return [response.data, endTime - startTime];
};

const createSignedSerializedTxn = async (
    encodedTransaction: string,
    keypair: Keypair
): Promise<[string, number]> => {
    const startTime = performance.now();
    try {
        const transactionBuffer = Buffer.from(encodedTransaction, "base64");
        let serialized: string;

        try {
            const recoveredTransaction = VersionedTransaction.deserialize(transactionBuffer);
            recoveredTransaction.sign([keypair]);
            serialized = Buffer.from(recoveredTransaction.serialize()).toString("base64");
        } catch (versionedError) {
            const legacyTransaction = Transaction.from(transactionBuffer);
            legacyTransaction.partialSign(keypair);
            serialized = legacyTransaction.serialize().toString("base64");
        }

        const endTime = performance.now();
        console.log(serialized)
        return [serialized, endTime - startTime];
    } catch (error) {
        console.error("Error in transaction signing:", error);
        throw error;
    }
};


const sendTransaction = async (
    connection: Connection,
    serializedTxn: string
): Promise<[string, number]> => {
    const startTime = performance.now();
    try {
        // Decode the base64 transaction
        const transactionBuffer = Buffer.from(serializedTxn, "base64");

        // Send the raw transaction
        const signature = await connection.sendRawTransaction(
            transactionBuffer,
            {
                skipPreflight: true,
                maxRetries: 5
            }
        );

        const endTime = performance.now();
        return [signature, endTime - startTime];
    } catch (error) {
        console.error("Send error:", error);
        throw error;
    }
};


const confirmTransactionWithTimeout = async (
    connection: Connection,
    txSignature: string,
    maxAttempts: number = 50,
    interval: number = 200
): Promise<[boolean, number]> => {
    const startTime = performance.now();
    let attempts = 0;

    while (attempts < maxAttempts) {
        try {
            const confirmation = await connection.confirmTransaction(txSignature, "confirmed");
            if (confirmation.value) {
                const endTime = performance.now();
                return [true, endTime - startTime];
            }
        } catch (error) {
            console.log(`Confirmation attempt ${attempts + 1} failed:`, error);
        }

        await new Promise(resolve => setTimeout(resolve, interval));
        attempts++;
    }

    throw new Error(`Transaction confirmation timeout after ${maxAttempts} attempts`);
};


const loadKeypair = (): Keypair => {
    const secretKey = JSON.parse(fs.readFileSync("keypair.json", "utf-8"));
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
};

const main = async () => {
    const metrics: TimingMetrics = {
        quoteTime: 0,
        swapPreparationTime: 0,
        signingTime: 0,
        sendTime: 0,
        confirmationTime: 0,
        totalTime: 0
    };

    const startTime = performance.now();

    try {
        const connection = new Connection(`{process.env.Helius}`, "confirmed");
        const keypair = loadKeypair();
        const publicKey = keypair.publicKey.toBase58();

        // Initial setup and balance checks...
        const outputToken = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
        const inputToken = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDT
        const amount = 120388570000;

        // Get Quote with timing
        const [quote, quoteTime] = await getQuote(inputToken, outputToken, amount);
        metrics.quoteTime = quoteTime;
        console.log(`Quote fetched in ${quoteTime.toFixed(3)}ms`);

        // Swap preparation with timing
        const [swapResponse, swapTime] = await swap(publicKey, quote);
        metrics.swapPreparationTime = swapTime;
        console.log(`Swap prepared in ${swapTime.toFixed(3)}ms`);

        // Sign transaction with timing
        const [serializedTxn, signingTime] = await createSignedSerializedTxn(
            swapResponse.swapTransaction,
            keypair
        );
        metrics.signingTime = signingTime;
        console.log(`Transaction signed in ${signingTime.toFixed(3)}ms`);

        // Send transaction with timing
        // Send transaction using RPC
        const [signature, sendTime] = await sendTransaction(connection, serializedTxn);
        metrics.sendTime = sendTime;
        console.log(`Transaction sent in ${sendTime.toFixed(3)}ms`);
        console.log('Transaction signature:', signature);

        // Confirm transaction with timing
        const [confirmed, confirmTime] = await confirmTransactionWithTimeout(
            connection,
            signature
        );
        metrics.confirmationTime = confirmTime;
        console.log(`Transaction confirmed in ${confirmTime.toFixed(3)}ms`);

        // Calculate and log total execution time
        metrics.totalTime = performance.now() - startTime;

        // Log final timing summary
        const currentTime = new Date().toISOString().split('.')[0] + 'Z'; // Get UTC time up to seconds
        console.log("\nTiming Summary:");
        console.log("==============");
        console.log(`UTC Time: ${currentTime}`);
        console.log(`Quote API Time: ${metrics.quoteTime.toFixed(3)}ms`);
        console.log(`Swap Preparation Time: ${metrics.swapPreparationTime.toFixed(3)}ms`);
        console.log(`Transaction Signing Time: ${metrics.signingTime.toFixed(3)}ms`);
        console.log(`Transaction Send Time: ${metrics.sendTime.toFixed(3)}ms`);
        console.log(`Transaction Confirmation Time: ${metrics.confirmationTime.toFixed(3)}ms`);
        console.log(`Total Execution Time: ${metrics.totalTime.toFixed(3)}ms`);
        console.log(`UTC Time: ${currentTime}`);
    } catch (error) {
        console.error("Error occurred:", error);
        throw error;
    }
};

main();