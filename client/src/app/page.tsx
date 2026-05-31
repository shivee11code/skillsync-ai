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
      <div className="spinner" />
    </div>
  );

  return (
    <div style={{ background: "var(--bg-primary)", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ borderBottom: "1px solid var(--border)", padding: "0 32px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "rgba(9,9,11,0.9)", backdropFilter: "blur(12px)", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>S</div>
          <span style={{ fontWeight: "700", fontSize: "15px", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>SkillSync AI</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link href="/login" className="btn-ghost" style={{ fontSize: "13px", padding: "6px 14px" }}>Sign in</Link>
          <Link href="/register" className="btn-primary" style={{ fontSize: "13px", padding: "6px 14px" }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "80px 32px 64px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "20px", padding: "4px 12px", marginBottom: "32px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", display: "inline-block" }} />
          <span style={{ fontSize: "12px", color: "#818cf8", fontWeight: "500" }}>AI-powered career guidance for 9 tech roles</span>
        </div>

        <h1 style={{ fontSize: "clamp(36px, 5vw, 58px)", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-0.03em", color: "var(--text-primary)", marginBottom: "20px" }}>
          Your personalized path to<br />
          <span className="gradient-text">your dream tech role</span>
        </h1>

        <p style={{ fontSize: "17px", color: "var(--text-secondary)", lineHeight: "1.7", maxWidth: "560px", margin: "0 auto 40px" }}>
          Stop guessing what to learn. Get an AI-generated roadmap, verify skills with quizzes, practice interviews, and track your progress — all in one place.
        </p>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" className="btn-primary" style={{ padding: "10px 24px", fontSize: "14px", fontWeight: "600" }}>
            Start for free →
          </Link>
          <Link href="/login" className="btn-ghost" style={{ padding: "10px 24px", fontSize: "14px" }}>
            Sign in
          </Link>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: "32px", justifyContent: "center", marginTop: "56px", flexWrap: "wrap" }}>
          {[["9", "Career roles"], ["100+", "Skills tracked"], ["50+", "Interview questions"], ["3", "Resume templates"]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "800", background: "linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{v}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles grid */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <p className="section-label" style={{ marginBottom: "8px" }}>Career Paths</p>
          <h2 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Choose your direction</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "8px" }}>9 specialized roadmaps built for today's tech market</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
          {Object.entries(ROLE_META).map(([role, meta]) => (
            <Link href="/register" key={role} style={{ textDecoration: "none" }}>
              <div className="feature-card" style={{ padding: "16px" }}>
                <div style={{ fontSize: "22px", marginBottom: "4px" }}>{meta.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", lineHeight: "1.3" }}>{role}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>{meta.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ borderTop: "1px solid var(--border)", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "64px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <p className="section-label" style={{ marginBottom: "8px" }}>Everything you need</p>
            <h2 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.02em" }}>Built for serious learners</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
            {[
              { icon: "🗺️", title: "AI Roadmap", desc: "Personalized skill trees with gap detection" },
              { icon: "📝", title: "Skill Quizzes", desc: "Verify knowledge before marking complete" },
              { icon: "🎯", title: "Mock Interviews", desc: "Role-specific questions with AI scoring" },
              { icon: "📄", title: "Resume Builder", desc: "3 professional templates, PDF export" },
              { icon: "📊", title: "Analytics", desc: "Track XP, streaks, and progress charts" },
              { icon: "🏆", title: "Leaderboard", desc: "Compete with other learners by XP" },
              { icon: "🐙", title: "GitHub Analyzer", desc: "Analyze any GitHub profile and repos" },
              { icon: "📅", title: "Study Planner", desc: "Auto-generated weekly study schedule" },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: "16px" }}>
                <div style={{ fontSize: "20px", marginBottom: "8px" }}>{f.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>{f.title}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: "1.5" }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "64px 32px", textAlign: "center" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "12px" }}>Ready to start?</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "28px" }}>Free forever. No credit card required.</p>
        <Link href="/register" className="btn-primary" style={{ padding: "10px 28px", fontSize: "14px", fontWeight: "600" }}>
          Create your free account →
        </Link>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "20px 32px", display: "flex", justifyContent: "center" }}>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>© 2025 SkillSync AI · B.Tech Final Year Project</span>
      </div>
    </div>
  );
}
