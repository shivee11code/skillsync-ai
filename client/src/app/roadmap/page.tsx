"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Roadmap, SkillNode } from "@/types";

const STATUS = {
  completed: { label: "Completed",   dot: "#22c55e", bg: "rgba(34,197,94,0.1)",   border: "rgba(34,197,94,0.25)",   text: "#86efac" },
  inProgress: { label: "In Progress", dot: "#eab308", bg: "rgba(234,179,8,0.1)",   border: "rgba(234,179,8,0.25)",   text: "#fde047" },
  missing:    { label: "Not Started", dot: "#475569", bg: "rgba(71,85,105,0.1)",   border: "rgba(71,85,105,0.2)",    text: "#94a3b8" },
};

const nextStatus = (s: SkillNode["status"]): SkillNode["status"] =>
  s === "missing" ? "inProgress" : s === "inProgress" ? "completed" : "missing";

export default function RoadmapPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "missing" | "inProgress" | "completed">("all");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.get<{ roadmap: Roadmap }>("/api/roadmap")
        .then(d => setRoadmap(d.roadmap))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleToggle = async (skill: SkillNode) => {
    if (!roadmap || updating) return;
    setUpdating(skill.skillName);
    try {
      const data = await api.put<{ roadmap: Roadmap }>(
        `/api/roadmap/skill/${encodeURIComponent(skill.skillName)}`,
        { status: nextStatus(skill.status) }
      );
      setRoadmap(data.roadmap);
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!roadmap) return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div>
        <div className="text-5xl mb-4">🗺️</div>
        <p className="mb-4" style={{ color: "var(--text-secondary)" }}>No roadmap found.</p>
        <Link href="/onboarding" className="btn-primary">Generate Roadmap</Link>
      </div>
    </div>
  );

  const completed = roadmap.skills.filter(s => s.status === "completed").length;
  const percent = Math.round((completed / roadmap.skills.length) * 100);
  const filtered = filter === "all" ? roadmap.skills : roadmap.skills.filter(s => s.status === filter);

  return (
    <div className="min-h-screen">
      <nav className="navbar">
        <Link href="/dashboard" className="font-bold text-lg gradient-text">SkillSync AI</Link>
        <div className="flex items-center gap-5">
          <Link href="/chat"      className="nav-link">AI Chat</Link>
          <Link href="/interview" className="nav-link">Interview</Link>
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{roadmap.goalRole}</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {completed} of {roadmap.skills.length} skills completed
            </p>
          </div>
          <div className="text-3xl font-bold gradient-text">{percent}%</div>
        </div>

        {/* Progress */}
        <div className="progress-bar h-2 mb-8">
          <div className="progress-fill h-2" style={{ width: `${percent}%` }} />
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "missing", "inProgress", "completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border"
              style={filter === f ? {
                background: "rgba(99,102,241,0.2)", borderColor: "rgba(99,102,241,0.5)", color: "#a5b4fc"
              } : {
                background: "rgba(255,255,255,0.04)", borderColor: "var(--border)", color: "var(--text-muted)"
              }}>
              {f === "all" ? `All (${roadmap.skills.length})` :
               f === "completed" ? `✅ Completed (${roadmap.skills.filter(s => s.status === "completed").length})` :
               f === "inProgress" ? `🔄 In Progress (${roadmap.skills.filter(s => s.status === "inProgress").length})` :
               `📚 Not Started (${roadmap.skills.filter(s => s.status === "missing").length})`}
            </button>
          ))}
          <span className="ml-auto text-xs self-center" style={{ color: "var(--text-muted)" }}>
            Click any card to update status
          </span>
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((skill, i) => {
            const cfg = STATUS[skill.status];
            const isUpdating = updating === skill.skillName;
            return (
              <button key={skill.skillName} onClick={() => handleToggle(skill)} disabled={!!isUpdating}
                className="card text-left transition-all duration-200 group"
                style={{ borderColor: isUpdating ? "rgba(99,102,241,0.4)" : "var(--border)", cursor: isUpdating ? "wait" : "pointer" }}
                onMouseEnter={e => { if (!isUpdating) (e.currentTarget as HTMLElement).style.borderColor = "rgba(99,102,241,0.3)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                        {String(roadmap.skills.indexOf(skill) + 1).padStart(2, "0")}
                      </span>
                      <h3 className="font-semibold text-sm">{skill.skillName}</h3>
                    </div>
                    <div className="flex items-center gap-2 ml-7">
                      <span className="pill text-xs" style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
                        {cfg.label}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>~{skill.estimatedWeeks}w</span>
                    </div>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0" style={{ background: cfg.dot }} />
                </div>
                {skill.resources?.length > 0 && (
                  <div className="mt-3 ml-7 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                    <p className="text-xs mb-1.5" style={{ color: "var(--text-muted)" }}>Resources</p>
                    {skill.resources.slice(0, 2).map((r, ri) => (
                      <p key={ri} className="text-xs text-indigo-400 truncate">• {r}</p>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-2xl mb-2">🎉</p>
            <p style={{ color: "var(--text-secondary)" }}>No skills in this category</p>
          </div>
        )}

        <div className="card mt-6 py-3" style={{ background: "rgba(99,102,241,0.05)", borderColor: "rgba(99,102,241,0.2)" }}>
          <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
            <span className="text-indigo-400 font-medium">Tip:</span> Click any skill → Not Started → In Progress → Completed. Each completion earns <span className="text-yellow-400 font-medium">+10 XP</span>
          </p>
        </div>
      </div>
    </div>
  );
}
