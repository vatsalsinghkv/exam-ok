"use client";

import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

import { Logo, UnstyledLink } from "@/components/shared";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import {
  NavSection,
  NavUser,
  NavUserSkeleton,
} from "@/features/dashboard/components";
import {
  mainMenuItems,
  othersMenuItems,
} from "@/features/dashboard/data/sidebar";
import { ROUTES } from "@/lib/constants/routes";
import { useCurrentUser } from "@/lib/services/auth/client";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, isPending } = useCurrentUser();

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="mb-2">
        <div className="flex items-center gap-2 pl-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
          <Logo textClassName="group-data-[collapsible=icon]:hidden" />
          <SidebarTrigger className="ml-auto lg:hidden" />
        </div>

        <SidebarMenu className="mt-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Create Test"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
              render={<UnstyledLink href={ROUTES.dashboard.create} />}
            >
              <Plus />
              <span>New Test</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <div className="border-border border-b border-dashed" />

      <SidebarContent>
        <NavSection items={mainMenuItems} pathname={pathname} />
        <NavSection
          items={othersMenuItems}
          pathname={pathname}
          label="Others"
        />
      </SidebarContent>

      <div className="border-border border-b border-dashed" />

      <SidebarFooter>
        {isPending ? (
          <NavUserSkeleton />
        ) : user ? (
          <NavUser
            user={{
              avatar: user.image,
              name: user.name,
              email: user.email,
            }}
          />
        ) : null}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
