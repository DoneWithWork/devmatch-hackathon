import { env as envClient } from "@/lib/env/client";
import { env } from "@/lib/env/server";
import { getSuiClient } from "@/utils/suiClient";
import { EnokiClient } from '@mysten/enoki';
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { NextResponse } from "next/server";

const enokiClient = new EnokiClient({
    apiKey: env.PRIVATE_ENOKI_KEY,
});


export async function GET() {
    try {
        const trx = new Transaction();
        const client = getSuiClient();
        const gasPrice = await client.getReferenceGasPrice();
        const sponsorCoins = await client.getCoins({
            owner: envClient.NEXT_PUBLIC_SUI_ADDRESS,
            coinType: "0x2::sui::SUI",
        });
        const coinObjects = sponsorCoins.data.map((coin) => ({
            objectId: coin.coinObjectId,
            version: Number(coin.version),
            digest: coin.digest,
        }));
        console.log(sponsorCoins)
        if (coinObjects.length === 0) {
            throw new Error("Sponsor has no coins available");
        }

        if (sponsorCoins.data.length === 0) {
            throw new Error("Sponsor has no coins available");
        }
        console.log(envClient.NEXT_PUBLIC_SUI_ADDRESS)
        const signer = Ed25519Keypair.fromSecretKey(env.SUI_PRIVATE_KEY);
        trx.setSender(envClient.NEXT_PUBLIC_SUI_ADDRESS);
        trx.setGasPrice(gasPrice)
        trx.setGasOwner(envClient.NEXT_PUBLIC_SUI_ADDRESS);
        trx.setGasPayment(coinObjects);
        // const bytes = await trx.build({
        //     client
        // })
        const { bytes, signature } = await trx.sign({
            client,
            signer,
        })
        return NextResponse.json({ bytes: Array.from(bytes), signature }, {
            status: 200
        })
    } catch (e: unknown) {
        const error = e as Error
        console.error(error.message)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}