import React, { ReactNode } from "react";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import Navbar from "@/components/landing/Navbar";
import Landing from "@/components/landing";
export default async function SignInLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession(await cookies());
  const loggedIn = session.id ? true : false;
  return (
    <div>
      <Navbar loggedIn={loggedIn} />
      <Landing>{children}</Landing>
    </div>
  );
}
