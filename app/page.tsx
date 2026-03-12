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
  Lock,
  Sparkles,
  Target,
  Rocket,
  ChevronRight,
  CheckCircle2,
  Eye,
  MessageSquare,
  BarChart3,
  Globe,
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
    <div className="min-h-screen bg-[#0A0F1C] overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ══════════════════════════════════════════════
          FLOATING NAV — Glassmorphism sticky
       ══════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0A0F1C]/80 backdrop-blur-2xl px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/25">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">LinkedBoost</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-white/50 hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-white/50 hover:text-white transition-colors">How it works</a>
              <a href="#security" className="text-sm text-white/50 hover:text-white transition-colors">Security</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-white text-[#0A0F1C] hover:bg-white/90 font-semibold shadow-lg shadow-white/10">
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO — Cinematic with aurora gradient
       ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-32">
        {/* Aurora gradient background */}
        <div className="aurora-bg" />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid" />

        <div className="relative mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="animate-fade-in-up inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 text-sm mb-8">
            <Github className="h-4 w-4 text-white/70" />
            <span className="text-white/60">Powered by</span>
            <span className="text-white font-medium">GitHub Student Developer Pack</span>
            <ChevronRight className="h-3 w-3 text-white/40" />
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up animation-delay-100 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white leading-[1.05] tracking-tight max-w-4xl mx-auto">
            LinkedIn on
            <br />
            <span className="gradient-text">Autopilot</span>
          </h1>

          <p className="animate-fade-in-up animation-delay-200 mt-6 text-lg sm:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed">
            AI-powered job applications, viral content creation, and intelligent lead scraping.
            Completely free. Bring your own API key.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up animation-delay-300 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="text-base px-8 h-13 bg-blue-600 hover:bg-blue-500 glow-pulse font-semibold shadow-2xl shadow-blue-600/30">
                Start Free — No Credit Card
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="text-base h-13 border-white/10 bg-white/5 hover:bg-white/10">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Social proof stats */}
          <div className="animate-fade-in-up animation-delay-400 mt-16 flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white stat-glow">100%</p>
              <p className="text-xs text-white/30 mt-1">Free Forever</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white stat-glow">AES-256</p>
              <p className="text-xs text-white/30 mt-1">Encryption</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white stat-glow">BYOK</p>
              <p className="text-xs text-white/30 mt-1">Your Keys, Your Data</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LOGOS BAR — Tech stack / backed by
       ══════════════════════════════════════════════ */}
      <section className="border-y border-white/5 py-10 bg-white/2">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-xs text-white/20 uppercase tracking-[0.2em] mb-6">Built with industry-leading technology</p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
            {["Next.js 16", "React 19", "MongoDB", "TypeScript", "Tailwind CSS", "Chrome Extension"].map((tech) => (
              <span key={tech} className="text-sm font-medium text-white/20 hover:text-white/40 transition-colors">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FEATURES — Bento grid (Apple-style)
       ══════════════════════════════════════════════ */}
      <section id="features" className="py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-20">
            <p className="text-sm font-medium text-blue-400 uppercase tracking-[0.2em] mb-4">Three Pillars</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Everything you need to
              <br />
              <span className="gradient-text">dominate LinkedIn</span>
            </h2>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1 — Smart Auto-Apply (Large) */}
            <div className="spotlight-card lg:col-span-2 group rounded-3xl border border-white/8 bg-white/3 p-8 sm:p-10 hover:border-blue-500/20 transition-all duration-500">
              <div className="flex items-start justify-between mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 ring-1 ring-blue-500/20">
                  <Briefcase className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-xs font-mono text-white/20 bg-white/5 px-3 py-1 rounded-full">01</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">Smart Auto-Apply</h3>
              <p className="text-white/40 leading-relaxed text-base sm:text-lg max-w-xl">
                AI reads job descriptions, tailors your resume on the fly, and fills every Easy Apply form automatically.
                Apply to 15+ jobs daily while you sleep.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Target, text: "AI Resume Tailoring" },
                  { icon: Sparkles, text: "Smart Form Filling" },
                  { icon: Eye, text: "Job Match Scoring" },
                  { icon: BarChart3, text: "Application Analytics" },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center gap-2.5 text-sm text-white/50">
                    <feature.icon className="h-4 w-4 text-blue-400/60 shrink-0" />
                    {feature.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2 — Become a Hero */}
            <div className="spotlight-card group rounded-3xl border border-white/8 bg-white/3 p-8 sm:p-10 hover:border-purple-500/20 transition-all duration-500">
              <div className="flex items-start justify-between mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/20">
                  <Trophy className="h-6 w-6 text-purple-400" />
                </div>
                <span className="text-xs font-mono text-white/20 bg-white/5 px-3 py-1 rounded-full">02</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Become a Hero</h3>
              <p className="text-white/40 leading-relaxed">
                AI generates viral posts in your voice. Auto-engage with your niche. Grow your following on autopilot.
              </p>
              <div className="mt-6 space-y-3">
                {["Content generation", "Group auto-posting", "Engagement automation"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-white/50">
                    <CheckCircle2 className="h-3.5 w-3.5 text-purple-400/60 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 3 — Smart Scraper */}
            <div className="spotlight-card group rounded-3xl border border-white/8 bg-white/3 p-8 sm:p-10 hover:border-amber-500/20 transition-all duration-500">
              <div className="flex items-start justify-between mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 ring-1 ring-amber-500/20">
                  <Database className="h-6 w-6 text-amber-400" />
                </div>
                <span className="text-xs font-mono text-white/20 bg-white/5 px-3 py-1 rounded-full">03</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Smart Scraper</h3>
              <p className="text-white/40 leading-relaxed">
                Find people looking for your services. AI writes personalized outreach. Turn LinkedIn into your lead machine.
              </p>
              <div className="mt-6 space-y-3">
                {["Profile & post scraping", "AI personalized outreach", "Lead management"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-white/50">
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400/60 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Card 4 — Anti-Detection (wide) */}
            <div className="spotlight-card lg:col-span-2 group rounded-3xl border border-white/8 bg-white/3 p-8 sm:p-10 hover:border-emerald-500/20 transition-all duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
                <div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20 mb-4">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">Human-Level Anti-Detection</h3>
                  <p className="text-white/40 leading-relaxed max-w-md">
                    Gaussian-distributed delays, natural mouse movements, and smart session management.
                    Your account stays safe — always.
                  </p>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-3">
                  {[
                    "Gaussian timing",
                    "Session limits",
                    "Daily caps",
                    "Cooldown periods",
                    "Natural clicks",
                    "Reading pauses",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-white/40 bg-white/3 rounded-xl px-3 py-2.5 border border-white/5">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400/60 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          HOW IT WORKS — Vertical timeline
       ══════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-32 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-20">
            <p className="text-sm font-medium text-blue-400 uppercase tracking-[0.2em] mb-4">Getting Started</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Up and running in
              <br />
              <span className="gradient-text">three minutes</span>
            </h2>
          </div>

          <div className="space-y-0">
            {[
              {
                step: "01",
                title: "Add Your AI Key",
                description: "Paste your free Gemini or Groq API key. We encrypt it with AES-256-GCM — we never see it unencrypted.",
                icon: Key,
                color: "blue",
              },
              {
                step: "02",
                title: "Upload Your Resume",
                description: "Upload your PDF. AI parses and structures it. For each job, AI creates a perfectly tailored version.",
                icon: Rocket,
                color: "purple",
              },
              {
                step: "03",
                title: "Install Extension & Go",
                description: "Install the Chrome extension, set your preferences, and watch LinkedBoost work while you focus on what matters.",
                icon: Globe,
                color: "emerald",
              },
            ].map((item, index) => (
              <div key={item.step} className="relative flex gap-8 group">
                {/* Timeline line */}
                {index < 2 && (
                  <div className="absolute left-6 top-16 w-px h-full bg-linear-to-b from-white/10 to-transparent" />
                )}
                {/* Step circle */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:border-blue-500/30 transition-colors">
                  <item.icon className="h-5 w-5 text-white/60 group-hover:text-blue-400 transition-colors" />
                </div>
                {/* Content */}
                <div className="pb-16">
                  <span className="text-xs font-mono text-white/20">Step {item.step}</span>
                  <h3 className="text-xl font-bold text-white mt-1 mb-2">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed max-w-md">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          SECURITY & TRUST — Premium detail section
       ══════════════════════════════════════════════ */}
      <section id="security" className="py-32 border-t border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-20">
            <p className="text-sm font-medium text-emerald-400 uppercase tracking-[0.2em] mb-4">Security First</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
              Your data stays
              <br />
              <span className="gradient-text">yours</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "AES-256-GCM Encryption",
                description: "API keys encrypted at rest with authenticated encryption. Salt + IV + auth tag — military-grade security.",
                accent: "emerald",
              },
              {
                icon: Key,
                title: "BYOK — Bring Your Own Keys",
                description: "We never see your unencrypted keys. They're decrypted in-memory only during AI calls, then immediately discarded.",
                accent: "blue",
              },
              {
                icon: Shield,
                title: "Zero Tracking",
                description: "No analytics trackers. No data selling. No premium upsells. Your automation data belongs to you.",
                accent: "purple",
              },
            ].map((item) => (
              <div key={item.title} className="spotlight-card rounded-3xl border border-white/8 bg-white/3 p-8 hover:border-white/15 transition-all duration-500">
                <item.icon className={`h-8 w-8 text-${item.accent}-400 mb-6`} />
                <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          GITHUB STUDENT DEV PACK SECTION
       ══════════════════════════════════════════════ */}
      <section className="py-32 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-linear-to-b from-purple-600/3 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm mb-8">
            <Github className="h-4 w-4 text-purple-400" />
            <span className="text-purple-300 font-medium">GitHub Student Developer Pack</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-6">
            Built for students,
            <br />
            <span className="gradient-text">powered by GitHub</span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed mb-10">
            LinkedBoost is part of the GitHub Student Developer Pack. Get access to the full platform
            for free — no credit card, no trial period. Just sign up and start automating your LinkedIn presence.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Free AI Credits", desc: "Use Gemini or Groq free tiers" },
              { label: "Full Platform Access", desc: "Every feature, no restrictions" },
              { label: "Open Source", desc: "Transparent, auditable code" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/3 p-5 text-left">
                <p className="text-sm font-semibold text-white mb-1">{item.label}</p>
                <p className="text-xs text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FINAL CTA
       ══════════════════════════════════════════════ */}
      <section className="py-32 border-t border-white/5 relative">
        <div className="aurora-bg" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-6">
            Ready to automate
            <br />
            <span className="gradient-text">your LinkedIn?</span>
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto leading-relaxed mb-10">
            Join LinkedBoost today. Free forever — no credit card, no feature gates, no catch.
          </p>
          <Link href="/register">
            <Button size="lg" className="text-base px-10 h-14 bg-white text-[#0A0F1C] hover:bg-white/90 font-semibold shadow-2xl shadow-white/10">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
       ══════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">LinkedBoost</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#features" className="text-xs text-white/30 hover:text-white/50 transition-colors">Features</a>
              <a href="#how-it-works" className="text-xs text-white/30 hover:text-white/50 transition-colors">How it works</a>
              <a href="#security" className="text-xs text-white/30 hover:text-white/50 transition-colors">Security</a>
            </div>
            <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} LinkedBoost. Free and open source.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
