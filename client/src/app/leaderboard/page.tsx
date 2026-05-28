"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  goalRole: string;
  xp: number;
  streak: number;
  skillsCompleted: number;
  totalSkills: number;
  percent: number;
  githubUsername: string;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUserRank: number | null;
  totalUsers: number;
}

const RANK_STYLES: Record<number, { bg: string; text: string; icon: string }> = {
  1: { bg: "bg-yellow-500/10 border-yellow-500/30", text: "text-yellow-400", icon: "🥇" },
  2: { bg: "bg-slate-400/10 border-slate-400/30", text: "text-slate-300", icon: "🥈" },
  3: { bg: "bg-orange-500/10 border-orange-500/30", text: "text-orange-400", icon: "🥉" },
};

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"xp" | "streak" | "skills">("xp");

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.get<LeaderboardData>("/api/leaderboard")
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const sorted = data?.leaderboard ? [...data.leaderboard].sort((a, b) => {
    if (filter === "streak") return b.streak - a.streak;
    if (filter === "skills") return b.skillsCompleted - a.skillsCompleted;
    return b.xp - a.xp;
  }).map((entry, i) => ({ ...entry, displayRank: i + 1 })) : [];

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex gap-6">
          <Link href="/roadmap" className="text-slate-400 hover:text-white text-sm">Roadmap</Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">🏆 Leaderboard</h1>
          {data?.currentUserRank && (
            <div className="text-sm bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-4 py-1.5 rounded-full">
              Your rank: #{data.currentUserRank}
            </div>
          )}
        </div>
        <p className="text-slate-400 text-sm mb-8">Top {data?.totalUsers || 0} learners on SkillSync AI</p>

        {/* Top 3 podium */}
        {sorted.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[sorted[1], sorted[0], sorted[2]].map((entry, podiumIdx) => {
              const actualRank = podiumIdx === 0 ? 2 : podiumIdx === 1 ? 1 : 3;
              const style = RANK_STYLES[actualRank];
              return (
                <div key={entry.id}
                  className={`card text-center border ${style.bg} ${entry.isCurrentUser ? "ring-2 ring-indigo-500" : ""} ${podiumIdx === 1 ? "scale-105" : ""}`}>
                  <div className="text-3xl mb-2">{style.icon}</div>
                  <div className={`text-lg font-bold mb-1 ${style.text}`}>#{actualRank}</div>
                  <div className="font-semibold text-sm truncate">{entry.name.split(" ")[0]}</div>
                  <div className="text-xs text-slate-500 truncate mb-2">{entry.goalRole}</div>
                  <div className="text-indigo-400 font-bold">⚡ {entry.xp} XP</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["xp","streak","skills"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                filter === f ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"}`}>
              {f === "xp" ? "⚡ XP" : f === "streak" ? "🔥 Streak" : "✅ Skills"}
            </button>
          ))}
        </div>

        {/* Full table */}
        <div className="space-y-2">
          {sorted.map((entry) => {
            const rankStyle = RANK_STYLES[entry.displayRank];
            return (
              <div key={entry.id}
                className={`card flex items-center gap-4 py-4 transition-all duration-200 ${
                  entry.isCurrentUser ? "border-indigo-500/50 bg-indigo-500/5" : "hover:border-white/20"
                } ${rankStyle ? `border ${rankStyle.bg}` : ""}`}>

                {/* Rank */}
                <div className={`text-lg font-bold w-8 text-center flex-shrink-0 ${rankStyle ? rankStyle.text : "text-slate-400"}`}>
                  {rankStyle ? rankStyle.icon : `#${entry.displayRank}`}
                </div>

                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  entry.isCurrentUser ? "bg-indigo-600" : "bg-white/10"}`}>
                  {entry.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{entry.name}</span>
                    {entry.isCurrentUser && (
                      <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full flex-shrink-0">You</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{entry.goalRole}</div>
                  {/* Progress bar */}
                  <div className="mt-1.5 w-full bg-white/10 rounded-full h-1">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${entry.percent}%` }} />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 flex-shrink-0 text-right">
                  <div className="hidden sm:block">
                    <div className="text-xs text-slate-500">Skills</div>
                    <div className="text-sm font-semibold">{entry.skillsCompleted}/{entry.totalSkills}</div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-slate-500">Streak</div>
                    <div className="text-sm font-semibold">🔥 {entry.streak}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">XP</div>
                    <div className={`text-sm font-bold ${rankStyle ? rankStyle.text : "text-indigo-400"}`}>⚡ {entry.xp}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {sorted.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">👀</div>
            <p className="text-slate-400">No users yet. Be the first on the leaderboard!</p>
          </div>
        )}

        <div className="mt-8 card bg-indigo-500/5 border-indigo-500/20 text-center">
          <p className="text-sm text-slate-400">
            Earn XP by completing quizzes on your roadmap. Each verified skill = <span className="text-yellow-400 font-semibold">+10 XP</span> 🚀
          </p>
        </div>
      </div>
    </div>
  );
}
