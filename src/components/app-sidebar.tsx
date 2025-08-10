import { Shield, Users, Activity, FileText, Database } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Admin menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Shield,
  },
  {
    title: "System Status",
    url: "/admin#system",
    icon: Activity,
  },
  {
    title: "Issuer Management",
    url: "/admin#issuers",
    icon: Users,
  },
  {
    title: "Monitoring",
    url: "/admin#monitoring",
    icon: Database,
  },
  {
    title: "API Documentation",
    url: "/test",
    icon: FileText,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="glass-container">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Panel</SidebarGroupLabel>
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
