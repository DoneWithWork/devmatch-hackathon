import { db } from "@/db/db";
import { issuers, users, issuerApplication } from "@/db/schema";
import { eq } from "drizzle-orm";

async function fixUserData() {
  try {
    // Find user by address (replace with your actual address)
    const userAddress =
      "0x0b868e8ab81f18eb196d976f7f1bfbd2105360e7792ff07ef2630a3a4530ccd6";

    console.log("Looking for user with address:", userAddress);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.userAddress, userAddress))
      .limit(1);

    if (user.length === 0) {
      console.log("User not found!");
      return;
    }

    const userData = user[0];
    console.log("Found user:", userData);

    // Check if user has an approved issuer application
    const approvedApplication = await db
      .select()
      .from(issuerApplication)
      .where(eq(issuerApplication.blockchainAddress, userAddress))
      .limit(1);

    if (approvedApplication.length === 0) {
      console.log("No approved application found for this user");
      return;
    }

    const application = approvedApplication[0];
    console.log("Found application:", application);

    if (!application.issuerCapId) {
      console.log("No issuer capability ID in application");
      return;
    }

    // Update user role
    await db
      .update(users)
      .set({
        role: "issuer",
        isIssuer: true,
      })
      .where(eq(users.id, userData.id));

    console.log("Updated user role to issuer");

    // Create issuer record if it doesn't exist
    const existingIssuer = await db
      .select()
      .from(issuers)
      .where(eq(issuers.userId, userData.id))
      .limit(1);

    if (existingIssuer.length === 0) {
      await db.insert(issuers).values({
        issuerKey: application.issuerCapId,
        name: application.organizationName,
        displayName: application.organizationName,
        website: application.website,
        userId: userData.id,
        isActive: true,
        isVerified: true,
        verifiedAt: new Date(),
      });
      console.log("Created issuer record");
    } else {
      console.log("Issuer record already exists");
    }

    console.log("User data fixed successfully!");
    console.log("User ID:", userData.id);
    console.log("Issuer Cap ID:", application.issuerCapId);
  } catch (error) {
    console.error("Fix user data error:", error);
  }
}

fixUserData();
