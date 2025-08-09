import db from "@/db/drizzle";
import { issuerDocuments, users } from "@/db/schema";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

const auth = async () => {
    const session = await getSession(await cookies())

    if (!session) throw new Error("Failed to detect session");
    const user = await db.query.users.findFirst({
        where: eq(users.id, +session.id)
    })
    return user
}; // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
    // Define as many FileRoutes as you like, each with a unique routeSlug
    imageUploader: f({
        pdf: {
            maxFileCount: 10,
            maxFileSize: "4MB"
        }

    })
        // Set permissions and file types for this FileRoute
        .middleware(async ({ }) => {
            // This code runs on your server before upload
            const user = await auth();
            if (!user) throw new UploadThingError("Unauthorized");

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload

            const newIssuerDocument = await db.insert(issuerDocuments).values({
                key: file.key,
                publicUrl: file.ufsUrl,
                userId: metadata.userId
            })
            if (!newIssuerDocument) throw new Error("Failed to create new issuer document")
            return { fileUrl: file.ufsUrl };
        }),
    certificateUploader: f({
        image: {
            maxFileCount: 10,
            maxFileSize: "4MB"
        }

    })
        // Set permissions and file types for this FileRoute
        .middleware(async ({ }) => {
            // This code runs on your server before upload
            const user = await auth();
            if (!user) throw new UploadThingError("Unauthorized");
            if (user?.role === "user") throw new UploadThingError("Unauthorized")

            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // This code RUNS ON YOUR SERVER after upload

            const newIssuerDocument = await db.insert(issuerDocuments).values({
                key: file.key,
                publicUrl: file.ufsUrl,
                userId: metadata.userId
            })
            if (!newIssuerDocument) throw new Error("Failed to create new issuer document")
            return { fileUrl: file.ufsUrl };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
