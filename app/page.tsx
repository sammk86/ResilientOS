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
        <main className="dark min-h-screen bg-slate-950 bg-gradient-to-b from-slate-900 via-gray-900 to-black text-white selection:bg-orange-500/30">
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
