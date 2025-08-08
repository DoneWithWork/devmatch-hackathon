"use server";

import { getSession } from "@/utils/session";
import { cookies } from "next/headers";

export async function AdminAction() {

    const session = await getSession(await cookies());
    session.role = "admin";
    await session.save();
    return { success: true };
}