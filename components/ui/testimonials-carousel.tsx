import { ShareholderReports, Report } from "@/components/ui/carousel";

// Sample testimonials/success stories data
const testimonialsData: Report[] = [
  {
    id: "testimonial1",
    quarter: "Sarah M.",
    period: "CEO, Tech Startup",
    imageSrc: "https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnWyr2rmwDoEgx6u7dLy8etIN1pvK3aPWcf5AR",
    isNew: true,
  },
  {
    id: "testimonial2",
    quarter: "Michael R.",
    period: "VP of Operations",
    imageSrc: "https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnjCbRX4kELmIuFY2xWfjP3dbMtw8TZ1SDK7p4",
  },
  {
    id: "testimonial3",
    quarter: "Jennifer L.",
    period: "Business Owner",
    imageSrc: "https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnDBA4rUaP3lgPtQaYepo9UIAxckSyhTrmqdRj",
  },
  {
    id: "testimonial4",
    quarter: "David K.",
    period: "Executive Director",
    imageSrc: "https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnd7spMIl7cmdASPKDVwuU18xgjXi5O4RQaH2I",
  },
  {
    id: "testimonial5",
    quarter: "Amanda P.",
    period: "Team Leader",
    imageSrc: "https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnCiRNubykjw7PSNi0m8alYrGqn6LoI9hUxsv4",
  },
  {
    id: "testimonial6",
    quarter: "Robert H.",
    period: "Entrepreneur",
    imageSrc: "https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnhGZaPWY9W6gmdlcRq3pNrYKbZSBVTJaD7jAo",
  },
];

export function TestimonialsCarousel() {
  return (
    <section className="w-full bg-gray-50 py-16">
      <ShareholderReports
        reports={testimonialsData}
        title="Success Stories"
        subtitle="Transforming leaders, one journey at a time"
      />
    </section>
  );
}
