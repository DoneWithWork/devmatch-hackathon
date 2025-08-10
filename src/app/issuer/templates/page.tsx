import { EnhancedTemplateManager } from "@/components/issuer/EnhancedTemplateManager";
import { redirect } from "next/navigation";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function TemplateManagerPage() {
  const session = await getSession(await cookies());

  if (!session) {
    redirect("/auth");
  }

  // Check current user role from database to ensure we have the latest role
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.id),
  });

  // Update session with current role if it doesn't match
  if (user && user.role !== session.role) {
    session.role = user.role;
    await session.save();
  }

  if (!user || user.role !== "issuer") {
    redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto py-8">
        <EnhancedTemplateManager />
      </div>
    </div>
  );
}
