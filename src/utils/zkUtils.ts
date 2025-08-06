interface GetSaltResponseType {
    data: {
        salt: string;
        address: string;
        publicKey: string;
    };
}

export async function GetSalt(jwt: string) {
    const res = await fetch("https://api.enoki.mystenlabs.com/v1/zklogin", {
        headers: {
            "zklogin-jwt": jwt,
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_ENOKI_KEY!}`
        },
    });
    if (!res.ok) throw new Error("Zk Login service failed!!")
    const data = await res.json() as GetSaltResponseType
    return data.data
}
type GenerateZkLoginProps = {
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
    console.log(JSON.stringify({
        network,
        ephemeralPublicKey,
        maxEpoch,
        randomness
    }),)
    const res = await fetch("https://api.enoki.mystenlabs.com/v1/zklogin/zkp", {
        headers: {
            "zklogin-jwt": jwt,
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_ENOKI_KEY!}`,
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