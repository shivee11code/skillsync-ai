"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface AnalyticsData {
  overview: {
    totalSkills: number; completed: number; inProgress: number;
    missing: number; completionRate: number; xp: number;
    streak: number; weeksLeft: number; goalRole: string;
  };
  statusBreakdown: Array<{ name: string; value: number; color: string }>;
  weeklyProgress: Array<{ day: string; xp: number; skills: number }>;
  skillsTimeline: Array<{ name: string; weeks: number; status: string }>;
  xpMilestones: Array<{ milestone: string; target: number; achieved: boolean }>;
}

const StatCard = ({ icon, label, value, sub, color = "text-white" }: any) => (
  <div className="card text-center">
    <div className="text-2xl mb-2">{icon}</div>
    <div className={`text-2xl font-bold ${color}`}>{value}</div>
    <div className="text-slate-400 text-xs mt-1">{label}</div>
    {sub && <div className="text-slate-500 text-xs mt-0.5">{sub}</div>}
  </div>
);

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      api.get<AnalyticsData>("/api/analytics")
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (authLoading || loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-400 mb-4">No analytics data found.</p>
        <Link href="/onboarding" className="btn-primary">Generate Roadmap First</Link>
      </div>
    </div>
  );

  const barColors: Record<string, string> = {
    completed: "#10b981", inProgress: "#f59e0b", missing: "#6b7280"
  };

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex gap-6">
          <Link href="/roadmap" className="text-slate-400 hover:text-white text-sm">Roadmap</Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">📊 Progress Analytics</h1>
          <p className="text-slate-400 text-sm">Tracking your journey to <span className="text-indigo-400">{data.overview.goalRole}</span></p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon="⚡" label="Total XP" value={data.overview.xp} color="text-indigo-400" />
          <StatCard icon="🔥" label="Day Streak" value={data.overview.streak} color="text-yellow-400" />
          <StatCard icon="✅" label="Completion Rate" value={`${data.overview.completionRate}%`} color="text-green-400" />
          <StatCard icon="📅" label="Weeks to Finish" value={data.overview.weeksLeft} sub="at current pace" color="text-purple-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard icon="🎯" label="Skills Completed" value={`${data.overview.completed}/${data.overview.totalSkills}`} color="text-green-400" />
          <StatCard icon="⏳" label="In Progress" value={data.overview.inProgress} color="text-yellow-400" />
          <StatCard icon="📚" label="Not Started" value={data.overview.missing} color="text-slate-400" />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Weekly XP Area Chart */}
          <div className="card">
            <h3 className="font-semibold mb-4">XP Progress (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.weeklyProgress}>
                <defs>
                  <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a1a24", border: "1px solid #ffffff20", borderRadius: "12px", color: "#e2e8f0" }} />
                <Area type="monotone" dataKey="xp" stroke="#6366f1" fill="url(#xpGrad)" strokeWidth={2} dot={{ fill: "#6366f1", r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Skill Status Pie Chart */}
          <div className="card">
            <h3 className="font-semibold mb-4">Skill Status Breakdown</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data.statusBreakdown.filter(d => d.value > 0)} cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {data.statusBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#1a1a24", border: "1px solid #ffffff20", borderRadius: "12px", color: "#e2e8f0" }} />
                <Legend formatter={(value) => <span style={{ color: "#94a3b8", fontSize: "12px" }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

          {/* Skills Completed per Day Bar */}
          <div className="card">
            <h3 className="font-semibold mb-4">Skills Completed Over Time</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="day" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1a1a24", border: "1px solid #ffffff20", borderRadius: "12px", color: "#e2e8f0" }} />
                <Bar dataKey="skills" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Skills Timeline */}
          <div className="card">
            <h3 className="font-semibold mb-4">Estimated Weeks per Skill</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.skillsTimeline} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fill: "#94a3b8", fontSize: 10 }} width={90} />
                <Tooltip contentStyle={{ background: "#1a1a24", border: "1px solid #ffffff20", borderRadius: "12px", color: "#e2e8f0" }} />
                <Bar dataKey="weeks" radius={[0, 6, 6, 0]}>
                  {data.skillsTimeline.map((entry, i) => (
                    <Cell key={i} fill={
                      entry.status === "completed" ? "#10b981" :
                      entry.status === "inProgress" ? "#f59e0b" : "#6366f1"
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* XP Milestones */}
        <div className="card">
          <h3 className="font-semibold mb-6">XP Milestones</h3>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-white/10 z-0" />
            <div className="absolute top-4 left-0 h-0.5 bg-indigo-500 z-0 transition-all duration-700"
              style={{ width: `${Math.min((data.overview.xp / 200) * 100, 100)}%` }} />
            {data.xpMilestones.map((m, i) => (
              <div key={i} className="flex flex-col items-center z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all ${
                  m.achieved ? "bg-indigo-500 border-indigo-500 text-white" : "bg-[#1a1a24] border-white/20 text-slate-400"}`}>
                  {m.achieved ? "✓" : "○"}
                </div>
                <div className="text-xs text-slate-400 mt-2 whitespace-nowrap">{m.milestone}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center text-sm text-slate-400">
            Current XP: <span className="text-indigo-400 font-bold">⚡ {data.overview.xp}</span>
            {data.overview.xp < 200 && <span> → Next milestone: <span className="text-yellow-400">{data.xpMilestones.find(m => !m.achieved)?.milestone}</span></span>}
          </div>
        </div>
      </div>
    </div>
  );
}
