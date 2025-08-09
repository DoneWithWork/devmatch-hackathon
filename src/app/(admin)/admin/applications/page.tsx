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
  return (
    <div className="w-full px-2 py-2">
      <div className="flex flex-col items-center justify-between mb-5 px-4 py-3 z-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Issuer Applications
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Here you can view all the applications for becoming an issuer
        </p>
      </div>
      <DataTable columns={AdminApplicationsColumn} data={applications} />
    </div>
  );
}
