"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export type TooltipProps = {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  side?: "auto" | "top" | "bottom";
};

export function Tooltip({
  content,
  children,
  className,
  contentClassName,
  side = "auto",
}: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const triggerRef = React.useRef<HTMLSpanElement>(null);
  const tooltipId = React.useId();
  const [pos, setPos] = React.useState<{
    top: number;
    left: number;
    place: "top" | "bottom";
  } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const measure = React.useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const estHeight = 40;
    let place: "top" | "bottom" = "bottom";
    if (side === "top") place = "top";
    else if (side === "bottom") place = "bottom";
    else {
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      place =
        spaceBelow >= estHeight || spaceBelow >= spaceAbove ? "bottom" : "top";
    }
    const left = rect.left + rect.width / 2;
    const top =
      place === "bottom" ? rect.bottom + margin : rect.top - margin;
    setPos({ top, left, place });
  }, [side]);

  React.useLayoutEffect(() => {
    if (!open) return;
    measure();
    const onScroll = () => measure();
    const onResize = () => measure();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open, measure]);

  const tooltip =
    open && mounted && pos ? (
      <div
        id={tooltipId}
        role="tooltip"
        style={{
          position: "fixed",
          top: pos.top,
          left: pos.left,
          transform:
            pos.place === "bottom"
              ? "translate(-50%, 0)"
              : "translate(-50%, -100%)",
          zIndex: 60,
        }}
        className={cn(
          "pointer-events-none max-w-xs rounded-md border border-slate-200 bg-slate-900 px-2 py-1.5 text-xs text-white shadow-md",
          contentClassName
        )}
      >
        {content}
      </div>
    ) : null;

  return (
    <span
      ref={triggerRef}
      className={cn("inline-flex", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
      aria-describedby={open ? tooltipId : undefined}
    >
      {children}
      {mounted && tooltip ? createPortal(tooltip, document.body) : null}
    </span>
  );
}
