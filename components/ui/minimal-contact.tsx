"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { submitContact } from "@/lib/actions/contacts";

export function MinimalContact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitContact(formData);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("You're registered! We'll send you the details soon.");
      setFormData({ name: "", email: "", phone: "" });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div id="register" className="bg-white px-4 py-20">
      <div className="max-w-xl w-full mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            <span className="gold-gradient-text">Save Your Spot</span>
          </h2>
          <p className="text-gray-600">
            Fill in your details below to register.
          </p>
        </div>

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
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your Phone Number"
              className="w-full px-0 py-4 border-0 border-b-2 border-gray-200 focus:border-[#d4af37] focus:outline-none focus:ring-0 text-lg placeholder:text-gray-400 transition-colors bg-transparent"
            />
          </div>

          <div className="pt-8">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full md:w-auto silver-gradient-outline text-black hover:shadow-xl px-12 text-base group transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Save Your Spot
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
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
