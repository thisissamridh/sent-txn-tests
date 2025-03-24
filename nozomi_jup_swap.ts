import { AddressLookupTableAccount, Connection, Keypair, PublicKey, SystemProgram, TransactionMessage, VersionedMessage, VersionedTransaction } from '@solana/web3.js';
import fetch from 'cross-fetch';
import fs from "fs";
const RPC_URL = process.env.Helius || "";
const NOZOMI_URL = process.env.NOZOMI_URL || "";
// 0.001 SOL
const NOZOMI_TIP_LAMPORTS = 1000000; //0.001
const NOZOMI_TIP_ADDRESS = new PublicKey("TEMPaMeCRFAS9EKF53Jd6KpHxgL47uWLcpFArU1Fanq");

const loadKeypair = (): Keypair => {
    const secretKey = JSON.parse(fs.readFileSync("keypair.json", "utf-8"));
    return Keypair.fromSecretKey(Uint8Array.from(secretKey));
};

// Function to log timing metrics
const logTimestamp = (label: string): number => {
    const timestamp = Date.now();
    console.log(`[${new Date(timestamp).toISOString()}] ${label}`);
    return timestamp;
};

// Function to write report to file
const writeReport = (reportData: any) => {
    const reportContent = `# Swap Transaction Performance Report
Generated: ${new Date().toISOString()}

## Transaction Details
- Input Token: ${reportData.inputToken}
- Output Token: ${reportData.outputToken}
- Amount: ${reportData.amount}

## Nozomi Swap Performance
- Transaction ID: ${reportData.nozomi.txid}
- Transaction Send Time: ${new Date(reportData.nozomi.sendTime).toISOString()}
- Transaction Confirmation Time: ${new Date(reportData.nozomi.confirmTime).toISOString()}
- Total Time: ${reportData.nozomi.totalTime.toFixed(3)} seconds
- Transaction Landing Time: ${reportData.nozomi.landingTime.toFixed(3)} seconds

## Normal Swap Performance
- Transaction ID: ${reportData.normal.txid}
- Transaction Send Time: ${new Date(reportData.normal.sendTime).toISOString()}
- Transaction Confirmation Time: ${new Date(reportData.normal.confirmTime).toISOString()}
- Total Time: ${reportData.normal.totalTime.toFixed(3)} seconds
- Transaction Landing Time: ${reportData.normal.landingTime.toFixed(3)} seconds

## Comparison
- Speed Difference: ${(reportData.normal.totalTime - reportData.nozomi.totalTime).toFixed(3)} seconds
- Nozomi was ${(reportData.normal.totalTime / reportData.nozomi.totalTime).toFixed(2)}x faster than normal RPC
- Landing Time Difference: ${(reportData.normal.landingTime - reportData.nozomi.landingTime).toFixed(3)} seconds

## Raw Timing Data
\`\`\`json
${JSON.stringify(reportData, null, 2)}
\`\`\`
`;

    fs.writeFileSync("swap_performance_report.md", reportContent);
    console.log("Performance report written to swap_performance_report.md");
};

