import { Linkedin, Twitter, Facebook, Instagram } from "lucide-react"
import { Footer } from "@/components/ui/footer"

export function JasonFooter() {
  return (
    <Footer
      logo={
        <div className="flex items-center justify-center w-10 h-10 gold-gradient text-gray-900 rounded-lg font-bold text-xl shadow-md">
          JG
        </div>
      }
      brandName="Jason Graziani"
      socialLinks={[
        {
          icon: <Linkedin className="h-5 w-5" />,
          href: "https://linkedin.com",
          label: "LinkedIn",
        },
        {
          icon: <Twitter className="h-5 w-5" />,
          href: "https://twitter.com",
          label: "Twitter",
        },
        {
          icon: <Facebook className="h-5 w-5" />,
          href: "https://facebook.com",
          label: "Facebook",
        },
        {
          icon: <Instagram className="h-5 w-5" />,
          href: "https://instagram.com",
          label: "Instagram",
        },
      ]}
      mainLinks={[
        { href: "/", label: "Home" },
        { href: "/#services", label: "Services" },
        { href: "/contact", label: "Contact" },
        { href: "https://www.leaderforlifeacademy.com/", label: "Leader For Life Academy" },
        { href: "https://eibagency.com", label: "EIB Agency" },
      ]}
      legalLinks={[
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
      ]}
      copyright={{
        text: `© ${new Date().getFullYear()} Jason Graziani`,
        license: "All rights reserved",
      }}
    />
  )
}
