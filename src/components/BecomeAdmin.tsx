"use client";
import { AdminAction } from "@/app/actions/BecomAdminAction";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const initialState = {
  success: false,
};
export default function BecomeAdmin() {
  const [state, action, pending] = useActionState(AdminAction, initialState);
  useEffect(() => {
    if (state.success) {
      toast.success("You are now an admin!!");
    }
  }, [state]);
  return (
    <Button onClick={action} disabled={pending} className="cursor-pointer glass-container">
      {pending && <Loader2 size={20} className="size-5 animate-spin" />}
      Become Admin
    </Button>
  );
}
