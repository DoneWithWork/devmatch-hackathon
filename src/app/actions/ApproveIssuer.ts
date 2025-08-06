"use server"

import db from "@/db/drizzle";
import { issuerApplication, issuerDocuments } from "@/db/schema";
import { checkTXTRecord } from "@/lib/dns";
import { env } from "@/lib/env/client";
import { ApprovalIssuerSchema } from "@/schema/schema";
import { ActionResponse, ApprovalIssuerInstitutionType, ApprovalIssuerType } from "@/types/types";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function ApproveIssuerAction(prevState: ActionResponse<ApprovalIssuerType>, formData: FormData): Promise<ActionResponse<ApprovalIssuerType>> {
    const session = await getSession(await cookies());


    if (!session) return { success: false, errorMessage: 'Not logged in' }

    const rawData: ApprovalIssuerType = {
        domain: formData.get("domain") as string,
        institution: formData.get("institution") as ApprovalIssuerInstitutionType,
    }
    const parsed = ApprovalIssuerSchema.safeParse(rawData)
    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
            errorMessage: "Invalid form data",
            inputs: rawData
        };
    }
    const { domain, institution } = parsed.data

    //double check domain TXT record
    const status = await checkTXTRecord({ domain: new URL(`https://${domain}`).hostname, matchingKey: "hashcred", matchingValue: env.NEXT_PUBLIC_TXT_KEY })
    if (!status) return { success: false, errorMessage: "DNS TXT verification failed!!" }


    const newIssuerApplication = await db.insert(issuerApplication).values({
        domain,
        applicant: session.id,
        institution
    }).returning({
        id: issuerApplication.id
    })
    if (!newIssuerApplication) return { success: false, errorMessage: "Failed to create new appication" }

    await db
        .update(issuerDocuments)
        .set({ issuerApplicationId: newIssuerApplication[0].id })
        .where(eq(issuerDocuments.userId, session.id));


    return { success: true, message: "Successfully created new application" }
}