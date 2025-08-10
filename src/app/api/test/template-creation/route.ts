import { NextRequest, NextResponse } from "next/server";
import { Transaction } from "@mysten/sui/transactions";
import { recordTransaction } from "@/utils/transactionLogger";
import { executeWithGasSponsorship } from "@/utils/gasSponsorship";
import { db } from "@/db/db";
import { issuers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { bcs } from "@mysten/sui/bcs";

// Type for SUI transaction result
interface SuiTransactionResult {
  digest: string;
  effects?: {
    status?: {
      status: string;
    };
    gasUsed?: {
      computationCost: string;
    };
    created?: Array<{
      reference?: {
        objectId: string;
      };
    }>;
  };
}

// Test endpoint for template creation without authentication (for testing only)
export async function POST(request: NextRequest) {
  try {
    const { name, description, attributes, walletAddress } =
      await request.json();

    if (!name || !description || !attributes || !walletAddress) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, description, attributes, walletAddress",
        },
        { status: 400 }
      );
    }

    console.log("🧪 TEST: Creating template for wallet:", walletAddress);

    // Check if user is an approved issuer (find user by wallet address)
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.userAddress, walletAddress))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json(
        { error: "User not found for wallet address" },
        { status: 404 }
      );
    }

    const issuer = await db
      .select()
      .from(issuers)
      .where(eq(issuers.userId, userResult[0].id))
      .limit(1);

    if (!issuer.length || !issuer[0].isVerified) {
      return NextResponse.json(
        { error: "You are not an approved issuer" },
        { status: 403 }
      );
    }

    const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
    const SUI_ISSUER_CAP = process.env.SUI_ISSUER_CAP!; // Use shared IssuerCap
    const CERTIFICATE_REGISTRY = process.env.CERTIFICATE_REGISTRY!;

    console.log("Creating template with shared IssuerCap:", SUI_ISSUER_CAP);

    // Execute with gas sponsorship using the function signature
    const result = await executeWithGasSponsorship(
      walletAddress,
      () => {
        const txb = new Transaction();

        // Convert attributes to vector<vector<u8>> format using proper BCS
        const fieldBytes = attributes.map((attr: string) =>
          Array.from(new TextEncoder().encode(attr))
        );

        // Serialize vector<vector<u8>> using BCS
        const serializedFields = bcs
          .vector(bcs.vector(bcs.u8()))
          .serialize(fieldBytes);

        // Call create_certificate_template function with shared IssuerCap
        txb.moveCall({
          target: `${PACKAGE_ID}::certificate::create_certificate_template`,
          arguments: [
            txb.object(SUI_ISSUER_CAP), // Use shared IssuerCap owned by admin
            txb.pure.string(name),
            txb.pure.string(description),
            txb.pure.string(""), // image_template_url (empty for now)
            txb.pure.string("standard"), // certificate_type
            txb.pure(serializedFields), // fields as vector<vector<u8>>
            txb.object(CERTIFICATE_REGISTRY), // registry
          ],
        });

        return txb;
      },
      `Template creation: ${name}`
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log("Template creation result:", result.data);

    const transactionResult = result.data as SuiTransactionResult;

    // Log the transaction
    await recordTransaction({
      transactionHash: transactionResult.digest,
      transactionType: "template_creation",
      description: `Created certificate template: ${name}`,
      gasUsed:
        transactionResult.effects?.gasUsed?.computationCost?.toString() || "0",
      status:
        transactionResult.effects?.status?.status === "success"
          ? "success"
          : "failed",
      userId: userResult[0].id,
      metadata: {
        templateName: name,
        description,
        attributes,
      },
    });

    return NextResponse.json({
      success: true,
      templateId: transactionResult.effects?.created?.[0]?.reference?.objectId,
      txDigest: transactionResult.digest,
      message: "Template created successfully via test endpoint",
    });
  } catch (error) {
    console.error("Template creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Template creation failed",
      },
      { status: 500 }
    );
  }
}
