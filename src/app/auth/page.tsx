import Auth from "@/components/Auth";
import Landing from "@/components/landing";
import Navbar from "@/components/landing/Navbar";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
export default async function Page() {
  const session = await getSession(await cookies());
  const loggedIn = session.id ? true : false;
  return (
    <div>
      <Navbar loggedIn={loggedIn} />
      <Landing>
        <div className="h-screen">
          <Auth />
        </div>
      </Landing>
    </div>
  );
}
