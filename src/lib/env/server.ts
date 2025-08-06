import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string().url(),
        PRIVATE_ENOKI_KEY: z.string().min(1),
        SESSION_KEY: z.string().min(1),
        UPLOADTHING_TOKEN: z.string().min(1)
    },

    experimental__runtimeEnv: process.env
});