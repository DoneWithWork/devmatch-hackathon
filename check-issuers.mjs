import { db } from "./src/db/db.ts";
import { users, issuers } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";

async function checkIssuer() {
  try {
    // Get all approved issuers
    const result = await db
      .select({
        userId: issuers.userId,
        issuerKey: issuers.issuerKey,
        isVerified: issuers.isVerified,
        userAddress: users.userAddress,
        email: users.email,
      })
      .from(issuers)
      .leftJoin(users, eq(issuers.userId, users.id))
      .where(eq(issuers.isVerified, true));

    console.log("Approved issuers in database:");
    result.forEach((issuer, index) => {
      console.log(index + 1 + ". Address: " + issuer.userAddress);
      console.log("   Email: " + issuer.email);
      console.log("   IssuerCap: " + issuer.issuerKey);
      console.log("   Verified: " + issuer.isVerified);
      console.log("");
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
  process.exit(0);
}

checkIssuer();
