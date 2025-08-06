import { cookies } from "next/headers";
import { getSession } from "./utils/session";
import { redirect } from "next/navigation";

export async function middleware() {
    const session = await getSession(await cookies());
    if (!session) redirect('/')

}
//
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/admin/:path*',

    ],
}