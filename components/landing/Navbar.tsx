import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming shadcn button exists or I will use standard button
import { ArrowRight } from 'lucide-react';

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            R
          </div>
          <span>ResilientOS</span>
        </Link>
      </div>

      <nav className="hidden md:flex items-center gap-6">
        {/* No global nav links as per 1:1 attention ratio, only Login and Trial */}
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
          Login
        </Link>
        <Link href="/sign-up">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)]">
            Start Free Trial
          </button>
        </Link>
      </div>
    </header>
  );
}
