import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { db } from "@/db/db";
import { issuerApplication, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// Smart contract configuration
const client = new SuiClient({ url: getFullnodeUrl("devnet") });
const PACKAGE_ID = process.env.PACKAGE_ID!;
const ISSUER_REGISTRY = process.env.ISSUER_REGISTRY!;

export async function GET() {
  try {
    // Fetch applications from Neon database with proper join
    const applications = await db
      .select({
        id: issuerApplication.id,
        organizationName: issuerApplication.organizationName,
        domain: issuerApplication.domain,
        institution: issuerApplication.institution,
        description: issuerApplication.description,
        website: issuerApplication.website,
        issuerCapId: issuerApplication.issuerCapId,
        transactionDigest: issuerApplication.transactionDigest,
        status: issuerApplication.status,
        createdAt: issuerApplication.created_at,
        updateAt: issuerApplication.update_at,
        applicant: users.userAddress,
        email: users.email,
        username: users.username,
      })
      .from(issuerApplication)
      .leftJoin(users, eq(issuerApplication.applicant, users.id))
      .orderBy(desc(issuerApplication.created_at));

    console.log("📧 Raw applications data from DB:", applications);

    // Transform to match frontend interface with proper email fallback
    const transformedApplications = applications.map((app) => ({
      id: app.id.toString(),
      organizationName:
        app.organizationName || app.username || "Unknown Organization",
      contactEmail: app.email || "No email provided",
      website: app.website || (app.domain ? `https://${app.domain}` : ""),
      description: app.description || `${app.institution} institution`,
      walletAddress: app.applicant || "No wallet address",
      status: app.status as "pending" | "success" | "rejected",
      appliedAt: app.createdAt?.toISOString() || new Date().toISOString(),
      createdAt: app.createdAt?.toISOString() || new Date().toISOString(),
      issuerCapId: app.issuerCapId,
      transactionDigest: app.transactionDigest,
      hasBlockchainIntegration: !!app.issuerCapId,
    }));

    console.log(
      "📧 Transformed applications with emails:",
      transformedApplications
    );

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
    });
  } catch (error) {
    console.error("Error fetching applications from database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if user already exists by wallet address OR email
    const existingUserByWallet = await db
      .select()
      .from(users)
      .where(eq(users.userAddress, body.walletAddress))
      .limit(1);

    const existingUserByEmail = await db
      .select()
      .from(users)
      .where(eq(users.email, body.contactEmail))
      .limit(1);

    let userId: number;

    if (existingUserByWallet.length === 0 && existingUserByEmail.length === 0) {
      // Create new user (no existing wallet or email)
      const [newUser] = await db
        .insert(users)
        .values({
          userAddress: body.walletAddress,
          email: body.contactEmail,
          username: body.organizationName,
        })
        .returning({ id: users.id });
      userId = newUser.id;
    } else if (existingUserByWallet.length > 0) {
      // User exists by wallet address - update their info
      userId = existingUserByWallet[0].id;
      await db
        .update(users)
        .set({
          email: body.contactEmail,
          username: body.organizationName,
        })
        .where(eq(users.id, userId));
    } else {
      // User exists by email - update their wallet address and username
      userId = existingUserByEmail[0].id;
      await db
        .update(users)
        .set({
          userAddress: body.walletAddress,
          username: body.organizationName,
        })
        .where(eq(users.id, userId));
    }

    // Check if this wallet address already has a pending/success application
    const existingApplication = await db
      .select()
      .from(issuerApplication)
      .where(eq(issuerApplication.applicant, userId))
      .limit(1);

    if (existingApplication.length > 0) {
      const status = existingApplication[0].status;
      if (status === "pending") {
        return NextResponse.json(
          {
            success: false,
            error:
              "You already have a pending application. Please wait for approval.",
          },
          { status: 409 }
        );
      } else if (status === "success") {
        return NextResponse.json(
          {
            success: false,
            error: "You are already an approved issuer.",
          },
          { status: 409 }
        );
      }
      // If rejected, allow reapplication by updating the existing record
      const [updatedApplication] = await db
        .update(issuerApplication)
        .set({
          organizationName: body.organizationName,
          domain: body.organizationName.toLowerCase().replace(/\s+/g, "-"),
          description: body.description,
          website: body.website,
          status: "pending",
        })
        .where(eq(issuerApplication.id, existingApplication[0].id))
        .returning();

      return NextResponse.json({
        success: true,
        application: {
          id: updatedApplication.id.toString(),
          organizationName: body.organizationName,
          contactEmail: body.contactEmail,
          website: body.website,
          description: body.description,
          walletAddress: body.walletAddress,
          status: "pending",
          appliedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        message: "Application resubmitted successfully",
      });
    }

    // Create new issuer application
    const [application] = await db
      .insert(issuerApplication)
      .values({
        applicant: userId,
        organizationName: body.organizationName, // Save the actual organization name
        domain: body.organizationName.toLowerCase().replace(/\s+/g, "-"),
        institution: "university", // Default to university, can be made dynamic
        description: body.description, // Save the actual description
        website: body.website, // Save the actual website
        status: "pending",
      })
      .returning();

    console.log("✅ New issuer application saved to Neon DB:", application);

    // Call smart contract to create IssuerCap
    let issuerCapId = null;
    let transactionDigest = null;

    try {
      console.log("🔗 Creating IssuerCap on blockchain...");

      // Use admin keypair instead of temporary keypair for gas payment
      const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY!;
      let adminKeypair: Ed25519Keypair;

      // Parse the admin private key properly
      if (adminPrivateKey.startsWith("suiprivkey1")) {
        const keyWithoutPrefix = adminPrivateKey.slice(11);
        const keyBytes = Buffer.from(keyWithoutPrefix, "base64");

        if (keyBytes.length >= 33) {
          const privateKeyBytes = keyBytes.slice(1, 33);
          adminKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
        } else {
          throw new Error("Invalid admin private key format");
        }
      } else {
        throw new Error("Invalid admin private key format");
      }

      console.log(
        "💰 Using admin keypair for gas payment:",
        adminKeypair.getPublicKey().toSuiAddress()
      );

      const txb = new TransactionBlock();
      txb.setGasBudget(5000000); // 5M MIST

      // Call apply_to_be_issuer function
      txb.moveCall({
        target: `${PACKAGE_ID}::issuer::apply_to_be_issuer`,
        arguments: [
          txb.pure(Array.from(new TextEncoder().encode(body.organizationName))),
          txb.pure(Array.from(new TextEncoder().encode(body.contactEmail))),
          txb.pure(Array.from(new TextEncoder().encode(body.organizationName))), // organization
          txb.object(ISSUER_REGISTRY),
        ],
      });

      const result = await client.signAndExecuteTransactionBlock({
        signer: adminKeypair, // Use admin keypair instead of temp keypair
        transactionBlock: txb,
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      transactionDigest = result.digest;

      // Find the created IssuerCap object
      if (result.objectChanges) {
        for (const change of result.objectChanges) {
          if (
            change.type === "created" &&
            change.objectType.includes("IssuerCap")
          ) {
            issuerCapId = change.objectId;
            break;
          }
        }
      }

      console.log("✅ IssuerCap created successfully:", {
        transactionDigest,
        issuerCapId,
      });

      // Update the application with blockchain data
      await db
        .update(issuerApplication)
        .set({
          issuerCapId,
          transactionDigest,
        })
        .where(eq(issuerApplication.id, application.id));
    } catch (error) {
      console.error("❌ Failed to create IssuerCap on blockchain:", error);
      // Continue without blockchain integration for now
      console.log("📝 Continuing with database-only application...");
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id.toString(),
        organizationName: body.organizationName,
        contactEmail: body.contactEmail,
        website: body.website,
        description: body.description,
        walletAddress: body.walletAddress,
        status: "pending",
        appliedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        issuerCapId,
        transactionDigest,
      },
      message: issuerCapId
        ? "Application submitted successfully with blockchain integration"
        : "Application submitted successfully (database only)",
      blockchain: {
        enabled: !!issuerCapId,
        issuerCapId,
        transactionDigest,
      },
    });
  } catch (error) {
    console.error("Error saving application to database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save application" },
      { status: 500 }
    );
  }
}
