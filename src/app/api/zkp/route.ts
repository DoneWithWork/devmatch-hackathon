import { GenerateZkLogin } from "@/utils/zkUtils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { jwt, network, maxEpoch, randomness, ephemeralPublicKey } = body
    const data = await GenerateZkLogin({ jwt, network, maxEpoch, randomness, ephemeralPublicKey })
    return NextResponse.json(data, { status: 200 })
}