import Deco from "@/components/Deco";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserSidebar } from "@/components/user-sidebar";
import db from "@/db/drizzle";
import { issuerApplication } from "@/db/schema";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function UserLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession(await cookies());
  if (!session.id) redirect("/sign-in");
  const issuerApplications = await db.query.issuerApplication.findFirst({
    where: eq(issuerApplication.applicant, session.id),
  });
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  const hasApplied = issuerApplications ? true : false;
  hasApplied;
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <UserSidebar hasApplied={hasApplied} />
      <Deco>{children}</Deco>
    </SidebarProvider>
  );
}
