"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Roadmap } from "@/types";

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 12 && h < 17) setGreeting("Good afternoon");
    else if (h >= 17) setGreeting("Good evening");
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.get<{ roadmap: Roadmap }>("/api/roadmap")
        .then(d => setRoadmap(d.roadmap))
        .catch(() => setRoadmap(null))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return null;

  const completed = roadmap?.skills.filter(s => s.status === "completed").length || 0;
  const inProgress = roadmap?.skills.filter(s => s.status === "inProgress").length || 0;
  const total = roadmap?.skills.length || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const missing = roadmap?.skills.filter(s => s.status === "missing").length || 0;

  const features = [
    { href: "/roadmap",        icon: "🗺️", title: "Skill Roadmap",      desc: "Track and toggle skill progress",       color: "rgba(99,102,241,0.15)" },
    { href: "/chat",           icon: "🤖", title: "AI Mentor Chat",      desc: "Ask doubts, get career guidance",       color: "rgba(139,92,246,0.15)" },
    { href: "/interview",      icon: "💼", title: "Interview Prep",      desc: "DSA, technical & HR questions",         color: "rgba(6,182,212,0.15)" },
    { href: "/mock-interview", icon: "🎤", title: "Mock Interview",      desc: "Timed interview with scoring",          color: "rgba(234,179,8,0.15)" },
    { href: "/resume",         icon: "📄", title: "Resume Builder",      desc: "3 professional templates + PDF",        color: "rgba(34,197,94,0.15)" },
    { href: "/planner",        icon: "📅", title: "Weekly Planner",      desc: "Auto-generate study schedule",          color: "rgba(249,115,22,0.15)" },
    { href: "/badges",         icon: "🏅", title: "Badges & XP",         desc: "View your achievements",               color: "rgba(236,72,153,0.15)" },
    { href: "/github",         icon: "🐙", title: "GitHub Analyzer",     desc: "Analyze any GitHub profile",           color: "rgba(51,65,85,0.4)" },
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="navbar">
        <span className="font-bold text-lg gradient-text">SkillSync AI</span>
        <div className="flex items-center gap-5">
          <Link href="/roadmap"   className="nav-link">Roadmap</Link>
          <Link href="/chat"      className="nav-link">AI Chat</Link>
          <Link href="/interview" className="nav-link">Interview</Link>
          <Link href="/settings"  className="nav-link">⚙️</Link>
          <button onClick={logout} className="nav-link hover:text-red-400 transition-colors">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-sm mb-1" style={{ color: "var(--text-muted)" }}>{greeting}</p>
            <h1 className="text-3xl font-bold">{user.name.split(" ")[0]} 👋</h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Working toward <span className="text-indigo-400 font-medium">{user.goalRole || "your goal"}</span>
            </p>
          </div>
          <Link href="/settings" className="btn-ghost text-sm px-4 py-2">⚙️ Settings</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "XP Earned",    value: user.xp,              icon: "⚡", color: "#eab308", bg: "rgba(234,179,8,0.1)",  border: "rgba(234,179,8,0.2)" },
            { label: "Day Streak",   value: `${user.streak}d`,    icon: "🔥", color: "#f97316", bg: "rgba(249,115,22,0.1)", border: "rgba(249,115,22,0.2)" },
            { label: "Completed",    value: `${completed}/${total}`, icon: "✅", color: "#22c55e", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.2)" },
            { label: "In Progress",  value: inProgress,           icon: "🔄", color: "#6366f1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.2)" },
          ].map(s => (
            <div key={s.label} className="card text-center" style={{ borderColor: s.border, background: s.bg }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {roadmap && (
          <div className="card mb-6">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="font-semibold text-sm">{roadmap.goalRole} — Overall Progress</h2>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{completed} of {total} skills completed · {missing} remaining</p>
              </div>
              <div className="text-2xl font-bold gradient-text">{percent}%</div>
            </div>
            <div className="progress-bar h-2.5">
              <div className="progress-fill h-2.5" style={{ width: `${percent}%` }} />
            </div>
            {percent < 100 && (
              <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
                {percent === 0 ? "🌱 Start by marking skills on your Roadmap page" :
                 percent < 30 ? "🚀 Great start! Keep the momentum going" :
                 percent < 70 ? "💪 Past the halfway mark! You're doing great" :
                 "🔥 Almost there! Finish strong"}
              </p>
            )}
          </div>
        )}

        {/* Features grid */}
        <div className="mb-2">
          <p className="section-title">All Features</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {features.map(f => (
            <Link key={f.href} href={f.href} className="feature-card group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 transition-transform group-hover:scale-110"
                style={{ background: f.color }}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-xs mb-1">{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
            </Link>
          ))}
        </div>

        {/* Suggested Projects */}
        {roadmap && roadmap.projects.length > 0 && (
          <div>
            <p className="section-title">Suggested Projects</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roadmap.projects.map((project, i) => (
                <div key={i} className="card card-hover">
                  <div className={`pill mb-3 ${
                    project.difficulty === "Beginner" ? "pill-green" :
                    project.difficulty === "Intermediate" ? "pill-yellow" : "pill-red"
                  }`}>
                    {project.difficulty === "Beginner" ? "🟢" : project.difficulty === "Intermediate" ? "🟡" : "🔴"} {project.difficulty}
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{project.title}</h3>
                  <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{project.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack?.map(tech => (
                      <span key={tech} className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
