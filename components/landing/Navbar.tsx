import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Assuming shadcn button exists or I will use standard button
import { ArrowRight } from 'lucide-react';

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <img src="/logo.png" alt="ResilientOS" className="h-10 w-auto invert hue-rotate-180 rounded-lg mix-blend-screen" />
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
          <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-lg transition-all shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]">
            Start Free Trial
          </button>
        </Link>
      </div>
    </header>
  );
}
