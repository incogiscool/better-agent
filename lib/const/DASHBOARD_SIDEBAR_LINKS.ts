"use client";

import {
  PulseIcon,
  TerminalIcon,
  FileIcon,
  GearIcon,
} from "@phosphor-icons/react";
import { ConstLinkType } from "../types";

export const DASHBOARD_SIDEBAR_LINKS: ConstLinkType[] = [
  {
    name: "Runs",
    id: "runs",
    link: "/dashboard/runs",
    icon: PulseIcon,
  },
  {
    name: "Tools",
    id: "tools",
    link: "/dashboard/tools",
    icon: TerminalIcon,
  },
  {
    name: "Logs",
    id: "logs",
    link: "/dashboard/logs",
    icon: FileIcon,
  },
  {
    name: "Settings",
    id: "settings",
    link: "/dashboard/settings",
    icon: GearIcon,
  },
];
