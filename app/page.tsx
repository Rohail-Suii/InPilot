import Link from "next/link";
import {
  Zap,
  Briefcase,
  Trophy,
  Database,
  ArrowRight,
  Shield,
  Key,
  Github,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "LinkedBoost",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "The best free LinkedIn automation tool. Auto-apply to jobs, build your personal brand, and scrape leads — all with your own AI keys.",
  };

  return (
    <div className="min-h-screen bg-[#0A0F1C]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Nav */}
      <nav className="border-b border-white/5">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-600/20">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">LinkedBoost</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started Free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400 mb-8">
            <Key className="h-3.5 w-3.5" />
            100% Free — Bring Your Own AI Key
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight max-w-4xl mx-auto">
            LinkedIn Automation{" "}
            <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              That Goes Viral
            </span>
          </h1>
          <p className="mt-6 text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
            Auto-apply to jobs with AI-tailored resumes, build your personal brand with
            smart content, and find leads with intelligent scraping — all completely free.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-base px-8">
                Start Automating
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-base">
                See Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">
              Three Pillars of LinkedIn Domination
            </h2>
            <p className="mt-4 text-white/40 max-w-lg mx-auto">
              Everything you need to master LinkedIn — job hunting, personal branding, and lead generation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-blue-500/30 transition-all hover:scale-[1.02]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 mb-6">
                <Briefcase className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Auto-Apply</h3>
              <p className="text-white/40 leading-relaxed">
                AI tailors your resume for each job. The Chrome extension fills Easy Apply forms automatically. Apply to 15+ jobs daily while you sleep.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-purple-500/30 transition-all hover:scale-[1.02]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 mb-6">
                <Trophy className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Become a Hero</h3>
              <p className="text-white/40 leading-relaxed">
                AI generates viral LinkedIn posts in your voice. Auto-post to groups, engage with your niche, and grow your following on autopilot.
              </p>
            </div>
            <div className="group rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-amber-500/30 transition-all hover:scale-[1.02]">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 mb-6">
                <Database className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Scraper</h3>
              <p className="text-white/40 leading-relaxed">
                Find people looking for your services. AI writes personalized outreach. Turn LinkedIn into your lead generation machine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white">Up and Running in 3 Steps</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg mb-6">01</div>
              <h3 className="text-lg font-semibold text-white mb-2">Add Your AI Key</h3>
              <p className="text-white/40">Paste your free Gemini or Groq API key. We never store it unencrypted — AES-256 at rest.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg mb-6">02</div>
              <h3 className="text-lg font-semibold text-white mb-2">Upload Your Resume</h3>
              <p className="text-white/40">Upload your PDF. AI parses and structures it. For each job, AI tailors a perfect match.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-lg mb-6">03</div>
              <h3 className="text-lg font-semibold text-white mb-2">Install Extension &amp; Go</h3>
              <p className="text-white/40">Install the Chrome extension, configure your preferences, and let LinkedBoost handle the rest.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Shield className="h-8 w-8 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Anti-Detection Built In</h3>
              <p className="text-white/40 text-sm">Human-like delays, Gaussian-distributed timing, natural mouse movements. Your account stays safe.</p>
            </div>
            <div>
              <Key className="h-8 w-8 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">BYOK — Your Keys, Your Data</h3>
              <p className="text-white/40 text-sm">We never see your unencrypted API keys. AES-256-GCM encryption at rest. No tracking, no selling data.</p>
            </div>
            <div>
              <Github className="h-8 w-8 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Free Forever</h3>
              <p className="text-white/40 text-sm">No premium tier, no feature gates. Every feature is available to everyone, always.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Dominate LinkedIn?</h2>
          <p className="text-white/40 mb-8 max-w-lg mx-auto">
            Join thousands using LinkedBoost to automate their job search, build their brand, and generate leads.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-base px-8">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">LinkedBoost</span>
          </div>
          <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} LinkedBoost. Free and open source.</p>
        </div>
      </footer>
    </div>
  );
}
