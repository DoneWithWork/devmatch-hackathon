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

type RejectType = {
    id: string;
    reason: string;
}
const RejectSchema = z.object({
    id: z.string().min(1),
    reason: z.string().min(1, {
        message: "Require a reason"
    })
})
export async function RejectApplication(prevState: ActionResponse<RejectType>, formData: FormData): Promise<ActionResponse<RejectType>> {
    const session = await getSession(await cookies());


    if (!session) return { success: false, errorMessage: 'Not logged in' }
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.id)
    })
    if (!user) return { success: false, errorMessage: "No user found!!" }
    if (user.role !== "admin") return { success: false, errorMessage: 'Not an admin' }
    const rawData: RejectType = {
        id: formData.get("id") as string,
        reason: formData.get("reason") as string,
    }
    const parsed = RejectSchema.safeParse(rawData)
    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
            errorMessage: "Invalid form data",
            inputs: rawData
        };
    }
    const { id, reason } = parsed.data
    const application = await db.query.issuerApplication.findFirst({
        where: eq(issuerApplication.id, Number(id))
    })
    if (!application) return { success: false, errorMessage: "No Application found" }
    const rejectedApplication = await db.update(issuerApplication).set({
        status: "rejected",
        reason
    }).where(eq(issuerApplication.id, +id))
    if (!rejectedApplication) return { success: false, errorMessage: "Failed to delete application" }
    after(() => {
        revalidatePath("/admin/applications")

    })
    return { success: true, message: "Successfully approved issuer" }

}