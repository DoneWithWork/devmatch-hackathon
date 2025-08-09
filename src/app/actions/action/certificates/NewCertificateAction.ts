"use server";

import db from "@/db/drizzle";
import { certificates, individualCert, users } from "@/db/schema";
import { ActionResponse } from "@/types/types";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import RandomColour from "randomcolor";
import { UTApi } from "uploadthing/server";
import z from "zod";
const utapi = new UTApi()
const NewCertificateActionSchema = z.object({
    title: z.string().min(1, { message: "Need title" }),
    emails: z.array(z.string().email()).min(1, { message: "At least one email required!" }),
    files: z
        .array(z.custom<File>())
        .min(1, { message: "At least one file required" }),
});

type NewCertType = z.infer<typeof NewCertificateActionSchema>;

export async function NewCertificationAction(
    prevState: ActionResponse<NewCertType>,
    formData: FormData
): Promise<ActionResponse<NewCertType>> {
    const session = await getSession(await cookies());
    if (!session) return { success: false, errorMessage: "Not logged in" };

    const user = await db.query.users.findFirst({ where: eq(users.id, session.id) });
    if (!user) return { success: false, errorMessage: "No user found!" };
    if (user.role !== "issuer") return { success: false, errorMessage: "Not an issuer" };

    // Extract and parse formData
    const rawEmails = formData.get("emails") as string | null;
    const title = formData.get("title") as string | null;
    const files = formData.getAll("files") as File[];

    if (!rawEmails || !title || files.length === 0) {
        return { success: false, errorMessage: "Missing fields" };
    }

    const emails = rawEmails.split(",").map((e) => e.trim());

    const parsed = NewCertificateActionSchema.safeParse({ title, emails, files });
    if (!parsed.success) {
        return {
            success: false,
            errors: parsed.error.flatten().fieldErrors,
            errorMessage: "Invalid form data",
        };
    }

    // Validate count match
    if (emails.length !== files.length) {
        return { success: false, errorMessage: "Emails and files count mismatch" };
    }



    const res = await utapi.uploadFiles(files);
    const uploadedUrls = res.map((file) => {
        if (file.data) return file.data?.ufsUrl
        else {
            return ""
        }
    })
    // Upload files and pair them
    const colour = RandomColour({ luminosity: "light" })
    const certificate = await db
        .insert(certificates)
        .values({ title, userId: user.id, colour })
        .returning();

    if (!certificate || certificate.length === 0) {
        return { success: false, errorMessage: "Failed to create certificate entry" };
    }

    const certId = certificate[0].id;
    const individualCerts = emails.map((email, idx) => ({
        certificateId: certId,
        email,
        imageUrl: uploadedUrls[idx],
    }));

    const inserted = await db.insert(individualCert).values(individualCerts);
    if (!inserted) return { success: false, errorMessage: "Failed to create individual certs" };

    return { success: true, message: "Successfully saved all certs!" };
}
