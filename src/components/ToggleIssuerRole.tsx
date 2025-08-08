"use client";
import { ToggleIssuerRoleAction } from "@/app/actions/ToggleIssuerRoleAction";
import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

const initialState = {
  success: false,
};
export default function BecomeIssuer() {
  const [state, action, pending] = useActionState(
    ToggleIssuerRoleAction,
    initialState
  );
  useEffect(() => {
    if (state.success) {
      toast.success("Toggled successfully!!");
    }
  }, [state]);
  return (
    <Button onClick={action} disabled={pending} className="cursor-pointer glass-container">
      {pending && <Loader2 size={20} className="size-5 animate-spin" />}
      Toggle Issuer Role
    </Button>
  );
}
