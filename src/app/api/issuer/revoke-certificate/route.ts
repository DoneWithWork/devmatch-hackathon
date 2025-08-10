import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { getServerSigner } from "@/server/signer";

const client = new SuiClient({ url: getFullnodeUrl("devnet") });
const PACKAGE_ID = process.env.PACKAGE_ID!;

// Revoke an issued certificate (issuer only)
export async function POST(request: NextRequest) {
  try {
    const { certificateId } = await request.json();
    if (!certificateId) {
      return NextResponse.json(
        { success: false, error: "Missing certificateId parameter" },
        { status: 400 }
      );
    }

    const issuerKeypair = getServerSigner();

    const txb = new TransactionBlock();
    txb.setGasBudget(8000000); // 8M MIST

    txb.moveCall({
      target: `${PACKAGE_ID}::certificate::revoke_certificate`,
      arguments: [
        txb.object(certificateId), // IssuedCertificate
      ],
    });

    const result = await client.signAndExecuteTransactionBlock({
      signer: issuerKeypair,
      transactionBlock: txb,
      options: {
        showEvents: true,
        showEffects: true,
        showObjectChanges: true,
      },
    });

    const events = result.events || [];
    const revokedEvent = events.find((e) =>
      e.type?.includes("CertificateRevokedEvent")
    );

    return NextResponse.json({
      success: true,
      certificateId,
      transactionDigest: result.digest,
      event: revokedEvent,
      message: "Certificate revoked",
    });
  } catch (error) {
    console.error("❌ Certificate revoke failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
