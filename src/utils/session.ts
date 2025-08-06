import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getIronSession } from 'iron-session';

export type SessionData = {
    id: string;
    userAddress: string;
    maxEpoch: number;
    randomness: string;
}
export async function getSession(cookies: ReadonlyRequestCookies) {
    const session = await getIronSession<SessionData>(cookies, { password: process.env.SESSION_KEY!, cookieName: "hashcred" })
    return session
}

type SaveSessionProps = SessionData & { cookies: ReadonlyRequestCookies }
export async function SaveSession({ cookies, id, maxEpoch, randomness, userAddress }: SaveSessionProps) {
    const session = await getSession(cookies)
    session.id = id
    session.maxEpoch = maxEpoch
    session.id = id;
    session.randomness = randomness;
    session.userAddress = userAddress;
    await session.save();

    return true;

}