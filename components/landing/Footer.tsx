import Link from 'next/link';
import { Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-background border-t border-border py-12 px-6">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 font-bold text-xl">
                    <div className="w-8 h-8 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center text-white text-sm">R</div>
                    <span>ResilientOS</span>
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
