"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ROLE_META } from "@/types";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push(user.goalRole ? "/dashboard" : "/onboarding");
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <nav className="navbar">
        <span className="font-bold text-lg gradient-text">SkillSync AI</span>
        <div className="flex items-center gap-6">
          <Link href="/login"    className="nav-link">Sign In</Link>
          <Link href="/register" className="btn-primary px-5 py-2 text-sm">Get Started Free →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div style={{ position: "absolute", top: "10%", left: "20%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
          <div style={{ position: "absolute", top: "15%", right: "15%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
        </div>

        <div className="pill pill-indigo mb-6 mx-auto" style={{ width: "fit-content" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse inline-block" />
          AI-Powered Career Guidance • 9 Tech Roles
        </div>

        <h1 className="text-6xl font-bold mb-6 leading-tight tracking-tight">
          Your Personalized<br />
          <span className="gradient-text">Tech Career Roadmap</span>
        </h1>

        <p className="text-xl mb-10 max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Stop guessing what to learn. Get an AI-generated step-by-step roadmap, track your skills, practice interviews, and build your portfolio — all in one place.
        </p>

        <div className="flex gap-4 justify-center flex-wrap mb-16">
          <Link href="/register" className="btn-primary text-base px-8 py-3.5">
            Start For Free →
          </Link>
          <Link href="/login" className="btn-ghost text-base px-8 py-3.5">
            Sign In
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {[
            { value: "9",    label: "Career Paths",      icon: "🎯" },
            { value: "100+", label: "Skills Covered",    icon: "🧠" },
            { value: "8",    label: "Tools Built-in",    icon: "⚡" },
            { value: "Free", label: "To Get Started",    icon: "🎁" },
          ].map(s => (
            <div key={s.label} className="card text-center py-5">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold gradient-text">{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="section-title">How It Works</p>
          <h2 className="text-3xl font-bold">From zero to job-ready in 4 steps</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: "01", icon: "🎯", title: "Pick Your Role",    desc: "Choose from 9 specialized tech career paths" },
            { step: "02", icon: "🤖", title: "AI Analyzes",       desc: "We detect your exact skill gaps instantly" },
            { step: "03", icon: "🗺️", title: "Get Roadmap",       desc: "Receive a step-by-step personalized plan" },
            { step: "04", icon: "🏆", title: "Track & Build",     desc: "Mark skills done, earn XP, build projects" },
          ].map(item => (
            <div key={item.step} className="card text-center relative overflow-hidden">
              <div className="text-3xl font-bold mb-4 gradient-text opacity-20 absolute top-3 right-4 text-5xl select-none">{item.step}</div>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold mb-2 text-sm">{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Career roles */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="section-title">Career Paths</p>
          <h2 className="text-3xl font-bold">Choose your specialization</h2>
          <p className="mt-3 text-sm" style={{ color: "var(--text-secondary)" }}>Each path comes with a curated skill tree, projects, and resources</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(ROLE_META).map(([role, meta]) => (
            <div key={role} className="card card-hover group cursor-pointer">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-xl mb-3`}>
                {meta.icon}
              </div>
              <h3 className="font-semibold mb-1 text-sm">{role}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{meta.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <p className="section-title">Everything You Need</p>
          <h2 className="text-3xl font-bold">8 powerful tools in one platform</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "🗺️", title: "Skill Roadmap",     desc: "Personalized learning path" },
            { icon: "🤖", title: "AI Mentor Chat",    desc: "24/7 career guidance" },
            { icon: "💼", title: "Interview Prep",    desc: "DSA, Technical, HR" },
            { icon: "🎤", title: "Mock Interview",    desc: "Timed with scoring" },
            { icon: "📄", title: "Resume Builder",    desc: "3 professional templates" },
            { icon: "📅", title: "Weekly Planner",    desc: "Auto study schedule" },
            { icon: "🏅", title: "Badges & XP",       desc: "Gamified progress" },
            { icon: "🐙", title: "GitHub Analyzer",   desc: "Profile insights" },
          ].map(f => (
            <div key={f.title} className="card text-center py-5">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-xs mb-1">{f.title}</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <div className="card-glow">
          <div className="card-glow-inner text-center py-10">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="text-3xl font-bold mb-3">Ready to start your journey?</h2>
            <p className="mb-8 text-sm" style={{ color: "var(--text-secondary)" }}>
              Join developers building their careers with SkillSync AI. Free to use, no credit card required.
            </p>
            <Link href="/register" className="btn-primary text-base px-10 py-3.5">
              Create Free Account →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 text-center" style={{ borderColor: "var(--border)" }}>
        <p className="font-bold gradient-text mb-1">SkillSync AI</p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          B.Tech Final Year Project • AI-Powered Career Roadmap Platform
        </p>
      </footer>
    </main>
  );
}
