import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    const session = await getSession(await cookies())

    await session.destroy()
    console.log("Successfully delete session")
    return NextResponse.json({ message: "Successfully delete session! Logging out" }, {
        status: 200
    })
}