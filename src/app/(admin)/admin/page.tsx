import { checkTXTRecord } from "@/lib/dns";
import { PendingIssuers } from "@/components/admin/PendingIssuers";
import { GasBalanceTracker } from "@/components/admin/GasBalanceTracker";

export default async function AdminPage() {
  const status = await checkTXTRecord({
    domain: "google.com",
    matchingKey: "hashcred",
    matchingValue: process.env.NEXT_PUBLIC_DNS_KEY!,
  });
  console.log("DNS verification status:", status);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage issuers and monitor gas usage
        </p>
      </div>

      {/* Horizontal Gas Balance Banner */}
      <div className="mb-6">
        <GasBalanceTracker />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Sidebar - DNS Status */}
        <div className="xl:col-span-1">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold text-lg mb-3">DNS Verification</h2>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 rounded text-sm font-medium ${
                  status
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {status ? "✅ Verified" : "❌ Not verified"}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content - Issuer Management */}
        <div className="xl:col-span-3">
          <PendingIssuers />
        </div>
      </div>
    </div>
  );
}
