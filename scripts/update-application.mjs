#!/usr/bin/env node

import { db } from "../src/db/db.js";
import { issuerApplication } from "../src/db/schema.js";
import { eq } from "drizzle-orm";

async function updateApplication() {
  try {
    console.log("🔄 Updating application with IssuerCap...");

    const issuerCapId =
      "0x661587796ff001f8efa17b59bdb2d52b2538583569d6b8db4579b6d668b5984b";
    const transactionDigest = "6M47z8uWvuPh4AJkXnfa48LRVYFC87ysXkvSDTtAMy7q";
    const applicationId = 12;

    const result = await db
      .update(issuerApplication)
      .set({
        issuerCapId: issuerCapId,
        transactionDigest: transactionDigest,
        status: "pending", // Reset to pending so it can be approved again
      })
      .where(eq(issuerApplication.id, applicationId))
      .returning();

    console.log("✅ Application updated:", result);
    console.log("");
    console.log(
      "🎯 Now you can approve the issuer again and it WILL spend gas!"
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating application:", error);
    process.exit(1);
  }
}

updateApplication();
