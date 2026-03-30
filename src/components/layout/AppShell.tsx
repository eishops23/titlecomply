"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import { Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/Toaster";
import { KeyboardShortcuts } from "@/components/ui/KeyboardShortcuts";
import { useMobileSidebarStore } from "@/lib/mobile-sidebar";
import {
  MobileSidebarBackdrop,
  MobileSidebarPanel,
  Sidebar,
} from "./Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const mobileOpen = useMobileSidebarStore((s) => s.open);
  const setMobileOpen = useMobileSidebarStore((s) => s.setOpen);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/alerts?status=active", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const data = (await response.json()) as { alerts?: unknown[] };
        setUnreadAlerts(Array.isArray(data.alerts) ? data.alerts.length : 0);
      } catch {
        setUnreadAlerts(0);
      }
    })();
  }, []);

  const sidebarProps = {
    collapsed,
    onToggleCollapse: () => setCollapsed((c) => !c),
    unreadAlerts,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <KeyboardShortcuts />
      <Sidebar variant="desktop" {...sidebarProps} />
      <MobileSidebarBackdrop />
      <MobileSidebarPanel {...sidebarProps} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-surface px-4">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-surface text-muted hover:bg-slate-50 hover:text-foreground lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <OrganizationSwitcher
                afterCreateOrganizationUrl="/dashboard"
                appearance={{
                  elements: {
                    rootBox: "min-w-0",
                    organizationSwitcherTrigger:
                      "border border-slate-200 rounded-md px-2 py-1.5 text-sm",
                  },
                }}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-surface text-muted hover:bg-slate-50 hover:text-foreground"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
            </button>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9",
                },
              }}
            />
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
