"use client";
import { cn } from "@/lib/utils";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { generateNonce, generateRandomness } from "@mysten/sui/zklogin";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { IconType } from "react-icons/lib";
import { SiFacebook } from "react-icons/si";
import sui from "../public/sui.svg";
import {
  getEphemeralKeyPairsFromStorage,
  storeEphemeralKeyPair,
} from "./hooks/useEphemeralKeyPair";
import { env } from "./lib/env/client";
import { getSuiClient } from "./utils/suiClient";

type ProviderTypes = {
  provider: ProvidersNameType;
  icon: IconType;
  colour: string;
  textColour: string;
};
const providers: ProviderTypes[] = [
  {
    provider: "google",
    icon: FcGoogle,
    colour: "bg-white",
    textColour: "text-black",
  },

  {
    provider: "facebook",
    icon: SiFacebook,
    colour: "bg-[#1877F2]",
    textColour: "text-white",
  },
] as const;
export default function SignInCom() {
  const router = useRouter();
  return (
    <div className="h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center px-2 mt-4">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-purple-400/20 to-purple-400/20 backdrop-blur-sm"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-40 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-purple-400/20 to-yellow-400/20 backdrop-blur-sm"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400/20 to-purple-400/20 backdrop-blur-sm"
        />
      </div>

      <div className="mt-20  sm:mx-auto sm:max-w-lg w-full h-[700px] border border-purple-500 rounddecodeEphemeralKeyPairs(keyPair);ed-xl shadow-md">
        <div className="h-full w-full px-3 py-5 flex flex-col items-center">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg mb-3">
            <Shield className="size-12 text-white " />
          </div>
          <p className="font-semibold text-4xl">Welcome</p>
          <p className="text-base text-gray-800 mt-3 font-medium">
            Sign In With Your Social Provider
          </p>
          <div className="w-full h-full mx-2 my-3 flex flex-col items-center justify-center gap-8 mt-10 ">
            {providers.map((provider, index) => (
              <button
                onClick={async () => {
                  const url = await generateOAuthProviderLink({
                    provider: provider.provider,
                  });
                  router.push(url);
                }}
                className={cn(
                  "w-[80%] h-[60px] flex flex-col items-center justify-center border  font-semibold text-lg rounded-sm cursor-pointer hover:scale-[101%] hover:shadow-md transition-transform duration-300 shadow-xs",
                  provider.colour,
                  provider.textColour
                )}
                key={index}
              >
                <span className="flex flex-row items-center gap-2">
                  <provider.icon className="size-8" /> Log In With{" "}
                  {provider.provider}
                </span>
              </button>
            ))}
          </div>
          <div className="w-full h-full px-2 py-3 flex flex-row items-center justify-center gap-4 ">
            <p className="font-semibold text-xl ">Featuring zkLogin from </p>
            <Image
              src={sui}
              alt="SUI logo"
              width={200}
              height={150}
              className="object-cover w-22 selector"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
type ProvidersNameType = "google" | "twitch" | "facebook" | "apple";

async function generateOAuthProviderLink({
  provider,
}: {
  provider: ProvidersNameType;
}): Promise<string> {
  // Try to get stored key pair
  const stored = await getEphemeralKeyPairsFromStorage("ephemeral-key-pair");
  const { epoch } = await getSuiClient().getLatestSuiSystemState();
  let ephemeralKeyPair: Ed25519Keypair;
  let randomness: string;
  let maxEpoch: number;
  if (stored && stored.maxEpoch < +epoch) {
    ({ ephemeralKeyPair, maxEpoch, randomness } = stored);
  } else {
    // generate new key paid
    randomness = generateRandomness();
    ephemeralKeyPair = new Ed25519Keypair();
    const { epoch } = await getSuiClient().getLatestSuiSystemState();
    maxEpoch = Number(epoch) + 10;
    // store this epoch
    await storeEphemeralKeyPair(ephemeralKeyPair, randomness, maxEpoch);
  }
  const nonce = generateNonce(
    ephemeralKeyPair.getPublicKey(),
    maxEpoch,
    randomness
  );

  const url = returnUrl({ provider, nonce });
  return url;
}
type ReturnUrlType = {
  provider: ProvidersNameType;
  nonce: string;
};
function returnUrl({ provider, nonce }: ReturnUrlType): string {
  switch (provider) {
    case "google":
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}&response_type=id_token&redirect_uri=${env.NEXT_PUBLIC_REDIRECT_URL}&scope=openid%20email%20profile&nonce=${nonce}`;

    case "facebook":
      return `https://www.facebook.com/v17.0/dialog/oauth?client_id=${env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID}&redirect_uri=${env.NEXT_PUBLIC_REDIRECT_URL}&scope=openid%20email&nonce=${nonce}&response_type=id_token`;

    case "twitch":
      return `https://id.twitch.tv/oauth2/authorize?client_id=${env.NEXT_PUBLIC_TWITCH_CLIENT_ID}&force_verify=true&lang=en&login_type=login&redirect_uri=${env.NEXT_PUBLIC_REDIRECT_URL}&response_type=id_token&scope=openid&nonce=${nonce}`;

    case "apple":
      return `https://appleid.apple.com/auth/authorize?client_id=${env.NEXT_PUBLIC_APPLE_CLIENT_ID}&redirect_uri=${env.NEXT_PUBLIC_REDIRECT_URL}&scope=email&response_mode=form_post&response_type=code%20id_token&nonce=${nonce}`;

    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
