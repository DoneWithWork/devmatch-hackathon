import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user-sidebar";
import db from "@/db/drizzle";
import { issuerApplication } from "@/db/schema";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import React, { ReactNode } from "react";

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession(await cookies());
  const issuerApplications = await db.query.issuerApplication.findFirst({
    where: eq(issuerApplication.applicant, session.id),
  });
  const hasApplied = issuerApplications ? true : false;
  console.log(hasApplied);
  return (
    <SidebarProvider>
      <UserSidebar hasApplied={hasApplied} />
      {children}
    </SidebarProvider>
  );
}
