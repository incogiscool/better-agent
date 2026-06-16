"use client";

import { MegaphoneIcon } from "@phosphor-icons/react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { FEATUREBASE_URL } from "@/lib/const/FEATUREBASE_URL";

export function SidebarFeedbackLink() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild className="rounded-none pl-4">
          <a href={FEATUREBASE_URL} target="_blank" rel="noopener noreferrer">
            <MegaphoneIcon size={14} />
            <span>Feedback</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
