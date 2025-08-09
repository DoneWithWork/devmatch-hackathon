import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getSession(await cookies())
    return NextResponse.json({})
}