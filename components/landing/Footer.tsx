import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-transparent border-t border-white/10 py-12 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <img src="/logo.png" alt="ResilientOS" className="h-10 w-auto invert hue-rotate-180 rounded-lg mix-blend-screen" />
                </div>

                <div className="flex items-center gap-8 text-sm text-muted-foreground">
                    <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
                    <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Twitter className="w-5 h-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Linkedin className="w-5 h-5" /></Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors"><Github className="w-5 h-5" /></Link>
                </div>
            </div>
            <div className="text-center text-xs text-muted-foreground mt-8">
                &copy; {new Date().getFullYear()} ResilientOS. All rights reserved.
            </div>
        </footer>
    );
}
