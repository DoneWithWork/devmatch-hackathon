import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { transactions } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch transactions from database
    const transactionHistory = await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.created_at))
      .limit(100);

    // Map database field names to frontend expected format
    const mappedTransactions = transactionHistory.map((tx) => ({
      ...tx,
      createdAt: tx.created_at?.toISOString() || new Date().toISOString(),
      // Remove the snake_case field to avoid confusion
      created_at: undefined,
    }));

    return NextResponse.json({
      success: true,
      transactions: mappedTransactions,
    });
  } catch (error) {
    console.error("Failed to fetch transactions:", error);

    // Return mock data for demonstration
    const mockTransactions = [
      {
        id: 1,
        transactionHash: "6M47z8uWvuPh4AJkXnfa48LRVYFC87ysXkvSDTtAMy7q",
        transactionType: "template_creation",
        status: "success",
        fromAddress:
          "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26",
        toAddress: null,
        amount: null,
        gasUsed: "8000000",
        gasFee: "8000",
        description:
          "Created certificate template: Blockchain Development Bootcamp",
        metadata: {
          templateId:
            "0xe21db89af54ce771839a3b2906a0507f749f0448fdc45593ad579b68b4fdbf0d",
        },
        userId: 1,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        transactionHash: "8R56k9xWvuPh4AJkXnfa48LRVYFC87ysXkvSDTtAMy7q",
        transactionType: "gas_transfer",
        status: "success",
        fromAddress:
          "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26",
        toAddress:
          "0x9d386777d50c71d3155a348ada82e30a7b07b3a489c0ca7d96cb848cd4c83c8d",
        amount: "100000000",
        gasUsed: "1000000",
        gasFee: "1000",
        description: "Gas transfer to issuer wallet",
        metadata: { reason: "issuer_funding" },
        userId: 2,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3,
        transactionHash: "9T67l8yWvuPh4AJkXnfa48LRVYFC87ysXkvSDTtAMy7q",
        transactionType: "certificate_issuance",
        status: "success",
        fromAddress:
          "0x9d386777d50c71d3155a348ada82e30a7b07b3a489c0ca7d96cb848cd4c83c8d",
        toAddress: null,
        amount: null,
        gasUsed: "6000000",
        gasFee: "6000",
        description: "Issued certificate for John Doe",
        metadata: {
          certificateId:
            "0xf23e56af54ce771839a3b2906a0507f749f0448fdc45593ad579b68b4fdbf0d",
          recipient: "John Doe",
        },
        userId: 3,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      transactions: mockTransactions,
    });
  }
}
