"use client";
import React from "react";
import { generateNonce, generateRandomness } from "@mysten/sui/zklogin";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getSuiClient } from "@/utils/suiClient";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { storeEphemeralKeyPair } from "@/hooks/useEphemeralKeyPair";
export default function GoogleLogin() {
  const router = useRouter();
  async function generateUrl() {
    const randomness = generateRandomness();
    const ephemeralKeyPair = new Ed25519Keypair();
    const { epoch } = await getSuiClient().getLatestSuiSystemState();
    const maxEpoch = Number(epoch) + 2;

    const nonce = generateNonce(
      ephemeralKeyPair.getPublicKey(),
      maxEpoch,
      randomness
    );
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) throw new Error("Google client Id missing");
    const redirectUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    const searchParams = new URLSearchParams({
      client_id: clientId,
      response_type: "id_token",
      redirect_uri: `${
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : ""
      }/auth`,
      scope: "openid email profile",
      nonce: nonce,
    });
    storeEphemeralKeyPair(ephemeralKeyPair, randomness, maxEpoch);
    redirectUrl.search = searchParams.toString();
    router.push(redirectUrl.toString());
  }
  const connected = false;
  async function disconnect() {
    //setkeyless account
    localStorage.removeItem("ephemeral-key-pair");
    router.push("/");
  }
  if (connected) {
    return <button onClick={disconnect}>Disconnect</button>;
  }
  return (
    <div>
      <button
        onClick={generateUrl}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        <User className="h-4 w-4 inline mr-2" />
        ZkLogin
      </button>
    </div>
  );
}