async function main() {
    const reportData: any = {
        inputToken: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
        outputToken: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        amount: 1000000,
        nozomi: {},
        normal: {}
    };

    logTimestamp("Starting swap execution");

    const connection = new Connection(RPC_URL, "confirmed");
    const nozomiConnection = new Connection(NOZOMI_URL);
    console.log(`Using Nozomi endpoint: ${NOZOMI_URL}`);
    console.log(`Using Normal endpoint: ${RPC_URL}`);

    const keypair = loadKeypair();
    const publicKey = keypair.publicKey.toBase58();

    const outputToken = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; // USDC
    const inputToken = "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"; // USDT
    const amount = 1000000;

    // Swapping USDT to USDC with 0.5% slippage
    const quoteStartTime = logTimestamp("Fetching quote");
    const quoteResponse = await (
        await fetch(`https://api.jup.ag/swap/v1/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=${amount}&slippageBps=50`)
    ).json();
    logTimestamp("Quote received");

    // get serialized transactions for the Nozomi swap
    const nozomiSwapStartTime = logTimestamp("Fetching Nozomi swap transaction");
    const { swapTransaction: nozomiswapTransaction } = await (
        await fetch('https://api.jup.ag/swap/v1/swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey: publicKey,
                wrapAndUnwrapSol: true,
            })
        })
    ).json();
    logTimestamp("Nozomi swap transaction received");

    // get serialized transactions for the normal swap
    const normalSwapStartTime = logTimestamp("Fetching normal swap transaction");
    const { swapTransaction: normalswapTransaction } = await (
        await fetch('https://api.jup.ag/swap/v1/swap', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quoteResponse,
                userPublicKey: publicKey,
                wrapAndUnwrapSol: true,
                prioritizationFeeLamports: {
                    priorityLevelWithMaxLamports: {
                        maxLamports: 1000000,
                        priorityLevel: "veryHigh"
                    },
                },
            })
        })
    ).json();
    logTimestamp("Normal swap transaction received");

    // Execute Nozomi swap
    logTimestamp("Preparing Nozomi transaction");
    const swapTransactionBuf = Buffer.from(nozomiswapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
    transaction.sign([keypair]);

    let nozomiTipIx = SystemProgram.transfer({
        fromPubkey: new PublicKey(publicKey),
        toPubkey: NOZOMI_TIP_ADDRESS,
        lamports: NOZOMI_TIP_LAMPORTS
    });

    let blockhash = await connection.getLatestBlockhash();

    let message = transaction.message;
    let addressLookupTableAccounts = await loadAddressLookupTablesFromMessage(message, connection);
    let txMessage = TransactionMessage.decompile(message, { addressLookupTableAccounts });

    txMessage.instructions.push(nozomiTipIx);

    let newMessage = txMessage.compileToV0Message(addressLookupTableAccounts);
    newMessage.recentBlockhash = blockhash.blockhash;

    let newTransaction = new VersionedTransaction(newMessage);
    newTransaction.sign([keypair]);

    // Execute the Nozomi transaction
    const rawTransaction = newTransaction.serialize();
    const nozomiSendTime = logTimestamp("Sending Nozomi transaction");
    reportData.nozomi.sendTime = nozomiSendTime;

    const nozomiTxid = await nozomiConnection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
        maxRetries: 2
    });
    const nozomiLandingTime = logTimestamp(`Nozomi transaction sent: ${nozomiTxid}`);
    reportData.nozomi.txid = nozomiTxid;
    reportData.nozomi.landingTime = (nozomiLandingTime - nozomiSendTime) / 1000;

    await connection.confirmTransaction({
        signature: nozomiTxid,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight
    });
    const nozomiConfirmTime = logTimestamp(`Nozomi transaction confirmed: ${nozomiTxid}`);
    reportData.nozomi.confirmTime = nozomiConfirmTime;
    reportData.nozomi.totalTime = (nozomiConfirmTime - nozomiSendTime) / 1000;
    console.log(`Nozomi transaction confirmed in: ${reportData.nozomi.totalTime.toFixed(3)} seconds`);

    // Execute Normal swap
    logTimestamp("Preparing normal transaction");
    const normalTransactionBuf = Buffer.from(normalswapTransaction, 'base64');
    const normalTransaction = VersionedTransaction.deserialize(normalTransactionBuf);
    normalTransaction.sign([keypair]);

    // Execute the normal transaction
    const normalRawTransaction = normalTransaction.serialize();
    const normalSendTime = logTimestamp("Sending normal transaction");
    reportData.normal.sendTime = normalSendTime;

    const normalTxid = await connection.sendRawTransaction(normalRawTransaction, {
        skipPreflight: true,
        maxRetries: 2
    });
    const normalLandingTime = logTimestamp(`Normal transaction sent: ${normalTxid}`);
    reportData.normal.txid = normalTxid;
    reportData.normal.landingTime = (normalLandingTime - normalSendTime) / 1000;

    await connection.confirmTransaction({
        signature: normalTxid,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight
    });
    const normalConfirmTime = logTimestamp(`Normal transaction confirmed: ${normalTxid}`);
    reportData.normal.confirmTime = normalConfirmTime;
    reportData.normal.totalTime = (normalConfirmTime - normalSendTime) / 1000;
    console.log(`Normal transaction confirmed in: ${reportData.normal.totalTime.toFixed(3)} seconds`);

    // Generate and write the report
    writeReport(reportData);
}

async function loadAddressLookupTablesFromMessage(message: VersionedMessage, connection: Connection) {
    let addressLookupTableAccounts: AddressLookupTableAccount[] = [];
    for (let lookup of message.addressTableLookups) {
        let lutAccounts = await connection.getAddressLookupTable(lookup.accountKey);
        addressLookupTableAccounts.push(lutAccounts.value!);
    }

    return addressLookupTableAccounts;
}

main().catch(console.error);