import { checkTXTRecord } from "@/lib/dns"
import { env } from "@/lib/env/client";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ domain: string }> }
) {
    const { domain } = await params;
    const hostName = new URL(`https://${domain}`).hostname;
    const result = await checkTXTRecord({ domain: hostName, matchingKey: "hashcred", matchingValue: env.NEXT_PUBLIC_TXT_KEY })

    return NextResponse.json({ status: result }, {
        status: 200
    })
}