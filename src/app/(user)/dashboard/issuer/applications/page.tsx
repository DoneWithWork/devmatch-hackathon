import { ApplicationColumn } from "@/components/tables/ApplicationsColumn";
import { DataTable } from "@/components/tables/data-table";
import db from "@/db/drizzle";
import { issuerApplication, issuerDocuments } from "@/db/schema";
import { ApplicationWithDocuments } from "@/types/types";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export default async function IssuerApplications() {
  const session = await getSession(await cookies());
  const applications: ApplicationWithDocuments[] = await db
    .select()
    .from(issuerApplication)
    .leftJoin(
      issuerDocuments,
      eq(issuerDocuments.issuerApplicationId, issuerApplication.id)
    )
    .where(eq(issuerDocuments.userId, session.id));
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Your Applications
      </h1>
      <p className="text-gray-600 text-center mb-10">
        Here is a list of all your applications to be an issuer
      </p>
      <DataTable columns={ApplicationColumn} data={applications} />
    </div>
  );
}
