import { env } from "@/lib/env/server";
import { getSuiClient } from "@/utils/suiClient";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { NextRequest, NextResponse } from "next/server";

import { NETWORK } from "@/utils/config";
import { SuiObjectRef } from "@mysten/sui/client";
import { getFaucetHost, requestSuiFromFaucetV2 } from '@mysten/sui/faucet';

type SponsorType = {
    sender: string;
    transactionKindBytes: string
}
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const { sender, transactionKindBytes } = body as SponsorType
        const keyPair = Ed25519Keypair.fromSecretKey(env.SUI_PRIVATE_KEY);
        const address = keyPair.getPublicKey().toSuiAddress();

        console.log(`Sponsor address: ${address}`)

        const client = getSuiClient();

        //request testnet funds
        try {
            await requestSuiFromFaucetV2({
                host: getFaucetHost(NETWORK),
                recipient: address
            })
        } catch {
            console.log("Faucet Failed")
        }

        let payment: SuiObjectRef[] = []
        let retries = 50;

        while (retries !== 0) {
            const coins = await client.getCoins({ owner: address, limit: 1 });
            if (coins.data.length > 0) {
                payment = coins.data.map((coin) => ({
                    objectId: coin.coinObjectId,
                    version: coin.version,
                    digest: coin.digest,
                }));
                break;
            }
            await new Promise((resolve) => setTimeout(resolve, 200));
            retries -= 1;
        }
        const trxBytes = Uint8Array.from(Buffer.from(transactionKindBytes, 'base64'));

        const trx = Transaction.fromKind(trxBytes)
        trx.setSender(sender);
        trx.setGasOwner(address);
        trx.setGasPayment(payment);
        const { bytes, signature } = await keyPair.signTransaction(await trx.build({ client }));

        return NextResponse.json({ bytes, signature }, {
            status: 200
        })
    } catch (e: unknown) {
        const error = e as Error
        console.error(error.message)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}