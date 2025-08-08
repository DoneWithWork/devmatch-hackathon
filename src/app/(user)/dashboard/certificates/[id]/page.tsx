import { Button } from "@/components/ui/button";
import db from "@/db/drizzle";
import { individualCert, users } from "@/db/schema";
import { getSession } from "@/utils/session";
import { and, eq } from "drizzle-orm";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function SingleCertPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession(await cookies());
  const { id } = await params;
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.id),
  });
  if (!user) redirect("/");

  const cert = await db.query.individualCert.findFirst({
    where: and(
      eq(individualCert.email, user.email),
      eq(individualCert.id, +id)
    ),
    with: {
      mainCert: true,
    },
  });

  if (!cert) redirect("/dashboard/certificates");

  const blockchainStatus = cert?.minted ? "minted" : "unminted";

  const statusConfig = {
    minted: {
      text: "Minted on-chain",
      color: "text-green-600",
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      glow: "shadow-[0_0_20px_rgba(34,197,94,0.3)]",
    },
    pending: {
      text: "Pending blockchain confirmation",
      color: "text-yellow-500",
      icon: <Clock className="w-6 h-6 text-yellow-500" />,
      glow: "shadow-[0_0_20px_rgba(250,204,21,0.3)]",
    },
    unminted: {
      text: "Not yet minted",
      color: "text-red-500",
      icon: <XCircle className="w-6 h-6 text-red-500" />,
      glow: "shadow-[0_0_20px_rgba(248,113,113,0.3)]",
    },
  };

  const { text, color, icon, glow } = statusConfig[blockchainStatus];

  return (
    <div className=" min-h-screen w-full bg-gradient-to-br from-orange-50 via-white to-orange-100 p-8 text-gray-900 relative">
      {/* Soft orange highlight overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,165,0,0.15),transparent_60%)] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
          Certificate Details
        </h1>

        {/* Glass Card */}
        <div
          className={`rounded-2xl border border-orange-200/40 bg-white/70 backdrop-blur-xl p-6 shadow-lg ${glow}`}
        >
          {/* Certificate Image */}
          <div className="rounded-xl overflow-hidden border border-orange-200/30 shadow-md mb-6">
            <Image
              src={cert?.imageUrl || "/placeholder-cert.png"}
              alt="Certificate"
              width={900}
              height={500}
              className="object-cover w-full"
            />
          </div>

          {/* Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoBlock
              label="Title"
              value={cert.mainCert.title || "Blockchain Certificate"}
            />
            <InfoBlock
              label="Issued To"
              value={cert?.email || "Anonymous User"}
            />
            <InfoBlock
              label="Issued On"
              value={
                cert?.created_at
                  ? new Date(cert.created_at).toLocaleDateString()
                  : "N/A"
              }
            />
          </div>

          {/* Blockchain Status */}
          <div className="mt-8 flex items-center gap-3">
            {icon}
            <span className={`font-semibold ${color}`}>{text}</span>
          </div>

          {/* Mint Button */}
          {blockchainStatus === "unminted" && (
            <div className="mt-8">
              <Button
                className="bg-gradient-to-r max-w-2xl w-full block mx-auto cursor-pointer from-orange-400 to-pink-400 text-white font-bold rounded-lg shadow-lg hover:opacity-90 transition-all border border-orange-200/50 backdrop-blur-md  text-xl"
                size={"lg"}
              >
                Mint Certificate
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-orange-500 font-semibold">
        {label}
      </p>
      <p className="text-lg font-semibold text-gray-900">{value}</p>
    </div>
  );
}
