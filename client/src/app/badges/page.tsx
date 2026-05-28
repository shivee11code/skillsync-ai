"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Roadmap } from "@/types";

interface Badge {
  id: string; icon: string; title: string; desc: string;
  earned: boolean; color: string; category: string;
}

export default function BadgesPage() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);

  useEffect(() => {
    api.get<{ roadmap: Roadmap }>("/api/roadmap").then(d => setRoadmap(d.roadmap)).catch(() => {});
  }, []);

  const xp = user?.xp || 0;
  const streak = user?.streak || 0;
  const completed = roadmap?.skills.filter(s => s.status === "completed").length || 0;
  const total = roadmap?.skills.length || 1;
  const percent = Math.round((completed / total) * 100);

  const BADGES: Badge[] = [
    // Getting started
    { id: "registered",   icon: "🎉", title: "Welcome!",        desc: "Created your account",             earned: true,              color: "from-blue-500 to-cyan-400",      category: "Getting Started" },
    { id: "roadmap",      icon: "🗺️", title: "Road Ahead",      desc: "Generated your first roadmap",     earned: !!roadmap,          color: "from-indigo-500 to-blue-500",    category: "Getting Started" },
    { id: "first_skill",  icon: "🚀", title: "First Step",       desc: "Completed your first skill",       earned: completed >= 1,     color: "from-teal-500 to-cyan-500",     category: "Getting Started" },
    // Progress
    { id: "skill_3",      icon: "📚", title: "Quick Learner",    desc: "Completed 3 skills",               earned: completed >= 3,     color: "from-green-500 to-teal-500",    category: "Progress" },
    { id: "skill_5",      icon: "🧠", title: "Knowledge Base",   desc: "Completed 5 skills",               earned: completed >= 5,     color: "from-emerald-500 to-green-500", category: "Progress" },
    { id: "skill_10",     icon: "💡", title: "Skilled Up",       desc: "Completed 10 skills",              earned: completed >= 10,    color: "from-lime-500 to-green-500",    category: "Progress" },
    { id: "halfway",      icon: "🎯", title: "Halfway There",    desc: "50% of roadmap complete",          earned: percent >= 50,      color: "from-yellow-500 to-amber-500",  category: "Progress" },
    { id: "roadmap_done", icon: "🏆", title: "Road Warrior",     desc: "100% roadmap complete",            earned: percent >= 100,     color: "from-yellow-400 to-orange-500", category: "Progress" },
    // XP
    { id: "xp_50",        icon: "⚡", title: "Spark",            desc: "Earned 50 XP",                    earned: xp >= 50,           color: "from-yellow-400 to-yellow-600", category: "XP" },
    { id: "xp_100",       icon: "💫", title: "XP Hunter",        desc: "Earned 100 XP",                   earned: xp >= 100,          color: "from-amber-400 to-yellow-500",  category: "XP" },
    { id: "xp_200",       icon: "🌟", title: "XP Master",        desc: "Earned 200 XP",                   earned: xp >= 200,          color: "from-orange-400 to-amber-500",  category: "XP" },
    { id: "xp_500",       icon: "💎", title: "XP Champion",      desc: "Earned 500 XP",                   earned: xp >= 500,          color: "from-purple-500 to-indigo-500", category: "XP" },
    // Streak — earned based on login streak count, not daily requirement
    { id: "streak_1",     icon: "🔥", title: "On Fire",          desc: "Used app 2+ days in a row",       earned: streak >= 2,        color: "from-orange-500 to-red-500",    category: "Streak" },
    { id: "streak_3",     icon: "🌊", title: "Flow State",       desc: "3-day learning streak",           earned: streak >= 3,        color: "from-blue-500 to-indigo-500",   category: "Streak" },
    { id: "streak_7",     icon: "💪", title: "Dedicated",        desc: "7-day learning streak",           earned: streak >= 7,        color: "from-red-500 to-orange-500",    category: "Streak" },
    { id: "streak_30",    icon: "👑", title: "Legend",           desc: "30-day learning streak",          earned: streak >= 30,       color: "from-pink-500 to-rose-500",     category: "Streak" },
    // Features
    { id: "used_chat",    icon: "🤖", title: "AI Mentee",        desc: "Used the AI Mentor Chat",         earned: xp > 0 || !!roadmap, color: "from-violet-500 to-purple-500", category: "Features" },
    { id: "resume",       icon: "📄", title: "Resume Ready",     desc: "Visited Resume Builder",          earned: xp >= 0,            color: "from-slate-500 to-gray-500",    category: "Features" },
    { id: "interview",    icon: "💼", title: "Interview Prep",   desc: "Practiced interview questions",   earned: xp > 0,             color: "from-cyan-500 to-blue-500",     category: "Features" },
  ];

  const earnedBadges = BADGES.filter(b => b.earned);
  const lockedBadges = BADGES.filter(b => !b.earned);
  const categories = [...new Set(BADGES.map(b => b.category))];

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
          <Link href="/roadmap"   className="text-slate-400 hover:text-white text-sm">Roadmap</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Badges & Achievements</h1>
          <p className="text-slate-400">
            <span className="text-indigo-400 font-bold">{earnedBadges.length}</span> of {BADGES.length} badges earned
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          {[
            { label: "XP Earned",    value: xp,               icon: "⚡", color: "text-yellow-400" },
            { label: "Day Streak",   value: streak,            icon: "🔥", color: "text-orange-400" },
            { label: "Skills Done",  value: `${completed}/${total}`, icon: "✅", color: "text-green-400" },
            { label: "Badges",       value: earnedBadges.length, icon: "🏅", color: "text-indigo-400" },
          ].map(s => (
            <div key={s.label} className="card text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-slate-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="card mb-10">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Badge Progress</span>
            <span className="text-indigo-400 font-bold">{earnedBadges.length}/{BADGES.length}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700"
              style={{ width: `${(earnedBadges.length / BADGES.length) * 100}%` }} />
          </div>
        </div>

        {/* Badges by category */}
        {categories.map(cat => {
          const catBadges = BADGES.filter(b => b.category === cat);
          return (
            <div key={cat} className="mb-10">
              <h2 className="text-lg font-bold mb-4">{cat}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {catBadges.map(badge => (
                  <div key={badge.id}
                    className={`card text-center transition-all duration-200 ${badge.earned ? "hover:scale-105" : "opacity-40"}`}>
                    <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-2xl mb-3 ${
                      badge.earned ? `bg-gradient-to-br ${badge.color}` : "bg-white/10 grayscale"
                    }`}>
                      {badge.icon}
                    </div>
                    <h3 className="font-bold text-xs mb-1">{badge.title}</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">{badge.desc}</p>
                    <div className={`mt-2 text-xs font-medium ${badge.earned ? "text-green-400" : "text-slate-600"}`}>
                      {badge.earned ? "✓ Earned" : "🔒 Locked"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
