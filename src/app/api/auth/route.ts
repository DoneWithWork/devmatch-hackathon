import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { SaveSession } from "@/utils/session";
import { jwtToAddress } from "@mysten/sui/zklogin";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Body = {
    userAddress: string;
    maxEpoch: number;
    randomness: string;
    email: string;
    jwt: string;
    salt: string;
}
export async function POST(request: NextRequest) {
    const body = await request.json() as Body
    const { maxEpoch, randomness, userAddress, email, jwt, salt } = body
    const zkLoginUserAddress = jwtToAddress(jwt, salt);
    if (zkLoginUserAddress !== userAddress) {
        return NextResponse.json({ nessage: "Failed to login" }, {
            status: 400
        })
    }
    const curCookies = await cookies();
    const user = await db.query.users.findFirst({
        where: eq(users.userAddress, userAddress)
    })
    if (!user) {
        const newUser = await db.insert(users).values({
            userAddress,
            email
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