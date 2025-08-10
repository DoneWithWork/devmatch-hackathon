import { db } from "./src/db/db.ts";
import { issuers } from "./src/db/schema.ts";

const checkIssuers = async () => {
  try {
    const allIssuers = await db.select().from(issuers);
    console.log("Issuers in database:");
    allIssuers.forEach((issuer) => {
      console.log("- ID:", issuer.id);
      console.log("  Wallet:", issuer.walletAddress);
      console.log("  Name:", issuer.name);
      console.log("  Status:", issuer.status);
      console.log("  ---");
    });
  } catch (error) {
    console.error("Error:", error.message);
  }
};

checkIssuers();
