import { LandingAccordionItem } from "@/components/ui/interactive-image-accordion";
import { ServicesSection } from "@/components/ui/services-section";
import { JourneySection } from "@/components/ui/journey-section";
import FooterNewsletter from "@/components/ui/footer-newsletter";

export default function Home() {
  return (
    <>
      <LandingAccordionItem />
      <JourneySection />
      <ServicesSection />
      <FooterNewsletter />
    </>
  );
}
