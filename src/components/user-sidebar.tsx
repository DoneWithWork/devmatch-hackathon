import {
  Award,
  ChevronsUpDown,
  Crown,
  Glasses,
  LogOut,
  Shield,
} from "lucide-react";

import { LogoutAction } from "@/app/actions/LogoutAction";
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import Link from "next/link";
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
    <Sidebar className="glass-container h-screen" collapsible="icon">
      <SidebarContent className="">
        <SidebarGroup className="h-full">
          <SidebarGroupContent className="h-full">
            <SidebarMenu className="flex flex-col  justify-between h-full">
              <div>
                <div>
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
                          <Link
                            className="z-10 cursor-pointer "
                            href={"/explorer"}
                          >
                            <DropdownMenuItem className="cursor-pointer">
                              Cert Explorer
                            </DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
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

                {hasApplied && (
                  <SidebarMenuItem key={"Applications"}>
                    <SidebarMenuButton
                      asChild
                      className="cursor-pointer rounded-lg bg-gradient-to-r from-orange-600 to-orange-500 font-medium shadow-lg  text-white hover:text-white my-2  hover:from-orange-600 hover:to-orange-700 transition-all duration-200  h-12 hover:shadow-xl transform hover:scale-[101%]"
                    >
                      <a href={"/dashboard/issuer/applications"}>
                        <Glasses />
                        <span>Applications</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
                <BecomeIssuerBtn isIssuer={isIssuer} />
                <SidebarGroupLabel className="mt-10">
                  Admin Functions
                </SidebarGroupLabel>
                <div className=" space-y-2">
                  <BecomeAdmin />
                  <BecomeIssuer />
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <span>
                        <Crown className="h-4 w-4 inline mr-2" />
                        <span className="font-semibold text-lg text-purple-600 px-2">
                          {session.role.toUpperCase()}
                        </span>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </div>
              </div>

              <div className="mb-6 flex flex-col justify-center gap-2">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    onClick={LogoutAction}
                    className=" cursor-pointer rounded-lg bg-gradient-to-r from-blue-500 to-purple-600  font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg h-12 hover:shadow-xl transform hover:scale-105 hover:text-white text-white"
                  >
                    <span>
                      <LogOut className="h-4 w-4 inline mr-2" />
                      <span>Logout</span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarTrigger className="self-end" />
              </div>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
