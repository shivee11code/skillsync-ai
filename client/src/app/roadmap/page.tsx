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

interface QuizQuestion { q: string; options: string[]; }

export default function RoadmapPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "missing" | "inProgress" | "completed">("all");

  // Quiz modal state
  const [quizSkill, setQuizSkill] = useState<SkillNode | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizResult, setQuizResult] = useState<{ score: number; passed: boolean; message: string } | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

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
    // If going to completed, show quiz first
    if (skill.status === "inProgress") {
      setQuizLoading(true);
      setQuizSkill(skill);
      setQuizAnswers([]);
      setQuizResult(null);
      try {
        const data = await api.get<{ questions: QuizQuestion[] }>(`/api/quiz/${encodeURIComponent(skill.skillName)}`);
        setQuizQuestions(data.questions);
      } catch { setQuizQuestions([]); }
      setQuizLoading(false);
      return;
    }
    // Otherwise toggle normally
    setUpdating(skill.skillName);
    try {
      const newStatus = skill.status === "missing" ? "inProgress" : "missing";
      const data = await api.put<{ roadmap: Roadmap }>(
        `/api/roadmap/skill/${encodeURIComponent(skill.skillName)}`,
        { status: newStatus }
      );
      setRoadmap(data.roadmap);
    } catch (err) { console.error(err); }
    finally { setUpdating(null); }
  };

  const handleQuizSubmit = async () => {
    if (!quizSkill || quizAnswers.length !== quizQuestions.length) return;
    setQuizLoading(true);
    try {
      const result = await api.post<{ score: number; passed: boolean; message: string }>(
        `/api/quiz/${encodeURIComponent(quizSkill.skillName)}/submit`,
        { answers: quizAnswers }
      );
      setQuizResult(result);
      if (result.passed) {
        const data = await api.put<{ roadmap: Roadmap }>(
          `/api/roadmap/skill/${encodeURIComponent(quizSkill.skillName)}`,
          { status: "completed" }
        );
        setRoadmap(data.roadmap);
      }
    } catch (err) { console.error(err); }
    finally { setQuizLoading(false); }
  };

  const closeQuiz = () => {
    setQuizSkill(null);
    setQuizQuestions([]);
    setQuizAnswers([]);
    setQuizResult(null);
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
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">{roadmap.goalRole}</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {completed} of {roadmap.skills.length} skills completed
            </p>
          </div>
          <div className="text-3xl font-bold gradient-text">{percent}%</div>
        </div>

        <div className="progress-bar h-2 mb-8">
          <div className="progress-fill h-2" style={{ width: `${percent}%` }} />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((skill) => {
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
                      {skill.status === "inProgress" && (
                        <span className="text-xs text-indigo-400">🎯 Click to take quiz</span>
                      )}
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
            <span className="text-indigo-400 font-medium">Tip:</span> Not Started → In Progress → Pass Quiz → Completed ✅ Each completion earns <span className="text-yellow-400 font-medium">+10 XP</span>
          </p>
        </div>
      </div>

      {/* Quiz Modal */}
      {quizSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}>
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ background: "var(--card)", border: "1px solid rgba(99,102,241,0.3)" }}>

            {quizLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!quizLoading && !quizResult && quizQuestions.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold">🎯 Skill Verification Quiz</h2>
                    <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                      {quizSkill.skillName} — Score 60% or more to mark as completed
                    </p>
                  </div>
                  <button onClick={closeQuiz} className="text-xl" style={{ color: "var(--text-muted)" }}>✕</button>
                </div>

                <div className="space-y-6">
                  {quizQuestions.map((q, qi) => (
                    <div key={qi} className="p-4 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
                      <p className="text-sm font-medium mb-3">
                        <span className="text-indigo-400 mr-2">Q{qi + 1}.</span>{q.q}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {q.options.map((opt, oi) => (
                          <button key={oi} onClick={() => {
                            const a = [...quizAnswers];
                            a[qi] = oi;
                            setQuizAnswers(a);
                          }}
                            className="text-left px-4 py-2.5 rounded-lg text-sm transition-all"
                            style={{
                              background: quizAnswers[qi] === oi ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
                              border: quizAnswers[qi] === oi ? "1px solid rgba(99,102,241,0.5)" : "1px solid var(--border)",
                              color: quizAnswers[qi] === oi ? "#a5b4fc" : "var(--text-secondary)"
                            }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={handleQuizSubmit}
                  disabled={quizAnswers.length !== quizQuestions.length || quizAnswers.some(a => a === undefined)}
                  className="btn-primary w-full mt-6"
                  style={{ opacity: quizAnswers.length !== quizQuestions.length ? 0.5 : 1 }}>
                  Submit Quiz
                </button>
              </>
            )}

            {!quizLoading && quizResult && (
              <div className="text-center py-6">
                <div className="text-5xl mb-4">{quizResult.passed ? "🎉" : "😔"}</div>
                <h2 className="text-xl font-bold mb-2">
                  {quizResult.passed ? "Quiz Passed!" : "Quiz Failed"}
                </h2>
                <p className="text-3xl font-bold mb-2" style={{ color: quizResult.passed ? "#22c55e" : "#ef4444" }}>
                  {quizResult.score}%
                </p>
                <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>{quizResult.message}</p>
                {quizResult.passed ? (
                  <button onClick={closeQuiz} className="btn-primary">Continue Learning 🚀</button>
                ) : (
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => { setQuizResult(null); setQuizAnswers([]); }} className="btn-primary">Try Again</button>
                    <button onClick={closeQuiz} className="px-4 py-2 rounded-xl text-sm" style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}>Study More</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
