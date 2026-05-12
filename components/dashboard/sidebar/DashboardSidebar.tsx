import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { BrandMark } from "@/components/public/auth";
import { getCurrentSession } from "@/lib/auth/session";
import { listProjectsForOwner } from "@/lib/projects/service";
import { SidebarNav } from "./SidebarNav";

export async function DashboardSidebar() {
  const session = await getCurrentSession();
  const projects = session?.user
    ? await listProjectsForOwner(session.user.id)
    : [];

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border">
        <BrandMark href="/dashboard" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav projects={projects} />
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        {session?.user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="h-auto rounded-none px-0 hover:bg-transparent"
              >
                <Link href="/dashboard/settings">
                  <div className="flex size-6 shrink-0 items-center justify-center bg-primary text-[10px] font-bold text-primary-foreground">
                    {session.user.name?.slice(0, 1).toUpperCase() ?? "?"}
                  </div>
                  <div className="flex flex-col gap-0">
                    <span className="text-xs font-medium leading-tight">
                      {session.user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {session.user.email}
                    </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
