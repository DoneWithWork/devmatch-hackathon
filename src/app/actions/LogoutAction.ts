"use server"

import { getSession } from "@/utils/session"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function LogoutAction() {
    const session = await getSession(await cookies())
    if (!session) redirect('/sign-in')
    await session.destroy()

    return redirect("/")
}