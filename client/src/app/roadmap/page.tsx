"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Roadmap, SkillNode } from "@/types";

const STATUS_CONFIG = {
  completed: { label: "Completed ✅", color: "bg-green-500/20 text-green-400 border-green-500/30", dot: "bg-green-400" },
  inProgress: { label: "In Progress", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", dot: "bg-yellow-400" },
  missing: { label: "Not Started", color: "bg-slate-500/20 text-slate-400 border-slate-500/30", dot: "bg-slate-500" },
};

export default function RoadmapPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.get<{ roadmap: Roadmap }>("/api/roadmap")
        .then((d) => setRoadmap(d.roadmap))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleStart = async (skill: SkillNode) => {
    if (skill.status !== "missing") return;
    setUpdating(skill.skillName);
    try {
      const data = await api.put<{ roadmap: Roadmap }>(
        `/api/roadmap/skill/${encodeURIComponent(skill.skillName)}`,
        { status: "inProgress" }
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
      <div><p className="text-slate-400 mb-4">No roadmap found.</p>
      <Link href="/onboarding" className="btn-primary">Generate Roadmap</Link></div>
    </div>
  );

  const completed = roadmap.skills.filter((s) => s.status === "completed").length;
  const percent = Math.round((completed / roadmap.skills.length) * 100);

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex items-center gap-6">
          <Link href="/chat" className="text-slate-400 hover:text-white text-sm">AI Chat</Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">{roadmap.goalRole} Roadmap</h1>
          <p className="text-slate-400">{completed}/{roadmap.skills.length} skills verified</p>
          <div className="mt-4 w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-700"
              style={{ width: `${percent}%` }} />
          </div>
        </div>

        <div className="card bg-indigo-500/5 border-indigo-500/20 mb-6 text-sm text-slate-400">
          <span className="text-indigo-400 font-medium">How it works: </span>
          Click <strong>Start</strong> to begin a skill → Take the <strong>📝 Quiz</strong> → Score 60%+ to earn <span className="text-green-400">Completed ✅</span> and <span className="text-yellow-400">+10 XP</span>
        </div>

        <div className="flex gap-6 mb-6 text-sm flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              <span className="text-slate-400">{cfg.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roadmap.skills.map((skill, i) => {
            const cfg = STATUS_CONFIG[skill.status];
            const isUpdating = updating === skill.skillName;
            return (
              <div key={skill.skillName}
                className={`card transition-all duration-200 ${isUpdating ? "opacity-50" : ""} ${
                  skill.status === "completed" ? "border-green-500/20" :
                  skill.status === "inProgress" ? "border-yellow-500/20" : ""}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-slate-500 text-xs font-mono">{String(i + 1).padStart(2, "0")}</span>
                      <h3 className="font-semibold text-sm">{skill.skillName}</h3>
                    </div>
                    <div className="flex items-center gap-2 ml-6">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-slate-500 text-xs">~{skill.estimatedWeeks}w</span>
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${cfg.dot}`} />
                </div>

                <div className="flex gap-2 ml-6">
                  {skill.status === "missing" && (
                    <button onClick={() => handleStart(skill)} disabled={isUpdating}
                      className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg hover:border-white/30 transition-all">
                      ▶ Start
                    </button>
                  )}
                  {skill.status === "completed" ? (
                    <span className="text-xs px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg">
                      ✅ Verified via Quiz
                    </span>
                  ) : (
                    <Link href={`/quiz/${encodeURIComponent(skill.skillName)}`}
                      className="text-xs px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all">
                      📝 Take Quiz to Complete
                    </Link>
                  )}
                </div>

                {skill.resources && skill.resources.length > 0 && (
                  <div className="mt-3 ml-6">
                    {skill.resources.slice(0, 2).map((r, ri) => (
                      <p key={ri} className="text-xs text-indigo-400 truncate">• {r}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
