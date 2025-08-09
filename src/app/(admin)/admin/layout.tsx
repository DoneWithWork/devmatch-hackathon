import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { getSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession(await cookies());
  const admin = await db.query.users.findFirst({
    where: eq(users.id, session.id),
  });
  if (!admin) redirect("/");
  if (session.role !== "admin") redirect("/");

  return (
    <SidebarProvider>
      <AppSidebar />
      {children}
    </SidebarProvider>
  );
}
