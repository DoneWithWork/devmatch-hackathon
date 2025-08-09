import NewCertificateBtn from "@/components/issuer/NewCertificateBtn";
import db from "@/db/drizzle";
import { certificates } from "@/db/schema";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import Link from "next/link";

export default async function IssuerPage() {
  const session = await getSession(await cookies());
  const issuedCerts = await db.query.certificates.findMany({
    where: eq(certificates.userId, session.id),
  });

  return (
    <div className="w-full ">
      <div className="flex flex-col items-center justify-between mb-5 px-4 py-3 z-10">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          Issue Certs
        </h1>
        <p className="text-gray-600 text-center mb-10">
          Here are the certificates you’ve earned. Click on a certificate to
          view it in full size.
        </p>
      </div>
      <div className="">
        <NewCertificateBtn />
      </div>
      <div className="px-2 py-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 w-full ">
        {issuedCerts &&
          issuedCerts.map((cert) => (
            <Link
              href={`/dashboard/issuer/cert/${cert.id}`}
              key={cert.id}
              className=" shadow-xl z-10 border-2 rounded-lg p-0 m-0 cursor-pointer hover:scale-[102%] duration-300 hover:shadow-2xl transition-all ease-linear"
            >
              <div
                className="h-40 w-full rounded-md rounded-b-none p-0 m-0 "
                style={{ backgroundColor: cert.colour }}
              ></div>
              <div className="w-full px-2 py-2 relative h-22">
                <span className="font-medium">{cert.title}</span>
                <span className="absolute bottom-0 right-2 font-light text-gray-600">
                  {new Date(cert.created_at).toDateString()}
                </span>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
