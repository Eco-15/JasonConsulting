'use client';

import { Instagram, Linkedin, Twitter, Youtube, Facebook } from 'lucide-react';

const footerColumns = [
  {
    title: 'Services',
    links: [
      { text: 'Business Coaching', href: '/contact' },
      { text: 'Public Speaking', href: '/contact' },
      { text: 'Leadership Training', href: 'https://leaderforlife.com' },
      { text: 'Content Creation', href: 'https://youtube.com/@jasongraziani' },
    ],
  },
  {
    title: 'Businesses',
    links: [
      { text: 'EIB Agency', href: '/eib-agency' },
      { text: 'Leader For Life', href: 'https://leaderforlife.com' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { text: 'Newsletter', href: '/newsletter/subscribe' },
      { text: 'Contact', href: '/contact' },
      { text: 'About', href: '/#about' },
    ],
  },
];

const legalLinks = [
  { text: 'Terms of Service', href: '/terms' },
  { text: 'Privacy Policy', href: '/privacy' },
];

const socialIcons = [
  { icon: <Linkedin className="h-5 w-5" />, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: <Twitter className="h-5 w-5" />, href: 'https://twitter.com', label: 'Twitter' },
  { icon: <Facebook className="h-5 w-5" />, href: 'https://facebook.com', label: 'Facebook' },
  { icon: <Instagram className="h-5 w-5" />, href: 'https://instagram.com', label: 'Instagram' },
  { icon: <Youtube className="h-5 w-5" />, href: 'https://youtube.com/@jasongraziani', label: 'YouTube' },
];

export default function FooterNewsletter() {
  return (
    <footer className="bg-white text-foreground w-full min-w-full pt-20 pb-10">
      <div className="pointer-events-none absolute top-0 left-0 z-0 h-full w-full overflow-hidden">
        <div className="absolute top-1/3 left-1/4 h-64 w-64 rounded-full opacity-10 blur-3xl" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #000000 100%)' }} />
        <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full opacity-10 blur-3xl" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #000000 100%)' }} />
      </div>
      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
        <div className="mb-16 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm p-8 md:p-12 shadow-lg">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="mb-4 text-2xl font-bold md:text-3xl">
                <span className="gold-gradient-text">Transform Your Leadership Journey</span>
              </h3>
              <p className="text-gray-600 mb-6">
                Join thousands of leaders who receive exclusive insights, strategies, and inspiration delivered to your inbox.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="border-gray-300 bg-white rounded-lg border px-4 py-3 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 focus:outline-none"
                />
                <button className="silver-gradient-outline text-black rounded-lg px-6 py-3 font-medium shadow-lg hover:shadow-xl transition">
                  Subscribe Now
                </button>
              </div>
            </div>
            <div className="hidden justify-end md:flex">
              <div className="relative">
                <div className="absolute inset-0 rotate-6 rounded-xl" style={{ background: 'linear-gradient(135deg, #d4af37 0%, #000000 100%)', opacity: 0.2 }} />
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=320&h=240&q=80"
                  alt="Leadership development"
                  className="relative w-80 rounded-xl object-cover"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="mb-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-1">
            <div className="mb-6 flex items-center space-x-2">
              <div className="gold-gradient flex h-10 w-10 items-center justify-center rounded-lg font-bold text-lg shadow-md">
                JG
              </div>
              <span className="text-xl font-bold">Jason Graziani</span>
            </div>
            <p className="text-gray-600 mb-6">
              Transforming leaders and building legacies through coaching, speaking, and leadership development.
            </p>
            <div className="flex space-x-4">
              {socialIcons.map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="silver-gradient-outline flex h-10 w-10 items-center justify-center rounded-full hover:shadow-lg transition"
                  aria-label={item.label}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-lg font-semibold">{col.title}</h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.text}>
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-[#d4af37] transition"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-gray-200 flex flex-col items-center justify-between border-t pt-8 md:flex-row">
          <p className="text-gray-600 mb-4 text-sm md:mb-0">
            © {new Date().getFullYear()} Jason Graziani. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {legalLinks.map((link) => (
              <a
                key={link.text}
                href={link.href}
                className="text-gray-600 hover:text-[#d4af37] text-sm transition"
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
