import { cookies } from "next/headers";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";

export default async function DashboardLayout({ children }: LayoutProps<"/">) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
      <DashboardSidebar />
      <SidebarInset className="min-h-0 min-w-0">
        <main className="flex flex-col min-h-0 flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
