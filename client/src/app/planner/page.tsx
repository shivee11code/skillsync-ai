"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { Roadmap } from "@/types";

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const HOURS = ["1 hour","2 hours","3 hours","4 hours"];

export default function PlannerPage() {
  const { user } = useAuth();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [hoursPerDay, setHoursPerDay] = useState("2 hours");
  const [plan, setPlan] = useState<{ day: string; tasks: string[]; done: boolean[] }[]>([]);
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    api.get<{ roadmap: Roadmap }>("/api/roadmap")
      .then(d => setRoadmap(d.roadmap))
      .catch(() => {});
  }, []);

  const generatePlan = () => {
    if (!roadmap) return;
    const missing = roadmap.skills.filter(s => s.status !== "completed").map(s => s.skillName);
    const inProgress = roadmap.skills.filter(s => s.status === "inProgress").map(s => s.skillName);
    const hours = parseInt(hoursPerDay);

    const weekPlan = DAYS.map((day, i) => {
      const tasks: string[] = [];
      if (i < 5) {
        // Weekdays — focused learning
        const skill = inProgress[0] || missing[i % missing.length] || "Review previous topics";
        tasks.push(`📚 Study: ${skill} (${hours}h)`);
        if (hours >= 2) tasks.push(`✍️ Take notes and practice examples`);
        if (hours >= 3) tasks.push(`🔨 Build a small exercise or mini project`);
      } else if (i === 5) {
        // Saturday — project work
        tasks.push(`🚀 Work on your roadmap project`);
        tasks.push(`🔁 Review the week's topics`);
        tasks.push(`📝 Update your GitHub with progress`);
      } else {
        // Sunday — rest and review
        tasks.push(`📖 Light reading: blogs or docs`);
        tasks.push(`🎯 Plan next week's learning goals`);
        tasks.push(`😴 Rest — consistency matters more than intensity`);
      }
      return { day, tasks, done: new Array(tasks.length).fill(false) };
    });

    setPlan(weekPlan);
    setGenerated(true);
  };

  const toggleTask = (dayIdx: number, taskIdx: number) => {
    const updated = [...plan];
    updated[dayIdx].done[taskIdx] = !updated[dayIdx].done[taskIdx];
    setPlan(updated);
  };

  const totalTasks = plan.reduce((acc, d) => acc + d.tasks.length, 0);
  const doneTasks = plan.reduce((acc, d) => acc + d.done.filter(Boolean).length, 0);

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
          <Link href="/roadmap" className="text-slate-400 hover:text-white text-sm">Roadmap</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Weekly Study Planner</h1>
          <p className="text-slate-400">Auto-generated plan based on your <span className="text-indigo-400">{user?.goalRole}</span> roadmap</p>
        </div>

        {/* Config */}
        <div className="card mb-8">
          <h2 className="font-semibold mb-4">Configure Your Plan</h2>
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Hours per day</label>
              <div className="flex gap-2">
                {HOURS.map(h => (
                  <button key={h} onClick={() => setHoursPerDay(h)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      hoursPerDay === h ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                    }`}>{h}</button>
                ))}
              </div>
            </div>
            <div className="mt-4 md:mt-6">
              <button onClick={generatePlan} className="btn-primary px-8 py-2.5">
                {generated ? "🔄 Regenerate Plan" : "✨ Generate My Week"}
              </button>
            </div>
          </div>
        </div>

        {/* Progress */}
        {generated && (
          <div className="card mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Weekly Progress</span>
              <span className="text-indigo-400 font-bold">{doneTasks}/{totalTasks} tasks</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }} />
            </div>
          </div>
        )}

        {/* Plan grid */}
        {generated && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plan.map((day, dayIdx) => (
              <div key={day.day} className={`card ${dayIdx >= 5 ? "border-purple-500/20 bg-purple-500/5" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold">{day.day}</h3>
                  <span className="text-xs text-slate-500">
                    {day.done.filter(Boolean).length}/{day.tasks.length} done
                  </span>
                </div>
                <div className="space-y-2">
                  {day.tasks.map((task, taskIdx) => (
                    <button key={taskIdx} onClick={() => toggleTask(dayIdx, taskIdx)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl transition-all duration-200 flex items-start gap-2 ${
                        day.done[taskIdx] ? "bg-green-500/10 text-green-400 line-through opacity-70" : "bg-white/5 text-slate-300 hover:bg-white/10"
                      }`}>
                      <span className="mt-0.5 flex-shrink-0">{day.done[taskIdx] ? "✅" : "⬜"}</span>
                      {task}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {!generated && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">📅</div>
            <h2 className="text-xl font-bold mb-2">No plan generated yet</h2>
            <p className="text-slate-400 mb-6">Select your daily study hours and generate your personalized weekly plan</p>
            <button onClick={generatePlan} className="btn-primary px-8 py-3">✨ Generate My Week</button>
          </div>
        )}
      </div>
    </div>
  );
}
