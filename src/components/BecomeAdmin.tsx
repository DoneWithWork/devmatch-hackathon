"use client";
import { AdminAction } from "@/app/actions/BecomAdminAction";
import { Loader2, UserStar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";

const initialState = {
  success: false,
};
export default function BecomeAdmin() {
  const [state, action, pending] = useActionState(AdminAction, initialState);
  const router = useRouter();
  useEffect(() => {
    if (state.success) {
      toast.success("You are now an admin!!");
      router.push("/admin");
    }
  }, [state, router]);
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
            <UserStar />
          )}

          <span>Become Admin</span>
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
