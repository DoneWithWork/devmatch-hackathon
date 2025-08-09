"use server";

import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function ToggleIssuerRoleAction() {

    const session = await getSession(await cookies());
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id)
    })
    if (!user) return { success: false }
    if (user.role !== "issuer") return { success: false, errorMessage: "Apply to be an issuer!!" }
    session.role = "issuer";
    await session.save();
    return { success: true, errorMessage: null };
}