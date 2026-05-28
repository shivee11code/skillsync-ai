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

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.get<{ roadmap: Roadmap }>("/api/roadmap")
        .then((d) => setRoadmap(d.roadmap))
        .catch(() => setRoadmap(null))
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;
  }
  if (!user) return null;

  const completed = roadmap?.skills.filter((s) => s.status === "completed").length || 0;
  const total = roadmap?.skills.length || 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const missing = roadmap?.skills.filter((s) => s.status === "missing").length || 0;

  const features = [
    { href: "/roadmap",        icon: "🗺️", title: "View Roadmap",      desc: "Track and toggle skill progress" },
    { href: "/chat",           icon: "🤖", title: "AI Mentor Chat",     desc: "Ask doubts, get guidance" },
    { href: "/interview",      icon: "💼", title: "Interview Prep",     desc: "DSA, technical & HR questions" },
    { href: "/mock-interview", icon: "🎤", title: "Mock Interview",     desc: "Simulate a real tech interview" },
    { href: "/resume",         icon: "📄", title: "Resume Builder",     desc: "Build and download your resume" },
    { href: "/planner",        icon: "📅", title: "Weekly Planner",     desc: "Auto-generate study schedule" },
    { href: "/badges",         icon: "🏅", title: "Badges",             desc: "View your achievements" },
    { href: "/github",         icon: "🐙", title: "GitHub Analyzer",    desc: "Analyze any GitHub profile" },
  ];

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-xl gradient-text">SkillSync AI</span>
        <div className="flex items-center gap-5">
          <Link href="/roadmap"        className="text-slate-400 hover:text-white text-sm transition-colors">Roadmap</Link>
          <Link href="/chat"           className="text-slate-400 hover:text-white text-sm transition-colors">AI Chat</Link>
          <Link href="/interview"      className="text-slate-400 hover:text-white text-sm transition-colors">Interview</Link>
          <Link href="/mock-interview" className="text-slate-400 hover:text-white text-sm transition-colors">Mock</Link>
          <Link href="/resume"         className="text-slate-400 hover:text-white text-sm transition-colors">Resume</Link>
          <Link href="/settings"       className="text-slate-400 hover:text-white text-sm transition-colors" title="Settings">⚙️</Link>
          <button onClick={logout}     className="text-slate-400 hover:text-red-400 text-sm transition-colors">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {user.name.split(" ")[0]} 👋</h1>
            <p className="text-slate-400 text-sm">Target role: <span className="text-indigo-400 font-medium">{user.goalRole || "Not set"}</span></p>
          </div>
          <Link href="/onboarding" className="btn-ghost text-sm px-4 py-2">🔄 New Roadmap</Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "XP Earned",   value: user.xp,               icon: "⚡", color: "text-yellow-400" },
            { label: "Day Streak",  value: `${user.streak} days`,  icon: "🔥", color: "text-orange-400" },
            { label: "Skills Done", value: `${completed}/${total}`, icon: "✅", color: "text-green-400" },
            { label: "Skills Left", value: missing,                icon: "📚", color: "text-indigo-400" },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-slate-400 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {roadmap && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold">Overall Progress — {roadmap.goalRole}</h2>
              <span className="text-indigo-400 font-bold text-lg">{percent}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${percent}%` }} />
            </div>
            <p className="text-slate-500 text-xs mt-2">{completed} of {total} skills completed</p>
          </div>
        )}

        {/* Features */}
        <h2 className="text-lg font-bold mb-4 text-slate-300">All Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {features.map((f) => (
            <Link key={f.href} href={f.href}
              className="card hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-200 group cursor-pointer p-4">
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-semibold text-sm mb-0.5 group-hover:text-indigo-400 transition-colors">{f.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{f.desc}</p>
            </Link>
          ))}
        </div>

        {/* Suggested Projects */}
        {roadmap && roadmap.projects.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 text-slate-300">Suggested Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roadmap.projects.map((project, i) => (
                <div key={i} className="card">
                  <div className={`text-xs font-medium px-2.5 py-1 rounded-full inline-block mb-3 ${
                    project.difficulty === "Beginner"     ? "bg-green-500/15 text-green-400"  :
                    project.difficulty === "Intermediate" ? "bg-yellow-500/15 text-yellow-400" :
                                                           "bg-red-500/15 text-red-400"}`}>
                    {project.difficulty}
                  </div>
                  <h3 className="font-semibold mb-2 text-sm">{project.title}</h3>
                  <p className="text-slate-400 text-xs mb-3 leading-relaxed">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {project.techStack?.map((tech) => (
                      <span key={tech} className="text-xs bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 text-slate-400">{tech}</span>
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
