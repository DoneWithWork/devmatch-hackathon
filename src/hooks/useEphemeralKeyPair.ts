import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

type StoredEphemeralKeyPairsType = {
    ephemeralKeyPair: Ed25519Keypair
    randomness: string;
    maxEpoch: number;
}
export default async function useEphemeralKeyPair() {

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

export function decodeEphemeralKeyPairs(encoded: string): StoredEphemeralKeyPairsType {
    const { secretKey, randomness, maxEpoch } = JSON.parse(encoded);

    return {
        ephemeralKeyPair: Ed25519Keypair.fromSecretKey(secretKey),
        randomness: randomness,
        maxEpoch,
    };
}
