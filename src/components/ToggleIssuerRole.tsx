"use client";
import { ToggleIssuerRoleAction } from "@/app/actions/ToggleIssuerRoleAction";
import { Loader2, ShieldUser } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

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
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        onClick={action}
        disabled={pending}
        className="cursor-pointer rounded-lg bg-gradient-to-r from-blue-500 to-purple-600  font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg h-12 hover:shadow-xl transform hover:scale-[101%] hover:text-white text-white"
      >
        <span>
          {pending ? (
            <Loader2 size={20} className="size-5 animate-spin" />
          ) : (
            <ShieldUser />
          )}

          <span>Toggle Issuer Role</span>
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
