import { unstable_cache } from "next/cache";
import db from "./drizzle";
async function GetIssuerApplications() {
    const applications = await db.query.issuerApplication.findMany();
    return applications
}
export async function GetCachedIssuerApplications() {
    return unstable_cache(async () => GetIssuerApplications(), ['issuer_application'], {
        revalidate: false,
        tags: ['issuer_applications']
    })()
}
