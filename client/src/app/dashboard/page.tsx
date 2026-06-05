"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Roadmap } from "@/types";

const NAV_LINKS = [
  { href: "/roadmap", label: "Roadmap" },
  { href: "/chat", label: "AI Chat" },
  { href: "/interview", label: "Interview" },
  { href: "/analytics", label: "Analytics" },
];

const FEATURES = [
  { href: "/roadmap",        icon: "🗺️", title: "View Roadmap",      desc: "Track and verify skills" },
  { href: "/chat",           icon: "🤖", title: "AI Mentor Chat",     desc: "Ask doubts, get guidance" },
  { href: "/interview",      icon: "💼", title: "Interview Prep",     desc: "DSA, technical & HR" },
  { href: "/mock-interview", icon: "🎤", title: "Mock Interview",     desc: "Simulate real interview" },
  { href: "/analytics",      icon: "📊", title: "Analytics",          desc: "Progress charts & XP" },
  { href: "/studyplan",      icon: "📅", title: "Study Plan",         desc: "AI day-by-day schedule" },
  { href: "/jobmatch",       icon: "🎯", title: "Job Match",          desc: "Compare skills vs JD" },
  { href: "/leaderboard",    icon: "🏆", title: "Leaderboard",        desc: "XP rankings" },
  { href: "/resume",         icon: "📄", title: "Resume Builder",     desc: "Download PDF resume" },
  { href: "/github",         icon: "🐙", title: "GitHub Analyzer",    desc: "Analyze any profile" },
  { href: "/badges",         icon: "🏅", title: "Badges",             desc: "View achievements" },
];

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);
  useEffect(() => {
    if (user) {
      api.get<{ roadmap: Roadmap }>("/api/roadmap")
        .then(d => setRoadmap(d.roadmap)).catch(() => setRoadmap(null)).finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="spinner" />
    </div>
  );
  if (!user) return null;

  const completed = roadmap?.skills.filter(s => s.status === "completed").length || 0;
  const total = roadmap?.skills.length || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const missing = roadmap?.skills.filter(s => s.status === "missing").length || 0;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <nav className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "7px", background: "linear-gradient(135deg, #6366f1, #a855f7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "white" }}>S</div>
            <span style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-primary)" }}>SkillSync AI</span>
          </div>
          <div style={{ display: "flex", gap: "2px" }}>
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.target as HTMLElement).style.color = "var(--text-primary)"; (e.target as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={e => { (e.target as HTMLElement).style.color = "var(--text-secondary)"; (e.target as HTMLElement).style.background = "transparent"; }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/settings" style={{ padding: "4px 10px", borderRadius: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none" }}>Settings</Link>
          <button onClick={logout} className="btn-ghost" style={{ fontSize: "12px", padding: "5px 12px" }}>Logout</button>
        </div>
      </nav>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user.name.split(" ")[0]} 👋
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
            Working toward <span style={{ color: "#818cf8", fontWeight: "500" }}>{user.goalRole || "your goal"}</span>
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
          {[
            { label: "XP Earned", value: user.xp, icon: "⚡", color: "#fbbf24" },
            { label: "Day Streak", value: `${user.streak}d`, icon: "🔥", color: "#f97316" },
            { label: "Skills Done", value: `${completed}/${total}`, icon: "✓", color: "#4ade80" },
            { label: "Remaining", value: missing, icon: "○", color: "#818cf8" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className="stat-label">{s.label}</span>
                <span style={{ fontSize: "14px" }}>{s.icon}</span>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {roadmap && (
          <div className="card" style={{ marginBottom: "24px", padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: "600" }}>{roadmap.goalRole}</span>
                <span style={{ color: "var(--text-muted)", fontSize: "12px", marginLeft: "8px" }}>{completed} of {total} skills verified</span>
              </div>
              <span style={{ fontSize: "20px", fontWeight: "800", color: "#818cf8" }}>{percent}%</span>
            </div>
            <div className="progress-bar" style={{ height: "6px" }}>
              <div className="progress-fill" style={{ height: "6px", width: `${percent}%` }} />
            </div>
          </div>
        )}

        {/* Features grid */}
        <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="section-label">All Features</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "8px", marginBottom: "28px" }}>
          {FEATURES.map(f => (
            <Link key={f.href} href={f.href} style={{ textDecoration: "none" }}>
              <div className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{f.title}</div>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", lineHeight: "1.4" }}>{f.desc}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Suggested Projects */}
        {roadmap && roadmap.projects.length > 0 && (
          <>
            <p className="section-label" style={{ marginBottom: "12px" }}>Suggested Projects</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px" }}>
              {roadmap.projects.map((p, i) => (
                <div key={i} className="card">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span className={`badge ${p.difficulty === "Beginner" ? "badge-green" : p.difficulty === "Intermediate" ? "badge-yellow" : "badge-red"}`}>
                      {p.difficulty}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "13px", fontWeight: "600", marginBottom: "6px" }}>{p.title}</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "10px", lineHeight: "1.5" }}>{p.description}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {p.techStack?.map(t => (
                      <span key={t} style={{ fontSize: "10px", padding: "2px 7px", borderRadius: "4px", background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
