"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  File,
  Gear,
  Hexagon,
  Plus,
  Pulse,
  SquaresFour,
  Terminal,
} from "@phosphor-icons/react";
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { label: "Projects", href: "/dashboard", icon: SquaresFour, exact: true },
  { label: "Runs", href: "/dashboard/runs", icon: Pulse, exact: false },
  { label: "Tools", href: "/dashboard/tools", icon: Terminal, exact: false },
  { label: "Logs", href: "/dashboard/logs", icon: File, exact: false },
  { label: "Settings", href: "/dashboard/settings", icon: Gear, exact: false },
] as const;

type Project = {
  id: string;
  name: string;
  plan: string;
};

interface SidebarNavProps {
  projects: Project[];
}

export function SidebarNav({ projects }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <>
      <SidebarGroup className="px-0">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const { label, href, icon: Icon } = item;
            const isActive = item.exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + "/");
            return (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className="rounded-none pl-4 data-[active=true]:border-l-2 data-[active=true]:border-primary data-[active=true]:bg-muted/60 data-[active=true]:text-primary"
                >
                  <Link href={href}>
                    <Icon size={14} weight={isActive ? "bold" : "regular"} />
                    <span>{label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      <SidebarGroup className="px-0">
        <SidebarGroupLabel className="px-4 text-[10px] tracking-widest text-muted-foreground/70">
          PROJECT
        </SidebarGroupLabel>
        <SidebarGroupAction asChild title="New project">
          <Link href="/dashboard/projects/new">
            <Plus size={13} />
          </Link>
        </SidebarGroupAction>
        <SidebarMenu>
          {projects.length === 0 ? (
            <SidebarMenuItem>
              <p className="px-4 text-[11px] text-muted-foreground/60">
                No projects yet
              </p>
            </SidebarMenuItem>
          ) : (
            projects.map((project) => {
              const href = `/dashboard/projects/${project.id}`;
              const isActive =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="rounded-none pl-4 data-[active=true]:border-l-2 data-[active=true]:border-primary data-[active=true]:bg-muted/60 data-[active=true]:text-primary"
                  >
                    <Link href={href}>
                      <Hexagon size={13} />
                      <span className="font-mono text-xs">{project.name}</span>
                    </Link>
                  </SidebarMenuButton>
                  <SidebarMenuBadge className="font-mono text-[10px] text-muted-foreground/60">
                    {project.plan}
                  </SidebarMenuBadge>
                </SidebarMenuItem>
              );
            })
          )}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}
