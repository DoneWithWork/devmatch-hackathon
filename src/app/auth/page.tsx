"use client";
import { decodeEphemeralKeyPairs } from "@/hooks/useEphemeralKeyPair";
import { getSuiClient } from "@/utils/suiClient";
import { GetSalt } from "@/utils/zkUtils";
import { Transaction } from "@mysten/sui/transactions";
import {
  genAddressSeed,
  getExtendedEphemeralPublicKey,
  getZkLoginSignature,
  jwtToAddress,
} from "@mysten/sui/zklogin";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
async function parseJWTFromURL(url: string): Promise<string | null> {
  const urlObject = new URL(url);
  console.log(url);
  const fragment = urlObject.hash.substring(1);
  const params = new URLSearchParams(fragment);
  return params.get("id_token");
}
export default function Page() {
  const router = useRouter();
  useEffect(() => {
    async function auth() {
      const jwt = await parseJWTFromURL(window.location.href);
      if (!jwt) {
        toast.error("No JWT found in URL. Please try to login again");
        return;
      }
      console.log("JWT:", jwt);
      const payload = jwtDecode<JwtPayload & { nonce: string; email: string }>(
        jwt
      );
      console.log(payload.email);
      // const nonce = payload.nonce;
      // grab the ephemeralKeyPair
      const keyPairs = localStorage.getItem("ephemeral-key-pair");
      if (!keyPairs) {
        toast.error("No ephemeral key pair found!!");
      }
      const { ephemeralKeyPair, maxEpoch, randomness } =
        decodeEphemeralKeyPairs(keyPairs!);
      console.log("Randomness: ", randomness);
      console.log("Max epoch: ", maxEpoch);

      const ExtendedEphemeralKeyPair = getExtendedEphemeralPublicKey(
        ephemeralKeyPair.getPublicKey()
      );

      const { salt } = await GetSalt(jwt);
      console.log("Salt: ", salt);
      const zkLoginUserAddress = jwtToAddress(jwt, salt);
      console.log(zkLoginUserAddress);
      console.log("ZkLoginAddress: ", zkLoginUserAddress);
      const data = {
        jwt,
        network: "devnet",
        maxEpoch,
        randomness,
        ephemeralPublicKey: ExtendedEphemeralKeyPair,
      };
      // send to bk for zkp
      const res = await fetch("/api/zkp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        toast.error("Failed to create zk login");
        return;
      }
      const proofResponse = await res.json();
      const partialZkLoginSignature =
        proofResponse.data as PartialZkLoginSignature;
      console.log(partialZkLoginSignature);
      const client = getSuiClient();
      const txb = new Transaction();
      txb.setSender(zkLoginUserAddress);
      const { bytes, signature: userSignature } = await txb.sign({
        client,
        signer: ephemeralKeyPair,
      });
      if (typeof payload.aud !== "string") {
        throw new Error("Invalid audience in JWT payload");
      }
      const addressSeed = genAddressSeed(
        BigInt(salt!),
        "sub",
        payload.sub!,
        payload.aud
      ).toString();
      console.log("Address Seed: ", addressSeed);

      const zkLoginSignature = getZkLoginSignature({
        inputs: {
          ...partialZkLoginSignature,
          addressSeed,
        },
        maxEpoch,
        userSignature,
      });
      console.log(zkLoginSignature);
      try {
        const res = await client.executeTransactionBlock({
          transactionBlock: bytes,
          signature: zkLoginSignature,
        });
        console.log(res);
        const data = {
          maxEpoch,
          randomness,
          userAddress: zkLoginUserAddress,
        };

        // Check for login intent stored during role selection
        const loginIntentStr = localStorage.getItem("login_intent");
        let intendedRole = "user";
        let intendedRoute = "/dashboard";

        if (loginIntentStr) {
          try {
            const loginIntent = JSON.parse(loginIntentStr);
            // Check if intent is recent (within 10 minutes)
            if (Date.now() - loginIntent.timestamp < 10 * 60 * 1000) {
              intendedRole = loginIntent.role;
              intendedRoute = loginIntent.route;
            }
            localStorage.removeItem("login_intent"); // Clean up
          } catch (error) {
            console.error("Failed to parse login intent:", error);
          }
        }

        // Add role hint to the authentication request
        const authData = {
          ...data,
          intendedRole,
        };

        const signIn = await fetch("/api/auth", {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify(authData),
        });
        if (!signIn.ok) throw new Error("Failed to save session");

        const response = await signIn.json();
        toast.success("Successfully signed in");

        // Route based on actual user role from API response
        let finalRoute = intendedRoute;
        if (response.role === "issuer") {
          finalRoute = "/issuer";
        } else if (response.role === "admin") {
          finalRoute = "/admin";
        } else {
          finalRoute = "/dashboard";
        }

        // Redirect to appropriate dashboard
        router.push(finalRoute);
      } catch {
        toast.error("Failed to create trx");
        return;
      }
    }
    auth();
  }, [router]);
  return <div></div>;
}
export type PartialZkLoginSignature = Omit<
  Parameters<typeof getZkLoginSignature>["0"]["inputs"],
  "addressSeed"
>;
