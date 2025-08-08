"use client";

import { individualCert } from "@/db/schema";
import { ColumnDef } from "@tanstack/react-table";
import { InferSelectModel } from "drizzle-orm";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const CertificatesIssuerColumn: ColumnDef<
  InferSelectModel<typeof individualCert>
>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "minted",
    header: "Minted",
  },

  {
    accessorKey: "email",
    header: "Email",
  },
];
