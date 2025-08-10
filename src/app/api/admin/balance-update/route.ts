import { NextRequest, NextResponse } from "next/server";

// Store for Server-Sent Events connections
const clients = new Set<{
  id: string;
  controller: ReadableStreamDefaultController;
  address?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const { address, balance, balanceInSui, timestamp } = await request.json();

    // Broadcast balance update to all connected clients
    const updateData = JSON.stringify({
      type: "balance_update",
      address,
      balance,
      balanceInSui,
      timestamp,
    });

    console.log(`📡 Broadcasting balance update for ${address.slice(0, 8)}...`);

    // Send to all connected clients
    for (const client of clients) {
      try {
        // Send to all clients or specific address if specified
        if (!client.address || client.address === address) {
          client.controller.enqueue(`data: ${updateData}\n\n`);
        }
      } catch (error) {
        console.warn("⚠️ Failed to send to client, removing:", error);
        clients.delete(client);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Balance update broadcasted",
      clientCount: clients.size,
    });
  } catch (error) {
    console.error("❌ Failed to broadcast balance update:", error);
    return NextResponse.json(
      { error: "Failed to broadcast balance update" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  // Create Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      const clientId = Math.random().toString(36).substring(7);
      const client = {
        id: clientId,
        controller,
        address: address || undefined,
      };

      clients.add(client);
      console.log(`🔗 SSE client connected: ${clientId} for address: ${address || "all"}`);

      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({
        type: "connected",
        clientId,
        message: "Balance updates stream connected",
      })}\n\n`);

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: "heartbeat",
            timestamp: new Date().toISOString(),
          })}\n\n`);
        } catch (error) {
          console.warn("⚠️ Heartbeat failed, cleaning up client:", clientId);
          clearInterval(heartbeat);
          clients.delete(client);
        }
      }, 30000); // Every 30 seconds

      // Cleanup on close
      request.signal.addEventListener("abort", () => {
        console.log(`🔌 SSE client disconnected: ${clientId}`);
        clearInterval(heartbeat);
        clients.delete(client);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Cache-Control",
    },
  });
}
