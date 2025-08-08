import { env } from '@/lib/env/client';
import { SuiClient, SuiObjectRef } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

type StoredEphemeralKeyPairsType = {
    ephemeralKeyPair: Ed25519Keypair
    randomness: string;
    maxEpoch: number;
}
export default function useEphemeralKeyPair() {
    if (typeof window === "undefined") {
        return null;
    }

    const keyPair = window.localStorage.getItem("ephemeral-key-pair");
    return keyPair;
}

export const storeEphemeralKeyPair = (ephemeralKeyPair: Ed25519Keypair,
    randomness: string,
    maxEpoch: number) => {
    const encoded = JSON.stringify({
        secretKey: ephemeralKeyPair.getSecretKey(),
        randomness,
        maxEpoch
    })
    localStorage.setItem("ephemeral-key-pair", encoded)
}
export async function getEphemeralKeyPairsFromStorage(key: string): Promise<StoredEphemeralKeyPairsType | false> {
    const stored = localStorage.getItem(key);
    if (!stored) return false;

    try {
        const parsed = JSON.parse(stored);
        // Basic validation for expected keys and types
        if (
            typeof parsed.secretKey === 'string' &&
            typeof parsed.randomness === 'string' &&
            typeof parsed.maxEpoch === 'number'
        ) {
            return {
                ephemeralKeyPair: Ed25519Keypair.fromSecretKey(parsed.secretKey),
                randomness: parsed.randomness,
                maxEpoch: parsed.maxEpoch,
            };
        }
        return false;
    } catch {
        return false;
    }
}


export function decodeEphemeralKeyPairs(encoded: string): StoredEphemeralKeyPairsType {
    const { secretKey, randomness, maxEpoch } = JSON.parse(encoded);

    return {
        ephemeralKeyPair: Ed25519Keypair.fromSecretKey(secretKey),
        randomness: randomness,
        maxEpoch,
    };
}
const sponsorAddress = env.NEXT_PUBLIC_SUI_ADDRESS;
const COIN_BALANCE_PADDING = 50000;
export async function EstimatedBestCoinObject(
    client: SuiClient,
    buildTrx: Uint8Array
): Promise<SuiObjectRef[] | null> {
    const dryRun = await client.dryRunTransactionBlock({
        transactionBlock: buildTrx,
    });

    const { computationCost, storageCost, storageRebate } =
        dryRun.effects.gasUsed;

    const estimatedGas =
        Number(computationCost) + Number(storageCost) - Number(storageRebate);

    console.log("Estimated gas: ", estimatedGas);

    const coins = await client.getCoins({ owner: sponsorAddress });
    console.log("Coins: ", coins);

    const coin = coins.data.find(
        (coin) => Number(coin.balance) > estimatedGas + COIN_BALANCE_PADDING
    );

    if (!coin) return null;

    return [
        {
            objectId: coin.coinObjectId,
            version: coin.version,
            digest: coin.digest,
        },
    ];
}