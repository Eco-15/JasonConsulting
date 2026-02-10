import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { JasonNavbar } from "@/components/ui/jason-navbar";
import { AuthProvider } from "@/components/auth/auth-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jason Graziani | Business Coach & Leadership Development",
  description: "Jason Graziani — Business Coach, Public Speaker, Entrepreneur, and Developer of Leaders. Transforming individuals and organizations through coaching, leadership development, and business solutions.",
  openGraph: {
    title: "Jason Graziani | Business Coach & Leadership Development",
    description: "Jason Graziani — Business Coach, Public Speaker, Entrepreneur, and Developer of Leaders. Transforming individuals and organizations through coaching, leadership development, and business solutions.",
    images: [
      {
        url: "https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnJbow554sjgKf5MHd3EyecOPSWChvliwxr1Gk",
        width: 1200,
        height: 630,
        alt: "Jason Graziani - Business Coach & Leadership Development",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jason Graziani | Business Coach & Leadership Development",
    description: "Jason Graziani — Business Coach, Public Speaker, Entrepreneur, and Developer of Leaders. Transforming individuals and organizations through coaching, leadership development, and business solutions.",
    images: ["https://lyz5cvfr0h.ufs.sh/f/tLx4hl5ikmOnJbow554sjgKf5MHd3EyecOPSWChvliwxr1Gk"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <AuthProvider>
          <JasonNavbar />
          <main className="overflow-x-hidden">{children}</main>
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
