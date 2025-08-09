"use client";
import useEphemeralKeyPair, {
  getEphemeralKeyPairsFromStorage,
} from "@/hooks/useEphemeralKeyPair";
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
  getZkLoginSignature,
  jwtToAddress,
} from "@mysten/sui/zklogin";
import { jwtDecode, JwtPayload } from "jwt-decode";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import miner from "../../public/signing-in.gif";

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

        const payload = jwtDecode<
          JwtPayload & { nonce: string; email: string }
        >(jwt);
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
        // Get the salt required to generate Login Address
        const { salt } = await GetSalt(jwt);

        //Derive address from jwt and salt
        const zkLoginUserAddress = jwtToAddress(jwt, salt);
        // Derive the partialSignature required
        const proofResponse = await CallZkpRoute({
          jwt,
          network: NETWORK,
          maxEpoch,
          randomness,
          ephemeralPublicKey: ExtendedEphemeralKeyPair,
        });
        const partialZkLoginSignature =
          proofResponse as PartialZkLoginSignature;

        const addressSeed = genAddressSeed(
          BigInt(salt!),
          "sub",
          payload.sub!,
          payload.aud
        ).toString();
        const trx = new Transaction();
        const [coin] = trx.splitCoins(trx.gas, [1]);
        trx.transferObjects([coin], zkLoginUserAddress);
        const bytes = await trx.build({
          client,
          onlyTransactionKind: true,
        });
        const { bytes: sponsoredBytes, signature: sponsorSig } =
          await GetSponsorFromBackend({
            sender: zkLoginUserAddress,
            transactionKindBytes: bytes,
          });
        const newTrx = Transaction.from(sponsoredBytes);
        const signed = await newTrx.sign({
          client,
          signer: ephemeralKeyPair,
        });
        const userSignature = getZkLoginSignature({
          inputs: {
            ...partialZkLoginSignature,
            addressSeed,
          },
          maxEpoch,
          userSignature: signed.signature,
        });

        await client.executeTransactionBlock({
          transactionBlock: signed!.bytes,
          signature: [userSignature, sponsorSig],
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
          },
        });
        await Login({
          email: payload.email,
          jwt,
          maxEpoch,
          randomness,
          salt,
          userAddress: zkLoginUserAddress,
          privateKey: ephemeralKeyPair.getSecretKey(),
        });
        toast.success("Successfully logged in!");
        setTimeout(() => {
          router.push("/dashboard/certificates");
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
type SponsorType = {
  sender: string;
  transactionKindBytes: Uint8Array;
};
async function GetSponsorFromBackend({
  sender,
  transactionKindBytes,
}: SponsorType) {
  const res = await fetch("/api/zkp/sponsor", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender,
      transactionKindBytes:
        Buffer.from(transactionKindBytes).toString("base64"),
    }),
  });

  if (!res.ok) throw new Error("Failed to sponsor from backend");
  const data = await res.json();
  return data as { bytes: string; signature: string };
}
type LoginProps = {
  userAddress: string;
  maxEpoch: number;
  randomness: string;
  email: string;
  jwt: string;
  salt: string;
  privateKey: string;
};
async function Login({
  email,
  maxEpoch,
  randomness,
  userAddress,
  jwt,
  salt,
  privateKey,
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
      privateKey,
    }),
  });
  if (!res.ok) throw new Error("Failed to login");
}
