"use client";

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
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMobileSidebarStore } from "@/lib/mobile-sidebar";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/filings", label: "Filings", icon: FileText },
  { href: "/alerts", label: "Alerts", icon: ShieldAlert },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/reports/1099s", label: "1099-S Reporting", icon: FileSpreadsheet },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

type SidebarProps = {
  variant: "desktop" | "mobile";
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadAlerts: number;
};

function NavContent({
  variant,
  collapsed,
  onToggleCollapse,
  unreadAlerts,
}: SidebarProps) {
  const pathname = usePathname();
  const setMobileOpen = useMobileSidebarStore((s) => s.setOpen);

  const onNavClick = () => {
    if (variant === "mobile") {
      setMobileOpen(false);
    }
  };

  const showLabels = variant === "mobile" || !collapsed;

  return (
    <>
      <div
        className={cn(
          "flex h-14 items-center border-b border-slate-200 px-3",
          collapsed && variant === "desktop" && "justify-center px-0",
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavClick}
          className={cn(
            "flex items-center gap-2 font-semibold tracking-tight text-primary",
            collapsed && variant === "desktop" && "justify-center",
          )}
          title="TitleComply"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
            TC
          </span>
          {showLabels ? <span className="truncate">TitleComply</span> : null}
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavClick}
              title={collapsed && variant === "desktop" ? label : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-slate-100 text-foreground"
                  : "text-muted hover:bg-slate-50 hover:text-foreground",
                collapsed && variant === "desktop" && "justify-center px-0",
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
              {showLabels ? <span className="truncate">{label}</span> : null}
            </Link>
          );
        })}
      </nav>
      {variant === "desktop" ? (
        <div className="border-t border-slate-200 p-2">
          <button
            type="button"
            onClick={onToggleCollapse}
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
      ) : null}
    </>
  );
}

export function Sidebar(props: SidebarProps) {
  const { variant, collapsed } = props;

  if (variant === "mobile") {
    return (
      <aside
        className="flex h-full w-64 max-w-[85vw] flex-col border-r border-slate-200 bg-surface shadow-xl"
        aria-label="Main navigation"
      >
        <NavContent {...props} />
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-slate-200 bg-surface transition-[width] duration-200 ease-out lg:flex",
        collapsed ? "w-[4.25rem]" : "w-56",
      )}
    >
      <NavContent {...props} />
    </aside>
  );
}

export function MobileSidebarBackdrop() {
  const open = useMobileSidebarStore((s) => s.open);
  const setOpen = useMobileSidebarStore((s) => s.setOpen);

  if (!open) return null;

  return (
    <button
      type="button"
      className="fixed inset-0 z-30 bg-black/50 lg:hidden"
      aria-label="Close menu"
      onClick={() => setOpen(false)}
    />
  );
}

export function MobileSidebarPanel(props: Omit<SidebarProps, "variant">) {
  const open = useMobileSidebarStore((s) => s.open);
  if (!open) return null;

  return (
    <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
      <Sidebar variant="mobile" {...props} />
    </div>
  );
}
