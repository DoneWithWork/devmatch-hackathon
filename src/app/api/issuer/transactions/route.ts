import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, desc, and, or } from "drizzle-orm";
import db from "@/db/drizzle";
import {
  transactions,
  gasBalanceHistory,
  users,
  issuerApplication,
} from "@/db/schema";
import { getSession } from "@/utils/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(await cookies());

    if (!session || session.role !== "issuer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const type = searchParams.get("type"); // Optional filter by transaction type

    // Get the issuer's application data
    const issuerApp = await db
      .select()
      .from(issuerApplication)
      .innerJoin(users, eq(issuerApplication.applicant, users.id))
      .where(eq(users.userAddress, session.userAddress))
      .limit(1);

    if (issuerApp.length === 0) {
      return NextResponse.json(
        { error: "Issuer application not found" },
        { status: 404 }
      );
    }

    const issuerId = issuerApp[0].application.id;
    const issuerAddress = session.userAddress;

    // Build the query to get transactions related to this issuer
    let whereCondition = or(
      eq(transactions.issuerApplicationId, issuerId),
      eq(transactions.fromAddress, issuerAddress),
      eq(transactions.toAddress, issuerAddress)
    );

    // Add type filter if provided
    if (type) {
      const validTypes = [
        "gas_transfer",
        "template_creation",
        "certificate_issuance",
        "certificate_mint",
        "issuer_approval",
        "admin_operation",
      ];
      if (validTypes.includes(type)) {
        whereCondition = and(
          whereCondition,
          eq(
            transactions.transactionType,
            type as
              | "gas_transfer"
              | "template_creation"
              | "certificate_issuance"
              | "certificate_mint"
              | "issuer_approval"
              | "admin_operation"
          )
        );
      }
    }

    // Get transactions with gas balance history
    const issuerTransactions = await db
      .select({
        id: transactions.id,
        transactionHash: transactions.transactionHash,
        transactionType: transactions.transactionType,
        status: transactions.status,
        fromAddress: transactions.fromAddress,
        toAddress: transactions.toAddress,
        amount: transactions.amount,
        gasUsed: transactions.gasUsed,
        gasFee: transactions.gasFee,
        description: transactions.description,
        metadata: transactions.metadata,
        createdAt: transactions.created_at,
        // Gas balance data
        gasBalance: gasBalanceHistory.balance,
        gasBalanceInSui: gasBalanceHistory.balanceInSui,
      })
      .from(transactions)
      .leftJoin(
        gasBalanceHistory,
        eq(transactions.id, gasBalanceHistory.transactionId)
      )
      .where(whereCondition)
      .orderBy(desc(transactions.created_at))
      .limit(limit)
      .offset(offset);

    // Get current gas balance
    const currentBalance = await db
      .select()
      .from(gasBalanceHistory)
      .where(eq(gasBalanceHistory.address, issuerAddress))
      .orderBy(desc(gasBalanceHistory.created_at))
      .limit(1);

    // Calculate transaction statistics
    const stats = {
      totalTransactions: issuerTransactions.length,
      gasTransfersReceived: issuerTransactions.filter(
        (t) =>
          t.transactionType === "gas_transfer" && t.toAddress === issuerAddress
      ).length,
      certificatesIssued: issuerTransactions.filter(
        (t) => t.transactionType === "certificate_issuance"
      ).length,
      templatesCreated: issuerTransactions.filter(
        (t) => t.transactionType === "template_creation"
      ).length,
      totalGasUsed: issuerTransactions
        .filter((t) => t.gasUsed)
        .reduce((sum, t) => sum + parseInt(t.gasUsed || "0"), 0),
      currentBalance: currentBalance[0] || null,
    };

    return NextResponse.json({
      success: true,
      transactions: issuerTransactions,
      statistics: stats,
      pagination: {
        limit,
        offset,
        hasMore: issuerTransactions.length === limit,
      },
    });
  } catch (error) {
    console.error("Error fetching issuer transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
