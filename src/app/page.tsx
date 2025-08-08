import Landing from "@/components/landing";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import Navbar from "@/components/landing/Navbar";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";

export default async function Home() {
  const session = await getSession(await cookies());
  const loggedIn = session.id ? true : false;
  return (
    <div>
      <Navbar loggedIn={loggedIn} />
      <Landing>
        <Hero />
        <Features />
      </Landing>
    </div>
  );
}
