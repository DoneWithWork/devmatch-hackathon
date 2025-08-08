import { getSession } from "@/utils/session";
import { cookies } from "next/headers";

export default async function UserPage() {
  const session = await getSession(await cookies());

  return <div>{session.id}</div>;
}
