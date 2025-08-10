import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getIronSession } from "iron-session";
import { env } from "@/lib/env/server";

export type SessionData = {
  id: string; // Change to string for UUID
  userAddress: string;
  maxEpoch: number;
  randomness: string;
  role: "admin" | "issuer" | "user";
};
export async function getSession(cookies: ReadonlyRequestCookies) {
  const session = await getIronSession<SessionData>(cookies, {
    password: env.SESSION_KEY,
    cookieName: "hashcred",
  });
  return session;
}

type SaveSessionProps = SessionData & { cookies: ReadonlyRequestCookies };
export async function SaveSession({
  cookies,
  id,
  maxEpoch,
  randomness,
  userAddress,
  role,
}: SaveSessionProps) {
  const session = await getSession(cookies);
  session.id = id;
  session.maxEpoch = maxEpoch;
  session.id = id;
  session.randomness = randomness;
  session.userAddress = userAddress;
  session.role = role;
  await session.save();

  return true;
}
