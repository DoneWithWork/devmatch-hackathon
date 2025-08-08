"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ApplicationWithDocuments, initialState } from "@/types/types";
import { ColumnDef, Row } from "@tanstack/react-table";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useActionState, useEffect } from "react";
import { ApproveApplication } from "@/app/actions/action/applications/approve";
import { toast } from "sonner";
import { RejectApplication } from "@/app/actions/action/applications/reject";
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Payment = {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
};

export const AdminApplicationsColumn: ColumnDef<ApplicationWithDocuments>[] = [
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
          {row.original.application.status === "pending" ? (
            <Buttons row={row} />
          ) : (
            <p>{row.original.application.status}</p>
          )}
        </div>
      );
    },
  },
];
function Buttons({ row }: { row: Row<ApplicationWithDocuments> }) {
  const [state, approveAction, actionPending] = useActionState(
    ApproveApplication,
    initialState
  );
  const [rejectedState, rejectAction, actionRejectPending] = useActionState(
    RejectApplication,
    initialState
  );
  useEffect(() => {
    if (!state.success) {
      toast.error(state.errorMessage);
    }
    if (state.success) {
      toast.success(state.message);
    }
  }, [state]);
  useEffect(() => {
    if (!rejectedState.success) {
      toast.error(rejectedState.errorMessage);
    }
    if (rejectedState.success) {
      toast.success(rejectedState.message);
    }
  }, [rejectedState]);
  return (
    <div className="flex flex-row items-center  gap-3  h-full">
      <Dialog>
        <DialogTrigger>
          <Tooltip>
            <TooltipTrigger>
              <Button className="size-10 bg-green-500 rounded-lg border-[1px] flex flex-col items-center justify-center cursor-pointer hover:scale-105 duration-200 ease-in hover:bg-green-600">
                <Check className="size-6 text-white" size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Approve Application</p>
            </TooltipContent>
          </Tooltip>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Approve application for user to become an issuer
            </DialogDescription>
            <form action={approveAction}>
              <Input
                hidden
                value={row.original.application.id}
                name="id"
              ></Input>
              <Button
                className="w-full cursor-pointer"
                type="submit"
                disabled={actionPending}
              >
                {actionPending && (
                  <Loader2 size={20} className="size-5 animate-spin" />
                )}
                Approve Application
              </Button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger>
          <Tooltip>
            <TooltipTrigger>
              <Button className="size-10 bg-red-500 rounded-lg border-[1px] flex flex-col items-center justify-center cursor-pointer hover:scale-105 duration-200 ease-in hover:bg-red-600">
                <X className="size-6 text-white" size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reject Application</p>
            </TooltipContent>
          </Tooltip>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>Reject an issuers application</DialogDescription>
            <form className="space-y-3" action={rejectAction}>
              <Label htmlFor="name">Reason</Label>
              <Input
                placeholder="Documents not detailed enough"
                name="reason"
                id="name"
                type="text"
                required
              />
              <Input
                hidden
                value={row.original.application.id}
                name="id"
              ></Input>
              <Button
                className="w-full mt-4 cursor-pointer"
                type="submit"
                disabled={actionRejectPending}
              >
                {actionRejectPending && (
                  <Loader2 size={20} className="size-5 animate-spin" />
                )}
                Reject Application
              </Button>
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
