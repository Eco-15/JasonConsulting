import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b-2 gold-border">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center justify-center w-10 h-10 gold-gradient text-gray-900 rounded-lg font-bold text-xl shadow-md">
              JG
            </div>
            <span className="font-bold text-xl text-gray-900">Jason Graziani</span>
          </Link>

          {/* Contact Button */}
          <Button asChild className="gold-gradient text-gray-900 hover:gold-shadow transition-all">
            <Link href="/contact">Contact</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
