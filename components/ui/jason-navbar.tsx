"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { HoveredLink, Menu, MenuItem } from "@/components/ui/navbar-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function JasonNavbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const pathname = usePathname();

  // Hide navbar on dashboard pages (admin and client portals)
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/client')) {
    return null;
  }

  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-[100]", className)}
    >
      <Menu setActive={setActive}>
        <MenuItem setActive={setActive} active={active} item="Newsletter">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/newsletter/subscribe">Subscribe</HoveredLink>
            <HoveredLink href="/newsletter/archive">Archive</HoveredLink>
            <HoveredLink href="/newsletter/latest">Latest Issue</HoveredLink>
          </div>
        </MenuItem>

        <MenuItem setActive={setActive} active={active} item="Businesses">
          <div className="flex flex-col space-y-4 text-sm p-4">
            <HoveredLink href="https://eibagency.com">
              <div>
                <h4 className="text-base font-bold mb-1">EIB Agency</h4>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm">Comprehensive insurance solutions for your business.</p>
              </div>
            </HoveredLink>
            <HoveredLink href="https://www.leaderforlifeacademy.com/">
              <div>
                <h4 className="text-base font-bold mb-1">Leader For Life</h4>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm">Transformative leadership development courses.</p>
              </div>
            </HoveredLink>
          </div>
        </MenuItem>

        <Link
          href="/login"
          className="relative z-50 cursor-pointer text-black hover:text-[#d4af37] transition-colors dark:text-white"
          onMouseEnter={() => setActive(null)}
        >
          Login
        </Link>
      </Menu>
    </div>
  );
}
