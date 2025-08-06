import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { SaveSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Body = {
    userAddress: string;
    maxEpoch: number;
    randomness: string;
}
export async function POST(request: NextRequest) {
    const body = await request.json() as Body
    const { maxEpoch, randomness, userAddress } = body
    const curCookies = await cookies();
    const user = await db.query.users.findFirst({
        where: eq(users.userAddress, userAddress)
    })
    if (!user) {
        const newUser = await db.insert(users).values({
            userAddress,

        }).returning({ userAddress: users.userAddress, userId: users.id })
        if (!newUser) return NextResponse.json({ message: "Failed to create a new user" }, {
            status: 500
        })
        await SaveSession({ cookies: curCookies, id: newUser[0].userId, maxEpoch, randomness, userAddress, role: "user" })

    } else {
        await SaveSession({ cookies: curCookies, id: user.id, maxEpoch, randomness, userAddress, role: user.role! })
    }

    return NextResponse.json({ message: "Successfully saved the session!" }, {
        status: 200
    })


}