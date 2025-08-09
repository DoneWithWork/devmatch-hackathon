"use client";

import { ApplicationWithDocuments } from "@/types/types";
import { ColumnDef } from "@tanstack/react-table";

export const ApplicationColumn: ColumnDef<ApplicationWithDocuments>[] = [
  {
    accessorKey: "application.id",
    header: "Id",
  },
  {
    accessorKey: "application.domain",
    header: "Domain",
  },

  {
    accessorKey: "application.institution",
    header: "Institution",
  },
  {
    accessorKey: "application.created_at",
    header: "Created",
    cell: ({ row }) =>
      new Date(row.original.application.created_at).toDateString(),
  },

  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      return (
        <div>
          <p>{row.original.application.status}</p>
        </div>
      );
    },
  },
];
