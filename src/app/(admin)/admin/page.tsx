import { checkTXTRecord } from "@/lib/dns";
import React from "react";

export default async function AdminPage() {
  const status = await checkTXTRecord({
    domain: "google.com",
    matchingKey: "hashcred",
    matchingValue: process.env.NEXT_PUBLIC_DNS_KEY!,
  });
  console.log(status);
  return <div></div>;
}
