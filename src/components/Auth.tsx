"use client";
import useEphemeralKeyPair, {
  getEphemeralKeyPairsFromStorage,
} from "@/hooks/useEphemeralKeyPair";
import { env } from "@/lib/env/client";
import { NETWORK } from "@/utils/config";
import { getSuiClient } from "@/utils/suiClient";
import {
  GenerateZkLoginProps,
  GetSalt,
  parseJWTFromURL,
  PartialZkLoginSignature,
} from "@/utils/zkUtils";
import { Transaction } from "@mysten/sui/transactions";
import {
  genAddressSeed,
  getExtendedEphemeralPublicKey,
  jwtToAddress,
} from "@mysten/sui/zklogin";
import { jwtDecode, JwtPayload } from "jwt-decode";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import miner from "../../public/miner.jpeg";

export default function Auth() {
  const router = useRouter();
  const keyPair = useEphemeralKeyPair();
  useEffect(() => {
    async function auth() {
      try {
        const client = getSuiClient();
        const currentUrl = window.location.href;
        const jwt = await parseJWTFromURL(currentUrl);
        if (!jwt) {
          toast.error("No JWT found in URL. Please try to login again");
          return;
        }

        console.log("JWT:", jwt);
        const payload = jwtDecode<
          JwtPayload & { nonce: string; email: string }
        >(jwt);
        console.log(payload);
        if (typeof payload.aud !== "string") {
          throw new Error("Invalid audience in JWT payload");
        }

        if (!keyPair) {
          toast.error("No ephemeral key pair found!!");
          return;
        }
        // Decode back the required values stored in localstorage
        const stored = await getEphemeralKeyPairsFromStorage(
          "ephemeral-key-pair"
        );
        if (!stored) throw new Error("Cannot find ephemeral key details!");
        const { ephemeralKeyPair, maxEpoch, randomness } = stored;
        const ExtendedEphemeralKeyPair = getExtendedEphemeralPublicKey(
          ephemeralKeyPair.getPublicKey()
        );
        console.log(ExtendedEphemeralKeyPair);
        // Get the salt required to generate Login Address
        const { salt } = await GetSalt(jwt);

        //Derive address from jwt and salt
        const zkLoginUserAddress = jwtToAddress(jwt, salt);
        console.log(zkLoginUserAddress);
        // Derive the partialSignature required
        await CallZkpRoute({
          jwt,
          network: NETWORK,
          maxEpoch,
          randomness,
          ephemeralPublicKey: ExtendedEphemeralKeyPair,
        });

        genAddressSeed(
          BigInt(salt!),
          "sub",
          payload.sub!,
          payload.aud
        ).toString();
        const sponsor = await GetSponsorFromBackend();
        const { bytes, signature } = sponsor;
        const reconstructedBytes = Uint8Array.from(bytes);

        const sponsoredTrx = Transaction.fromKind(reconstructedBytes);
        sponsoredTrx.setSender(env.NEXT_PUBLIC_SUI_ADDRESS);

        const { bytes: newBytes } = await sponsoredTrx.sign({
          client,
          signer: ephemeralKeyPair,
        });
        // getZkLoginSignature({
        //   inputs: {
        //     ...partialZkLoginSignature,
        //     addressSeed,
        //   },
        //   maxEpoch,
        //   userSignature,
        // });

        const res = await client.executeTransactionBlock({
          transactionBlock: newBytes,

          signature: [signature],
          options: {
            showEffects: true,
            showEvents: true,
            showBalanceChanges: true,
          },
        });
        console.log(res);
        // call login api here TODO
        await Login({
          email: payload.email,
          jwt,
          maxEpoch,
          randomness,
          salt,
          userAddress: zkLoginUserAddress,
        });
        toast.success("Successfully logged in!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } catch (e: unknown) {
        const error = e as Error;
        console.error("Failed ZkLogin process");
        console.error(error.message);
        toast.error(error.message);
      }
    }
    auth();
  }, [router, keyPair]);
  return (
    <Image
      src={miner}
      alt="miner"
      className="h-screen w-full object-flll object-cover"
      width={700}
      height={800}
    />
  );
}

async function CallZkpRoute({
  jwt,
  network,
  randomness,
  maxEpoch,
  ephemeralPublicKey,
}: GenerateZkLoginProps) {
  const props = {
    jwt,
    network,
    randomness,
    maxEpoch,
    ephemeralPublicKey,
  };
  const res = await fetch("/api/zkp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(props),
  });

  if (!res.ok) throw new Error("Failed to call backend zkp");
  const data = await res.json();
  return data.data as PartialZkLoginSignature;
}

async function GetSponsorFromBackend() {
  const res = await fetch("/api/zkp/sponsor", {
    method: "GET",
  });

  if (!res.ok) throw new Error("Failed to sponsor from backend");
  const data = await res.json();
  return data;
}
type LoginProps = {
  userAddress: string;
  maxEpoch: number;
  randomness: string;
  email: string;
  jwt: string;
  salt: string;
};
async function Login({
  email,
  maxEpoch,
  randomness,
  userAddress,
  jwt,
  salt,
}: LoginProps) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      maxEpoch,
      randomness,
      userAddress,
      jwt,
      salt,
    }),
  });
  if (!res.ok) throw new Error("Failed to login");
}
