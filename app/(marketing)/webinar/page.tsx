import { MinimalContact } from "@/components/ui/minimal-contact";
import FooterNewsletter from "@/components/ui/footer-newsletter";
import { CalendarCheck, Users, Lightbulb, Target } from "lucide-react";
import Link from "next/link";

export default function WebinarPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gray-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#d4af37]/20 via-transparent to-transparent" />
        <div className="relative max-w-5xl mx-auto px-4 pt-36 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8 text-sm">
            <CalendarCheck className="h-4 w-4 text-[#d4af37]" />
            <span>Free Live Webinar</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Lead with Purpose.{" "}
            <span className="gold-gradient-text">Grow with Strategy.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join Jason Graziani for an exclusive live webinar on leadership
            transformation, personal growth, and building a legacy that lasts.
          </p>

          <Link
            href="#register"
            className="inline-flex items-center gap-2 gold-gradient text-gray-900 font-semibold px-8 py-4 rounded-full text-lg hover:shadow-xl hover:shadow-[#d4af37]/20 transition-all"
          >
            Register Now
            <CalendarCheck className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            What You&apos;ll <span className="gold-gradient-text">Learn</span>
          </h2>
          <p className="text-gray-600 text-center max-w-xl mx-auto mb-14">
            Actionable strategies you can apply immediately to your leadership and career.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: "Clarity & Vision",
                description:
                  "Define your leadership identity and create a roadmap for the impact you want to make.",
              },
              {
                icon: Lightbulb,
                title: "Strategic Growth",
                description:
                  "Learn frameworks for decision-making that top executives use to scale their influence.",
              },
              {
                icon: Users,
                title: "Team Empowerment",
                description:
                  "Discover how to build high-performing teams that drive results without burnout.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center mb-5">
                  <item.icon className="h-6 w-6 text-gray-900" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Jason */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your Host: <span className="gold-gradient-text">Jason Graziani</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            With decades of experience in executive coaching and leadership development,
            Jason has helped hundreds of professionals unlock their potential and lead
            with confidence. His approach combines real-world strategy with personal
            growth to create lasting transformation.
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <MinimalContact />

      <FooterNewsletter />
    </>
  );
}
