"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onValueChange: (v: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

export type TabsProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  const store = React.useMemo(
    () => ({ value, onValueChange }),
    [value, onValueChange]
  );
  return (
    <TabsContext.Provider value={store}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex gap-0 border-b border-slate-200",
        className
      )}
      {...props}
    />
  );
}

export type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function TabsTrigger({
  className,
  value,
  children,
  ...props
}: TabsTriggerProps) {
  const { value: selected, onValueChange } = useTabsContext();
  const selectedTrigger = selected === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selectedTrigger}
      data-state={selectedTrigger ? "active" : "inactive"}
      className={cn(
        "relative -mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted transition-colors",
        "hover:text-foreground focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none",
        selectedTrigger && "border-accent text-foreground",
        className
      )}
      onClick={() => onValueChange(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function TabsContent({
  className,
  value,
  children,
  ...props
}: TabsContentProps) {
  const { value: selected } = useTabsContext();
  if (selected !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("py-3 text-sm text-foreground", className)}
      {...props}
    >
      {children}
    </div>
  );
}
