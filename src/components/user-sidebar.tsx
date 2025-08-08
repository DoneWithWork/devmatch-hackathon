import { Award, Glasses } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import BecomeAdmin from "./BecomeAdmin";
import BecomeIssuerBtn from "./BecomeIssuerBtn";
import BecomeIssuer from "./ToggleIssuerRole";

// Menu items.
const items = [
  {
    title: "Certificates",
    url: "/dashboard/certificates",
    icon: Award,
  },
];

export async function UserSidebar({ hasApplied }: { hasApplied: boolean }) {
  const session = await getSession(await cookies());
  const isIssuer = session.role === "issuer" || session.role === "admin";
  return (
    <Sidebar className="glass-container">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {hasApplied && (
                <SidebarMenuItem key={"Applications"}>
                  <SidebarMenuButton asChild>
                    <a href={"/dashboard/issuer/applications"}>
                      <Glasses />
                      <span>Applications</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <BecomeIssuerBtn isIssuer={isIssuer} />
              <BecomeAdmin />
              <BecomeIssuer />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
