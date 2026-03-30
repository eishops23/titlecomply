"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Building2, CreditCard, UserCircle, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type SettingsPageKey = "organization" | "team" | "billing" | "profile";

interface SettingsLayoutProps {
  children: ReactNode;
  activePage: SettingsPageKey;
}

const SETTINGS_NAV = [
  {
    key: "organization",
    label: "Organization",
    href: "/settings",
    icon: Building2,
  },
  { key: "team", label: "Team", href: "/settings/team", icon: Users },
  { key: "billing", label: "Billing", href: "/settings/billing", icon: CreditCard },
  {
    key: "profile",
    label: "Profile",
    href: "/settings/profile",
    icon: UserCircle,
  },
] as const;

export function SettingsLayout({ children, activePage }: SettingsLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="flex gap-6 p-6">
      <aside className="h-fit w-60 shrink-0 rounded-md border border-slate-200 bg-surface">
        <div className="border-b border-slate-200 px-4 py-3">
          <h1 className="text-sm font-semibold text-foreground">Settings</h1>
        </div>
        <nav className="p-2">
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              item.key === activePage;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  "mb-1 flex items-center gap-2 rounded-md border-l-2 px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "border-accent bg-blue-50 text-accent"
                    : "border-transparent text-muted hover:bg-slate-50 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
