import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

// List User's Certificates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get("address");
    const includeNFTs = searchParams.get("includeNFTs") === "true";

    if (!userAddress) {
      return NextResponse.json(
        { success: false, error: "User address is required" },
        { status: 400 }
      );
    }

    console.log("📜 Fetching certificates for user:", userAddress);

    const client = new SuiClient({ url: getFullnodeUrl("devnet") });
    const PACKAGE_ID = process.env.PACKAGE_ID!;

    // Get all objects owned by the user
    const ownedObjects = await client.getOwnedObjects({
      owner: userAddress,
      filter: {
        Package: PACKAGE_ID,
      },
      options: {
        showContent: true,
        showType: true,
        showDisplay: true,
      },
    });

    const certificates = [];
    const nfts = [];

    // Process each object
    for (const obj of ownedObjects.data) {
      if (obj.data?.type) {
        const objectType = obj.data.type;

        // Check if it's an issued certificate
        if (objectType.includes("IssuedCertificate")) {
          try {
            // Get detailed object data
            const objectDetails = await client.getObject({
              id: obj.data.objectId,
              options: {
                showContent: true,
                showType: true,
                showDisplay: true,
              },
            });

            if (
              objectDetails.data?.content &&
              "fields" in objectDetails.data.content
            ) {
              const fields = objectDetails.data.content.fields as Record<
                string,
                unknown
              >;

              certificates.push({
                objectId: obj.data.objectId,
                type: "IssuedCertificate",
                templateId: fields.template_id,
                issuerAddress: fields.issuer,
                recipientAddress: fields.recipient,
                issuanceDate: fields.issued_at,
                certificateFields: fields.fields || {},
                display: objectDetails.data.display,
              });
            }
          } catch (error) {
            console.warn(
              "Failed to process certificate:",
              obj.data.objectId,
              error
            );
          }
        }

        // Check if it's an NFT certificate (if requested)
        else if (includeNFTs && objectType.includes("CertificateNFT")) {
          try {
            const objectDetails = await client.getObject({
              id: obj.data.objectId,
              options: {
                showContent: true,
                showType: true,
                showDisplay: true,
              },
            });

            if (
              objectDetails.data?.content &&
              "fields" in objectDetails.data.content
            ) {
              const fields = objectDetails.data.content.fields as Record<
                string,
                unknown
              >;

              nfts.push({
                objectId: obj.data.objectId,
                type: "CertificateNFT",
                name: fields.name,
                description: fields.description,
                imageUrl: fields.image_url,
                certificateData: fields.certificate_data || {},
                display: objectDetails.data.display,
              });
            }
          } catch (error) {
            console.warn("Failed to process NFT:", obj.data.objectId, error);
          }
        }
      }
    }

    console.log(
      `✅ Found ${certificates.length} certificates and ${nfts.length} NFTs`
    );

    return NextResponse.json({
      success: true,
      userAddress,
      certificates: {
        count: certificates.length,
        items: certificates,
      },
      nfts: includeNFTs
        ? {
            count: nfts.length,
            items: nfts,
          }
        : undefined,
      total: certificates.length + (includeNFTs ? nfts.length : 0),
    });
  } catch (error) {
    console.error("❌ Failed to fetch user certificates:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
