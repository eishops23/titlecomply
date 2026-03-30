"use client";

import { OrganizationSwitcher, UserButton } from "@clerk/nextjs";
import {
  BarChart2,
  Bell,
  FileText,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldAlert,
  ArrowLeftRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/filings", label: "Filings", icon: FileText },
  { href: "/alerts", label: "Alerts", icon: ShieldAlert },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

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

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside
        className={cn(
          "flex shrink-0 flex-col border-r border-slate-200 bg-surface transition-[width] duration-200 ease-out",
          collapsed ? "w-[4.25rem]" : "w-56",
        )}
      >
        <div
          className={cn(
            "flex h-14 items-center border-b border-slate-200 px-3",
            collapsed && "justify-center px-0",
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 font-semibold tracking-tight text-primary",
              collapsed && "justify-center",
            )}
            title="TitleComply"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
              TC
            </span>
            {!collapsed && <span className="truncate">TitleComply</span>}
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 p-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-slate-100 text-foreground"
                    : "text-muted hover:bg-slate-50 hover:text-foreground",
                  collapsed && "justify-center px-0",
                )}
              >
                <span className="relative inline-flex">
                  <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                  {href === "/alerts" && unreadAlerts > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
                      {unreadAlerts > 99 ? "99+" : unreadAlerts}
                    </span>
                  ) : null}
                </span>
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium text-muted hover:bg-slate-50 hover:text-foreground"
            aria-expanded={!collapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4 shrink-0" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4 shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-surface px-4">
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
    </div>
  );
}
