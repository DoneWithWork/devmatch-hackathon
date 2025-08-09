import { CertificatesIssuerColumn } from "@/components/tables/CertificatesIssuerColumn";
import { DataTable } from "@/components/tables/data-table";
import db from "@/db/drizzle";
import { certificates, individualCert } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { toast } from "sonner";

export default async function IssuerSingleCertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cert = await db.query.certificates.findFirst({
    where: eq(certificates.id, Number(id)),
  });
  const individuals = await db
    .select()
    .from(individualCert)
    .where(eq(individualCert.certificateId, Number(id)));
  if (!cert) {
    toast("Certificate Not Found!!");
    redirect("/dashboard/issuer");
  }
  return (
    <div className="w-full">
      <div
        className="h-20 w-full"
        style={{ backgroundColor: cert.colour }}
      ></div>
      <div className="px-3 py-3">
        <p className="text-3xl font-semibold">{cert.title}</p>
        <p className="text-xl font-light mb-10">
          {new Date(cert.created_at).toDateString()}
        </p>
        <DataTable columns={CertificatesIssuerColumn} data={individuals} />
      </div>
    </div>
  );
}
