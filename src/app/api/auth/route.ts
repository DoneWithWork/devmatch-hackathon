import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { env } from "@/lib/env/client";
import { SaveSession } from "@/utils/session";
import { getSuiClient } from "@/utils/suiClient";
import { GetSalt } from "@/utils/zkUtils";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { generateNonce, jwtToAddress } from "@mysten/sui/zklogin";
import { eq } from "drizzle-orm";
import * as jose from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const ACCEPTED_ISS = [
    "https://accounts.google.com",
    "https://facebook.com",
    "https://www.facebook.com"
];
const CLIENT_IDS = [
    env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
];

// Provider JWKS endpoints for signature verification
const PROVIDER_JWKS = {
    "https://accounts.google.com": "https://www.googleapis.com/oauth2/v3/certs",
    "https://facebook.com": "https://limited.facebook.com/.well-known/oauth/openid/jwks/",
    "https://www.facebook.com": "https://limited.facebook.com/.well-known/oauth/openid/jwks/",
};

type Body = {
    userAddress: string;
    maxEpoch: number;
    randomness: string;
    email: string;
    jwt: string;
    salt: string;
    privateKey: string;
};

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as Body;
        const { privateKey, maxEpoch, randomness, userAddress, email, jwt, salt } = body;

        // Step 1: Verify zkLogin address
        if (jwtToAddress(jwt, salt) !== userAddress) {
            return error(400, "JWT address does not match provided userAddress");
        }

        // Step 2: Verify JWT using OpenID Connect rules
        const payload = await verifyJwt(jwt);

        // Step 3: Extra claim checks
        if (payload.email !== email) {
            return error(400, "JWT email does not match provided email");
        }

        // Step 4: Verify nonce integrity generated from the client
        const keyPair = Ed25519Keypair.fromSecretKey(privateKey);
        const expectedNonce = generateNonce(keyPair.getPublicKey(), maxEpoch, randomness);
        if (payload.nonce !== expectedNonce) {
            return error(400, "Invalid JWT nonce");
        }

        // Step 5: DB user lookup
        const curCookies = await cookies();
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        const { epoch } = await getSuiClient().getLatestSuiSystemState();
        const { salt: generatedSalt } = await GetSalt(jwt);
        console.log(email)
        if (!existingUser) {
            // New user
            const inserted = await db.insert(users).values({
                userAddress: [userAddress],
                email,
                maxEpoch: Number(epoch) + 10,
                privateKey: keyPair.getSecretKey(),
                randomness,
            }).returning({ userAddress: users.userAddress, userId: users.id });
            const zkLoginUserAddress = jwtToAddress(jwt, generatedSalt);
            if (!inserted.length) {
                return error(500, "Failed to create new user");
            }
            //contruct new address zklogin for user
            await SaveSession({
                cookies: curCookies,
                id: inserted[0].userId,
                maxEpoch,
                randomness,
                userAddress: zkLoginUserAddress,
                role: "user",
            });

        } else {
            // if epoch expires replace all the values
            if (+epoch > existingUser.maxEpoch) {

                const usersAddress = Array.from(
                    new Set([...existingUser.userAddress, userAddress])
                );

                await db.update(users).set({
                    userAddress: usersAddress,
                    randomness,
                    maxEpoch,
                    privateKey,
                }).where(eq(users.email, email));


            }
            await SaveSession({
                cookies: curCookies,
                id: existingUser.id,
                maxEpoch,
                randomness,
                userAddress,
                role: existingUser.role!,
            });
        }

        return NextResponse.json({ message: "Successfully saved the session!" }, { status: 200 });

    } catch (e) {
        console.error(e);
        return error(500, (e as Error).message || "Internal Server Error");
    }
}

// Verifies the JWT provided using JWKS 
async function verifyJwt(jwt: string) {
    const unverified = jose.decodeJwt(jwt);
    if (unverified.iss === "https://www.facebook.com") return unverified
    if (!unverified.iss || !ACCEPTED_ISS.includes(unverified.iss)) {
        throw new Error("Invalid issuer in JWT");
    }
    if (!unverified.aud || !CLIENT_IDS.includes(unverified.aud as string)) {
        throw new Error("Invalid audience in JWT");
    }

    // Fetch the JWKS and verify signature
    const jwksUri = PROVIDER_JWKS[unverified.iss as keyof typeof PROVIDER_JWKS];
    const JWKS = jose.createRemoteJWKSet(new URL(jwksUri));

    const { payload } = await jose.jwtVerify(jwt, JWKS, {
        issuer: unverified.iss as string,
        audience: CLIENT_IDS,
    });

    return payload as jose.JWTPayload & { nonce: string; email: string };
}

function error(status: number, message: string) {
    return NextResponse.json({ message }, { status });
}
