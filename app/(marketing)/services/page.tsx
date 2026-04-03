"use client";

import { motion } from "framer-motion";
import { Briefcase, Mic, GraduationCap, Video, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import FooterNewsletter from "@/components/ui/footer-newsletter";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5 },
  }),
};

const services = [
  {
    icon: <Briefcase className="h-6 w-6" />,
    title: "Business Coaching",
    description:
      "Personalized one-on-one coaching designed for entrepreneurs and business leaders ready to scale. Jason works with you to identify growth opportunities, overcome obstacles, and build sustainable strategies that drive real results.",
    benefits: [
      "Clarify your vision and set actionable goals",
      "Develop leadership skills that inspire your team",
      "Build systems for sustainable, scalable growth",
      "Gain accountability and expert guidance every step of the way",
    ],
    cta: { label: "Start Coaching", href: "/contact" },
  },
  {
    icon: <Mic className="h-6 w-6" />,
    title: "Public Speaking",
    description:
      "Jason delivers powerful keynotes and workshops that energize audiences and drive action. Whether it's a corporate event, conference, or community gathering, his talks blend real-world experience with actionable insights.",
    benefits: [
      "Engaging keynotes tailored to your audience",
      "Workshops on leadership, entrepreneurship, and growth mindset",
      "Motivational talks that inspire lasting change",
      "Available for corporate events, conferences, and retreats",
    ],
    cta: { label: "Book a Speaker", href: "/contact" },
  },
  {
    icon: <GraduationCap className="h-6 w-6" />,
    title: "Leadership Training",
    description:
      "Through the Leader For Life Academy, Jason offers transformative leadership development programs that equip individuals and teams with the skills to lead with impact, integrity, and resilience.",
    benefits: [
      "Comprehensive leadership development curriculum",
      "Self-paced and live training options",
      "Tools for building high-performing teams",
      "Ongoing community and support network",
    ],
    cta: {
      label: "Explore the Academy",
      href: "https://www.leaderforlifeacademy.com/",
      external: true,
    },
  },
  {
    icon: <Video className="h-6 w-6" />,
    title: "Content Creation",
    description:
      "Jason creates compelling content across platforms to educate, inspire, and connect with audiences worldwide. From video series to social media strategy, he helps amplify your message and build an authentic brand presence.",
    benefits: [
      "Video content strategy and production guidance",
      "Social media presence and brand storytelling",
      "Educational content that positions you as a thought leader",
      "Multi-platform approach for maximum reach",
    ],
    cta: { label: "Get In Touch", href: "/contact" },
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gray-50 pt-36 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="gold-gradient-text">Consulting Services</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Empowering entrepreneurs and leaders to unlock their full potential
            through coaching, speaking, training, and strategic content.
          </p>
          <Button asChild className="bg-black text-white hover:bg-black/90">
            <Link href="/contact">
              Get In Touch <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Service Detail Cards */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeIn}
                className="rounded-2xl border-2 border-gray-200 bg-white p-8 shadow-sm hover:border-[#d4af37] hover:gold-shadow transition-all duration-300"
              >
                <div className="w-fit rounded-lg border gold-border gold-gradient p-3 mb-5">
                  {service.icon}
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-3">
                  <span className="gold-gradient-text">{service.title}</span>
                </h3>
                <p className="text-gray-600 mb-5 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {service.benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4af37]" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant="outline"
                  className="silver-gradient-outline hover:gold-shadow transition-shadow"
                >
                  {"external" in service.cta ? (
                    <a
                      href={service.cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {service.cta.label}{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  ) : (
                    <Link href={service.cta.href}>
                      {service.cta.label}{" "}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="gold-gradient-text">
              Ready to Take the Next Step?
            </span>
          </h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto mb-8">
            Book a consultation to discuss how Jason can help you and your
            business reach new heights.
          </p>
          <Button asChild className="bg-black text-white hover:bg-black/90">
            <Link href="/contact">
              Book a Consultation <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <FooterNewsletter />
    </>
  );
}
