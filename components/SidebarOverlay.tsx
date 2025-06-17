"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function SidebarOverlay() {
  const { open, setOpen } = useSidebar();

  // Base styles that should always apply. We use specific transition-
  // utilities so that only the properties we care about are animated.
  const base =
    "fixed z-40 flex gap-2 rounded-md p-2 transition-[left,top,background-color,border-color,backdrop-filter] duration-200 ease-in-out";

  const openClasses = "left-1.75 top-1.75";
  const closedClasses =
    "left-2 top-2 border border-primary/30 bg-primary/10 backdrop-blur-md";

  return (
    <div
      data-slot="sidebar-overlay"
      className={cn(base, open ? openClasses : closedClasses)}
    >
      {/* Sidebar toggle button */}
      <SidebarTrigger
        className="size-8 text-primary"
        onClick={() => !open && setOpen(true)}
      />

      {/* New conversation button (only show when sidebar is closed) */}
      {!open && (
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="size-8 text-primary hover:bg-primary/15"
        >
          <Link href="/">
            <Plus className="size-4" />
            <span className="sr-only">New conversation</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
