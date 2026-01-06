import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Problem } from '@/components/landing/Problem';
import { Solution } from '@/components/landing/Solution';
import { SocialProof } from '@/components/landing/SocialProof';
import { Features } from '@/components/landing/Features';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground font-sans selection:bg-blue-500/30">
            <Navbar />
            <Hero />
            <Problem />
            <Solution />
            <SocialProof />
            <Features />
            <FAQ />
            <CTA />
            <Footer />
        </main>
    );
}
