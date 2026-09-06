import { UnstyledLink } from "@/components/shared";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import type { MenuItem } from "@/features/dashboard/data/sidebar";

import { ROUTES } from "@/lib/constants/routes";

type Props = {
  label?: string;
  pathname: string;
  items: MenuItem[];
  className?: string;
};

export function NavSection({ label, pathname, items, className }: Props) {
  return (
    <SidebarGroup className={className}>
      {label && (
        <SidebarGroupLabel className="text-xs uppercase text-muted-foreground">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = item.url
              ? item.url === ROUTES.dashboard.home
                ? pathname === ROUTES.dashboard.home
                : pathname.startsWith(item.url)
              : false;

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={item.onClick}
                  tooltip={item.title}
                  render={
                    item.url ? <UnstyledLink href={item.url} /> : undefined
                  }
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
