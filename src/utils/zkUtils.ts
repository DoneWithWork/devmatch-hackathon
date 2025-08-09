import { env } from "@/lib/env/client";
import { getZkLoginSignature } from "@mysten/sui/zklogin";

interface GetSaltResponseType {
    data: {
        salt: string;
        address: string;
        publicKey: string;
    };
}
export async function parseJWTFromURL(url: string): Promise<string | null> {
    const urlObject = new URL(url);
    const fragment = urlObject.hash.substring(1);
    const params = new URLSearchParams(fragment);
    return params.get("id_token");
}
export async function GetSalt(jwt: string) {
    const res = await fetch("https://api.enoki.mystenlabs.com/v1/zklogin", {
        headers: {
            "zklogin-jwt": jwt,
            "Authorization": `Bearer ${env.NEXT_PUBLIC_ENOKI_KEY}`
        },
    });
    if (!res.ok) throw new Error("Zk Login service failed!!")
    const data = await res.json() as GetSaltResponseType
    return data.data
}
export type GenerateZkLoginProps = {
    jwt: string;
    network: "mainet" | "testnet" | "devnet";
    maxEpoch: number,
    randomness: string;
    ephemeralPublicKey: string;
}
export interface ZkLoginType {
    data: {
        proofPoints?: {
            [k: string]: unknown;
        };
        issBase64Details?: {
            [k: string]: unknown;
        };
        headerBase64?: {
            [k: string]: unknown;
        };
        addressSeed: string;
    };
}

export async function GenerateZkLogin(
    { jwt, network, maxEpoch, randomness, ephemeralPublicKey }: GenerateZkLoginProps
) {

    const res = await fetch("https://api.enoki.mystenlabs.com/v1/zklogin/zkp", {
        headers: {
            "zklogin-jwt": jwt,
            "Authorization": `Bearer ${env.NEXT_PUBLIC_ENOKI_KEY}`,
            "Content-Type": "application/json"

        },
        body: JSON.stringify({
            network,
            ephemeralPublicKey,
            maxEpoch,
            randomness
        }),
        method: "POST"
    });
    if (!res.ok) throw new Error("Zk Login Generation service failed!!")
    return await res.json()

}
type SponsorZkLoginProps = {
    jwt: string;
    network: "mainet" | "testnet" | "devnet";
    transactionBlockKindBytes: Uint8Array<ArrayBufferLike>;
}
export interface SponsorResponse {
    data: {
        digest: string;
        bytes: string;
    };
}
export type PartialZkLoginSignature = Omit<
    Parameters<typeof getZkLoginSignature>["0"]["inputs"],
    "addressSeed"
>;

export async function SponsorZkLogin({ jwt, network, transactionBlockKindBytes }: SponsorZkLoginProps) {
    const res = await fetch("https://api.enoki.mystenlabs.com/v1/transaction-blocks/sponsor", {
        headers: {
            "zklogin-jwt": jwt,
            "Authorization": `Bearer ${env.NEXT_PUBLIC_ENOKI_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            network,
            transactionBlockKindBytes: Buffer.from(transactionBlockKindBytes).toString("base64"),

        }),
        method: "POST"
    });
    if (!res.ok) throw new Error("Zk Login Sponsor service failed!!")
    return await res.json() as SponsorResponse

}



