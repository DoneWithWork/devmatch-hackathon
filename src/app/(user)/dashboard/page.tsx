import BecomeIssuerBtn from "@/components/BecomeIssuerBtn";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import React from "react";

export default async function UserPage() {
  const session = await getSession(await cookies());
  const isIssuer = session.role === "issuer";
  return (
    <div>
      {session.id}
      <BecomeIssuerBtn isIssuer={isIssuer} />
    </div>
  );
}
