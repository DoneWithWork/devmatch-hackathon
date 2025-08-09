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

export const AdminCertificateColumn: ColumnDef<
  InferSelectModel<typeof individualCert>
>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "minted",
    header: "Minted",
    cell: ({ row }) => {
      if (row.original.minted) {
        return <span>Minted</span>;
      } else {
        return <span>Not Minted</span>;
      }
    },
  },

  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.created_at).toDateString(),
  },
];
