"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LuShield, LuGitCompareArrows, LuDatabase, LuChevronLeft, LuChevronRight, LuHouse } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";

const sidebarLinks = [
  {
    href: "/dashboard/triage",
    label: "Triage Console",
    icon: LuGitCompareArrows,
    description: "Verify AI-generated matches",
  },
  {
    href: "/dashboard/records",
    label: "Records Registry",
    icon: LuDatabase,
    description: "Master person database",
  },
];

export default function DashboardShell({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/20">
            <LuShield className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-base font-bold tracking-tight">
              Res<span className="text-red-500">Q</span>-Link
            </span>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          <TooltipProvider delayDuration={0}>
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {!collapsed && <span>{link.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <p>{link.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {link.description}
                      </p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>

        <Separator />

        {/* Sidebar footer */}
        <div className="p-2">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                >
                  <LuHouse className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>Public Site</span>}
                </Link>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">Public Site</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mt-1 flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/50 transition-colors hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <LuChevronRight className="h-4 w-4" />
            ) : (
              <LuChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
