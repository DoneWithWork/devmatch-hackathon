"use server"

import db from "@/db/drizzle";
import { issuerApplication, users } from "@/db/schema";
import { ActionResponse } from "@/types/types";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { after } from "next/server";
import z from "zod";

type ApprovalType = {
    id: string;
}
const ApprovalSchema = z.object({
    id: z.string().min(1)
})
export async function ApproveApplication(prevState: ActionResponse<ApprovalType>, formData: FormData): Promise<ActionResponse<ApprovalType>> {
    const session = await getSession(await cookies());


    if (!session) return { success: false, errorMessage: 'Not logged in' }
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id)
    })
    if (!user) return { success: false, errorMessage: "No user found!!" }
    if (session.role !== "admin") return { success: false, errorMessage: 'Not an admin' }
    const rawData: ApprovalType = {
        id: formData.get("id") as string,
    }
    const parsed = ApprovalSchema.safeParse(rawData)
    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
            errorMessage: "Invalid form data",
            inputs: rawData
        };
    }
    const { id } = parsed.data
    const application = await db.query.issuerApplication.findFirst({
        where: eq(issuerApplication.id, Number(id))
    })
    if (!application) return { success: false, errorMessage: "No Application found" }
    await db.update(issuerApplication).set({
        status: "success"
    }).where(eq(issuerApplication.id, +id))
    after(() => {
        revalidatePath("/admin/applications")

    })
    await db.update(users).set({
        role: "issuer",

    }).where(eq(users.id, user.id))
    session.role = "admin"
    await session.save();
    return { success: true, message: "Successfully approved issuer" }

}