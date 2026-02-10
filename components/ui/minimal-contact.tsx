"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";

export function MinimalContact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-20">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 gold-gradient rounded-full mb-6 shadow-lg">
            <Mail className="h-8 w-8 text-gray-900" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="gold-gradient-text">Get in Touch</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Let&apos;s start a conversation about transforming your leadership journey.
          </p>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
              className="w-full px-0 py-4 border-0 border-b-2 border-gray-200 focus:border-[#d4af37] focus:outline-none focus:ring-0 text-lg placeholder:text-gray-400 transition-colors bg-transparent"
            />
          </div>

          <div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Your Email"
              className="w-full px-0 py-4 border-0 border-b-2 border-gray-200 focus:border-[#d4af37] focus:outline-none focus:ring-0 text-lg placeholder:text-gray-400 transition-colors bg-transparent"
            />
          </div>

          <div>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Your Message"
              className="w-full px-0 py-4 border-0 border-b-2 border-gray-200 focus:border-[#d4af37] focus:outline-none focus:ring-0 text-lg placeholder:text-gray-400 transition-colors resize-none bg-transparent"
            />
          </div>

          <div className="pt-8">
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto silver-gradient-outline text-black hover:shadow-xl px-12 text-base group transition-all"
            >
              Send Message
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </form>

        {/* Direct Contact */}
        <div className="mt-16 pt-16 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600 mb-4">
            Or reach out directly
          </p>
          <a
            href="mailto:jason@jasongraziani.com"
            className="text-lg font-semibold text-gray-900 hover:text-gray-600 transition-colors"
          >
            jason@jasongraziani.com
          </a>
        </div>
      </div>
    </div>
  );
}
