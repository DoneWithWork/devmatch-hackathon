import { Award, ChevronsUpDown, Pencil, Shield } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Link from "next/link";
// Menu items.
const items = [
  {
    title: "Applications",
    url: "/admin/applications",
    icon: Pencil,
  },
  {
    title: "Certificates",
    url: "/admin/certificates",
    icon: Award,
  },
];

export function AppSidebar() {
  return (
    <Sidebar className="glass-container">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  className="[&>svg]:size-6 group-data-[collapsible=icon]:[&>svg]:ml-1"
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <div className="bg-purple-500 text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                          <Shield className="size-4" />
                        </div>
                        <div className="flex flex-col gap-0.5 leading-none">
                          <span className="font-medium">HashCred</span>
                        </div>
                        <ChevronsUpDown className="ml-auto" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-(--radix-dropdown-menu-trigger-width)"
                      align="start"
                    >
                      <Link className="z-10 cursor-pointer " href={"/explorer"}>
                        <DropdownMenuItem className="cursor-pointer">
                          Cert Explorer
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="cursor-pointer rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 font-medium shadow-lg  text-white hover:text-white my-2 focus:text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200  h-12 hover:shadow-xl transform hover:scale-[101%]"
                  >
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
