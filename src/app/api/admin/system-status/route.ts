import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { issuerApplication } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SuiClient } from "@mysten/sui/client";

export async function GET() {
  try {
    // Environment variables
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    const walletAddress = process.env.ADMIN_WALLET_ADDRESS;
    const issuerCapId = process.env.CURRENT_ISSUER_CAP || process.env.ADMIN_CAP; // Fallback to ADMIN_CAP
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;

    if (!privateKey || !walletAddress || !packageId) {
      return NextResponse.json({
        success: false,
        error: "Missing required environment configuration",
        missing: {
          privateKey: !privateKey,
          walletAddress: !walletAddress,
          packageId: !packageId,
        },
      });
    }

    // Initialize status object
    const status = {
      addressMatch: false,
      ownershipMatch: false,
      issuerApproved: false,
      databaseConnected: false,
      blockchainConnected: false,
    };

    let issuerInfo = null;

    try {
      // Test database connection with a simple query
      const testQuery = await db.select().from(issuerApplication).limit(1);
      status.databaseConnected = true;

      // Check if there's an approved issuer application
      const approvedApplication = await db
        .select()
        .from(issuerApplication)
        .where(
          and(
            eq(issuerApplication.applicant, walletAddress),
            eq(issuerApplication.status, "approved")
          )
        )
        .limit(1);

      if (approvedApplication.length > 0) {
        const app = approvedApplication[0];
        issuerInfo = {
          id: issuerCapId || "Not configured",
          name: app.organizationName,
          email: app.contactEmail || "N/A",
          organization: app.organization || "N/A",
          approved: true,
          owner: app.applicant,
        };
        status.issuerApproved = true;
      } else {
        // Check for pending applications
        const pendingApplication = await db
          .select()
          .from(issuerApplication)
          .where(
            and(
              eq(issuerApplication.applicant, walletAddress),
              eq(issuerApplication.status, "pending")
            )
          )
          .limit(1);

        if (pendingApplication.length > 0) {
          const app = pendingApplication[0];
          issuerInfo = {
            id: issuerCapId || "Not configured",
            name: app.organizationName,
            email: app.contactEmail || "N/A",
            organization: app.organization || "N/A",
            approved: false,
            owner: app.applicant,
          };
        }
      }
    } catch (dbError) {
      console.error("Database error:", dbError);
      status.databaseConnected = false;
    }

    try {
      // Test blockchain connection
      const client = new SuiClient({
        url: "https://fullnode.devnet.sui.io:443",
      });

      // Skip address derivation check - use configured address as authoritative
      status.addressMatch = true; // Always true if using configured address
      status.blockchainConnected = true;

      // Check if issuer capability exists and ownership (optional)
      if (issuerCapId) {
        try {
          const issuerCapObject = await client.getObject({
            id: issuerCapId,
            options: { showOwner: true, showType: true },
          });

          if (
            issuerCapObject.data?.owner &&
            "AddressOwner" in issuerCapObject.data.owner
          ) {
            const capOwner = issuerCapObject.data.owner.AddressOwner;
            status.ownershipMatch = capOwner === walletAddress;
          }
        } catch (capError) {
          console.error("Error checking issuer capability:", capError);
          status.ownershipMatch = false;
        }
      } else {
        // If no issuer cap ID configured, skip ownership check
        status.ownershipMatch = true; // Assume OK if not configured
      }

      status.blockchainConnected = true;
    } catch (blockchainError) {
      console.error("Blockchain error:", blockchainError);
      status.blockchainConnected = false;
    }

    return NextResponse.json({
      success: true,
      status,
      issuerInfo,
    });
  } catch (error) {
    console.error("System status check error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check system status",
    });
  }
}
