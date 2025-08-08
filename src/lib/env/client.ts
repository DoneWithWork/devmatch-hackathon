import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    client: {
        NEXT_PUBLIC_TXT_KEY: z.string().min(1),
        NEXT_PUBLIC_ENOKI_KEY: z.string().min(1),
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().min(1),
        NEXT_PUBLIC_SUI_ADDRESS: z.string().min(1),
        NEXT_PUBLIC_APPLE_CLIENT_ID: z.string().min(1),
        NEXT_PUBLIC_FACEBOOK_CLIENT_ID: z.string().min(1),
        NEXT_PUBLIC_TWITCH_CLIENT_ID: z.string().min(1),
        NEXT_PUBLIC_REDIRECT_URL: z.string().min(1),
    },
    runtimeEnv: {
        NEXT_PUBLIC_TXT_KEY: process.env.NEXT_PUBLIC_TXT_KEY,
        NEXT_PUBLIC_ENOKI_KEY: process.env.NEXT_PUBLIC_ENOKI_KEY,
        NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        NEXT_PUBLIC_SUI_ADDRESS: process.env.NEXT_PUBLIC_SUI_ADDRESS,
        NEXT_PUBLIC_APPLE_CLIENT_ID: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
        NEXT_PUBLIC_FACEBOOK_CLIENT_ID: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
        NEXT_PUBLIC_TWITCH_CLIENT_ID: process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
        NEXT_PUBLIC_REDIRECT_URL: process.env.NEXT_PUBLIC_REDIRECT_URL,


    },
});