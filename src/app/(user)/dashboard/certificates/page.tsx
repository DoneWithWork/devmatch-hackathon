import db from "@/db/drizzle";
import { individualCert, users } from "@/db/schema";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

export default async function CertificatesPage() {
  const session = await getSession(await cookies());
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.id),
  });
  if (!user) redirect("/");

  const singleCerts = await db.query.individualCert.findMany({
    where: eq(individualCert.email, user.email),
  });

  return (
    <section className="">
      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
        My Certificates
      </h1>
      <p className="text-gray-600 text-center mb-10">
        Here are the certificates you’ve earned. Click on a certificate to view
        it in full size.
      </p>

      {/* Certificate Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {singleCerts && singleCerts.length > 0 ? (
          singleCerts.map((cert, index) => (
            <Link
              href={`/dashboard/certificates/${cert.id}`}
              key={index}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="relative w-full h-56">
                <Image
                  src={cert.imageUrl}
                  alt="Certificate"
                  fill
                  className="object-cover cursor-pointer hover:scale-105 transition-transform selector"
                />
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-500">
                  Issued on {new Date(cert.created_at).toLocaleDateString()}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-3 text-center text-gray-500">
            You don’t have any certificates yet.
          </p>
        )}
      </div>
    </section>
  );
}
