"use client";
import React, { useState } from "react";
import Link from "next/link";
import { HoveredLink, Menu, MenuItem } from "@/components/ui/navbar-menu";
import { AuthButton } from "@/components/dashboard/auth-button";
import { cn } from "@/lib/utils";

export function JasonNavbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-[100]", className)}
    >
      <Menu setActive={setActive}>
        <Link
          href="/services"
          className="relative z-50 cursor-pointer text-black hover:text-[#d4af37] transition-colors dark:text-white"
          onMouseEnter={() => setActive(null)}
        >
          Services
        </Link>

        <MenuItem setActive={setActive} active={active} item="LinkedIn">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/linkedin">LinkedIn Feed</HoveredLink>
            <HoveredLink href="https://www.linkedin.com/in/jason-graziani">Personal Profile ↗</HoveredLink>
            <HoveredLink href="https://www.linkedin.com/company/jason-graziani">Company Page ↗</HoveredLink>
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
                <h4 className="text-base font-bold mb-1">Leader For Life Academy</h4>
                <p className="text-neutral-700 dark:text-neutral-300 text-sm">Transformative leadership development courses.</p>
              </div>
            </HoveredLink>
          </div>
        </MenuItem>

        <Link
          href="/webinar"
          className="relative z-50 cursor-pointer text-black hover:text-[#d4af37] transition-colors dark:text-white"
          onMouseEnter={() => setActive(null)}
        >
          Webinar
        </Link>

        <AuthButton onHover={() => setActive(null)} />
      </Menu>
    </div>
  );
}
