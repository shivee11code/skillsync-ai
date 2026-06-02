"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

const ROLES = [
  { icon: "🌐", title: "Full Stack SDE", desc: "React, Node.js, MongoDB" },
  { icon: "🤖", title: "AI Engineer", desc: "LLMs, PyTorch, LangChain" },
  { icon: "📊", title: "Data Scientist", desc: "Python, ML, Analytics" },
  { icon: "🔧", title: "DevOps Engineer", desc: "Docker, K8s, CI/CD" },
  { icon: "🔒", title: "Cybersecurity", desc: "Pentesting, OWASP, SIEM" },
  { icon: "☁️", title: "Cloud Engineer", desc: "AWS, Terraform, Serverless" },
  { icon: "🎨", title: "Frontend Dev", desc: "React, Next.js, Tailwind" },
  { icon: "⚙️", title: "Backend Dev", desc: "APIs, Databases, System Design" },
  { icon: "📱", title: "Mobile Dev", desc: "React Native, Expo" },
];

const FEATURES = [
  { icon: "🗺️", title: "AI Roadmap", desc: "Personalized skill trees with gap analysis" },
  { icon: "📝", title: "Skill Quizzes", desc: "Verify knowledge before marking complete" },
  { icon: "🎤", title: "Mock Interview", desc: "Timed rounds with instant AI feedback" },
  { icon: "📄", title: "Resume Builder", desc: "3 professional templates, PDF export" },
  { icon: "📊", title: "Analytics", desc: "XP tracking, streaks, progress charts" },
  { icon: "🎯", title: "Job Matcher", desc: "Compare your skills against any JD" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.push(user.goalRole ? "/dashboard" : "/onboarding");
  }, [user, loading, router]);

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Navbar */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, height: "52px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", background: "rgba(8,8,15,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "800", fontSize: "13px" }}>S</div>
          <span style={{ fontWeight: "700", fontSize: "15px", letterSpacing: "-0.01em" }}>SkillSync AI</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/login" className="btn-ghost" style={{ padding: "6px 14px" }}>Sign in</Link>
          <Link href="/register" className="btn-primary" style={{ padding: "6px 14px" }}>Get started free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "80px 24px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "20px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: "28px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", display: "inline-block", animation: "pulse 2s infinite" }} />
          <span style={{ fontSize: "12px", color: "#818cf8", fontWeight: "500" }}>AI-powered career guidance · 9 tech roles</span>
        </div>

        <h1 style={{ fontSize: "clamp(32px,5vw,54px)", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.03em", marginBottom: "18px" }}>
          The smartest way to<br />
          <span className="gradient-text">land your tech role</span>
        </h1>

        <p style={{ fontSize: "16px", color: "var(--text-2)", lineHeight: "1.8", maxWidth: "500px", margin: "0 auto 36px" }}>
          Get a personalized skill roadmap, verify learning with quizzes, practice with AI mock interviews, and track every step of your journey.
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link href="/register" className="btn-primary" style={{ padding: "10px 22px", fontSize: "14px", fontWeight: "600" }}>
            Start for free →
          </Link>
          <Link href="/login" className="btn-ghost" style={{ padding: "10px 22px", fontSize: "14px" }}>
            Sign in
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", marginTop: "52px", flexWrap: "wrap" }}>
          {[["9", "Career roles"], ["100+", "Skills mapped"], ["50+", "Interview Qs"], ["3", "Resume templates"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div className="gradient-text" style={{ fontSize: "22px", fontWeight: "800" }}>{v}</div>
              <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-2)", padding: "56px 24px" }}>
        <div style={{ maxWidth: "960px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <p className="section-label" style={{ marginBottom: "8px" }}>Career paths</p>
            <h2 style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-0.02em" }}>Choose your direction</h2>
            <p style={{ color: "var(--text-2)", fontSize: "13px", marginTop: "6px" }}>9 specialized roadmaps — pick yours and start today</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: "10px" }}>
            {ROLES.map(r => (
              <Link href="/register" key={r.title} style={{ textDecoration: "none" }}>
                <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: "10px", padding: "16px", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor = "rgba(99,102,241,0.3)"; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor = "var(--border)"; el.style.transform = "none"; }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>{r.icon}</div>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-1)", marginBottom: "2px" }}>{r.title}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-3)" }}>{r.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "56px 24px", maxWidth: "960px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <p className="section-label" style={{ marginBottom: "8px" }}>Platform features</p>
          <h2 style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-0.02em" }}>Everything in one place</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" }}>
          {FEATURES.map(f => (
            <div key={f.title} className="card" style={{ padding: "18px" }}>
              <div style={{ fontSize: "22px", marginBottom: "10px" }}>{f.icon}</div>
              <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>{f.title}</div>
              <div style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: "1.5" }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "56px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "10px" }}>Ready to build your career?</h2>
        <p style={{ color: "var(--text-2)", fontSize: "13px", marginBottom: "24px" }}>Free forever. No credit card required.</p>
        <Link href="/register" className="btn-primary" style={{ padding: "10px 24px", fontSize: "14px", fontWeight: "600" }}>
          Create free account →
        </Link>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "18px 28px", textAlign: "center" }}>
        <span style={{ fontSize: "12px", color: "var(--text-3)" }}>© 2025 SkillSync AI · B.Tech Final Year Project</span>
      </div>
    </div>
  );
}
