"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileIcon,
  GearIcon,
  PulseIcon,
  SquaresFourIcon,
  TerminalIcon,
  CreditCardIcon,
  PlusIcon,
  HexagonIcon,
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
import { cn } from "@/lib/utils";

const PROJECT_SECTIONS = [
  { label: "Runs", segment: "runs", icon: PulseIcon },
  { label: "Tools", segment: "tools", icon: TerminalIcon },
  { label: "Logs", segment: "logs", icon: FileIcon },
  { label: "Usage", segment: "usage", icon: CreditCardIcon },
  { label: "Settings", segment: "settings", icon: GearIcon },
] as const;

type Project = {
  id: string;
  name: string;
  plan: string;
};

interface SidebarNavProps {
  projects: Project[];
  activeProjectId: string | null;
}

function pickActiveProjectId(
  pathname: string,
  projects: Project[],
  fallback: string | null,
): string | null {
  const match = pathname.match(/^\/dashboard\/projects\/([^/]+)/);
  if (match && projects.some((p) => p.id === match[1])) {
    return match[1];
  }
  return fallback;
}

export function SidebarNav({ projects, activeProjectId }: SidebarNavProps) {
  const pathname = usePathname();
  const effectiveProjectId = pickActiveProjectId(
    pathname,
    projects,
    activeProjectId,
  );
  const hasProjects = projects.length > 0;

  return (
    <>
      <SidebarGroup className="px-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard"}
              className="rounded-none pl-4 data-[active=true]:border-l-2 data-[active=true]:border-primary data-[active=true]:bg-muted/60 data-[active=true]:text-primary"
            >
              <Link href="/dashboard">
                <SquaresFourIcon
                  size={14}
                  weight={pathname === "/dashboard" ? "bold" : "regular"}
                />
                <span>Projects</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {PROJECT_SECTIONS.map((item) => {
            const { label, segment, icon: Icon } = item;
            const href = effectiveProjectId
              ? `/dashboard/projects/${effectiveProjectId}/${segment}`
              : `/dashboard/${segment}`;
            const isActive =
              effectiveProjectId != null &&
              pathname.startsWith(
                `/dashboard/projects/${effectiveProjectId}/${segment}`,
              );
            const disabled = !hasProjects;

            return (
              <SidebarMenuItem key={segment}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  className={cn(
                    "rounded-none pl-4 data-[active=true]:border-l-2 data-[active=true]:border-primary data-[active=true]:bg-muted/60 data-[active=true]:text-primary",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                  aria-disabled={disabled || undefined}
                  title={disabled ? "Create a project first" : undefined}
                >
                  {disabled ? (
                    <div>
                      <Icon size={14} />
                      <span>{label}</span>
                    </div>
                  ) : (
                    <Link href={href}>
                      <Icon size={14} weight={isActive ? "bold" : "regular"} />
                      <span>{label}</span>
                    </Link>
                  )}
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
            <PlusIcon size={13} />
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
              const isActive = effectiveProjectId === project.id;
              const href = `/dashboard/projects/${project.id}/runs`;
              return (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className="rounded-none pl-4 data-[active=true]:border-l-2 data-[active=true]:border-primary data-[active=true]:bg-muted/60 data-[active=true]:text-primary"
                  >
                    <Link href={href}>
                      <HexagonIcon
                        size={13}
                        weight={isActive ? "fill" : "regular"}
                      />
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
