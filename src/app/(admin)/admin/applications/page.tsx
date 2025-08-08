import { AdminApplicationsColumn } from "@/components/tables/AdminApplicationsColumns";
import { DataTable } from "@/components/tables/data-table";
import db from "@/db/drizzle";
import { issuerApplication, issuerDocuments } from "@/db/schema";
import { ApplicationWithDocuments } from "@/types/types";
import { eq } from "drizzle-orm";

export default async function AdminApplications() {
  const applications: ApplicationWithDocuments[] = await db
    .select()
    .from(issuerApplication)
    .leftJoin(
      issuerDocuments,
      eq(issuerDocuments.issuerApplicationId, issuerApplication.id)
    );
  console.log(applications[0]);
  return (
    <div className="w-full px-2 py-2">
      <p>Issuer Applications</p>
      <DataTable columns={AdminApplicationsColumn} data={applications} />
    </div>
  );
}
