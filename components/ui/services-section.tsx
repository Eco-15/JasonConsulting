"use client";

import { Briefcase, Building2, GraduationCap } from "lucide-react";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";

export function ServicesSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="gold-gradient-text">Areas of Excellence</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Empowering growth through diverse expertise in coaching, speaking, entrepreneurship, and leadership development.
          </p>
        </div>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          <GridItem
            area=""
            icon={<Briefcase className="h-4 w-4" />}
            title="Business Coaching"
            description="Personalized coaching to help entrepreneurs and business leaders scale their ventures and achieve sustainable growth."
          />
          <GridItem
            area=""
            icon={<Building2 className="h-4 w-4" />}
            title="EIB Agency"
            description="Comprehensive insurance solutions designed to protect what matters most to you and your business."
          />
          <GridItem
            area=""
            icon={<GraduationCap className="h-4 w-4" />}
            title="Leader For Life"
            description="Transformative leadership development courses that equip individuals with the skills to lead with impact and integrity."
          />
        </ul>
      </div>
    </section>
  );
}

interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
  alignTop?: boolean;
}

const GridItem = ({ area, icon, title, description, alignTop = false }: GridItemProps) => {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-[1.25rem] border-2 border-gray-200 p-2 md:rounded-[1.5rem] md:p-3 hover:border-[#d4af37] transition-colors duration-300">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-2 border-gray-200 bg-background p-6 shadow-sm hover:gold-shadow dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6 transition-shadow duration-300">
          <div className={cn("relative flex flex-1 flex-col gap-3", alignTop ? "justify-start" : "justify-between")}>
            <div className="w-fit rounded-lg border-[0.75px] gold-border gold-gradient p-2">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                {title}
              </h3>
              <h2 className="[&_b]:md:font-semibold [&_strong]:md:font-semibold font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                {description}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};
