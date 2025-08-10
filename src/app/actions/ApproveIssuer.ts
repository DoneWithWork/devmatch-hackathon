"use server";

import db from "@/db/drizzle";
import { issuerApplication, issuerDocuments } from "@/db/schema";
import { checkTXTRecord } from "@/lib/dns";
import { env } from "@/lib/env/client";
import { ApprovalIssuerSchema } from "@/schema/schema";
import {
  ActionResponse,
  ApprovalIssuerOrganizationType,
  ApprovalIssuerType,
} from "@/types/types";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function ApproveIssuerAction(
  prevState: ActionResponse<ApprovalIssuerType>,
  formData: FormData
): Promise<ActionResponse<ApprovalIssuerType>> {
  const session = await getSession(await cookies());

  if (!session) return { success: false, errorMessage: "Not logged in" };

  const rawData: ApprovalIssuerType = {
    domain: formData.get("domain") as string,
    organization: formData.get("organization") as string,
  };

  // Extract uploaded file URLs
  const fileUrls: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("fileUrl_") && value) {
      fileUrls.push(value as string);
    }
  }
  const parsed = ApprovalIssuerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors,
      errorMessage: "Invalid form data",
      inputs: rawData,
    };
  }
  const { domain, organization } = parsed.data;

  //double check domain TXT record
  const status = await checkTXTRecord({
    domain: new URL(`https://${domain}`).hostname,
    matchingKey: "hashcred",
    matchingValue: env.NEXT_PUBLIC_TXT_KEY,
  });
  if (!status)
    return { success: false, errorMessage: "DNS TXT verification failed!!" };

  const newIssuerApplication = await db
    .insert(issuerApplication)
    .values({
      domain,
      applicant: session.id,
      organizationName: organization || domain, // Use organization or fallback to domain
      organization,
      // Don't manually set timestamps - let database handle them
    })
    .returning({
      id: issuerApplication.id,
    });
  if (!newIssuerApplication)
    return { success: false, errorMessage: "Failed to create new appication" };

  // Save uploaded documents to the database
  if (fileUrls.length > 0) {
    for (const fileUrl of fileUrls) {
      await db.insert(issuerDocuments).values({
        publicUrl: fileUrl,
        fileName: fileUrl.split("/").pop() || fileUrl, // Extract filename from URL
        key: fileUrl.split("/").pop() || fileUrl, // Extract filename from URL
        userId: session.id,
        issuerApplicationId: newIssuerApplication[0].id,
      });
    }
    console.log(
      `✅ Saved ${fileUrls.length} documents for application ${newIssuerApplication[0].id}`
    );
  }

  await db
    .update(issuerDocuments)
    .set({ issuerApplicationId: newIssuerApplication[0].id })
    .where(eq(issuerDocuments.userId, session.id));

  return { success: true, message: "Successfully created new application" };
}
