"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface DayTask { time: string; task: string; type: string; duration: string; }
interface DayPlan { day: number; date: string; skill: string; tasks: DayTask[]; dayGoal: string; }
interface Summary { totalDays: number; totalSkills: number; skillsCovered: string[]; dailyHours: number; goalRole: string; totalHours: number; completionDate: string; }
interface StudyPlanData { plan: DayPlan[]; summary: Summary; }

const TYPE_STYLES: Record<string, string> = {
  Theory: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Practice: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Project: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  Quiz: "bg-green-500/20 text-green-400 border-green-500/30",
  Review: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  Coding: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  Course: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  Video: "bg-red-500/20 text-red-400 border-red-500/30",
  Documentation: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  Study: "bg-teal-500/20 text-teal-400 border-teal-500/30",
};

export default function StudyPlanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<StudyPlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [durationDays, setDurationDays] = useState(30);
  const [dailyHours, setDailyHours] = useState(2);
  const [activeDay, setActiveDay] = useState(1);
  const [generated, setGenerated] = useState(false);

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await api.post<StudyPlanData>("/api/studyplan/generate", { durationDays, dailyHours });
      setData(result);
      setGenerated(true);
      setActiveDay(1);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleDownloadPDF = async () => {
    if (!data) return;
    const { default: jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const margin = 20;
    let y = margin;
    const lineH = 7;
    const pageH = 297 - margin;

    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text("SkillSync AI — Study Plan", margin, y); y += 10;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Goal: ${data.summary.goalRole} | Duration: ${data.summary.totalDays} days | ${data.summary.dailyHours} hrs/day`, margin, y); y += 6;
    pdf.text(`Skills to cover: ${data.summary.skillsCovered.join(", ")}`, margin, y); y += 10;

    data.plan.forEach((day) => {
      if (y > pageH - 30) { pdf.addPage(); y = margin; }
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(`Day ${day.day} — ${day.date} | ${day.skill}`, margin, y); y += 6;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.text(`Goal: ${day.dayGoal}`, margin + 4, y); y += 5;
      pdf.setFont("helvetica", "normal");
      day.tasks.forEach(task => {
        if (y > pageH - 10) { pdf.addPage(); y = margin; }
        const lines = pdf.splitTextToSize(`  ${task.time} [${task.type}] ${task.task} (${task.duration})`, 170);
        lines.forEach((line: string) => { pdf.text(line, margin, y); y += lineH - 2; });
      });
      y += 4;
    });

    pdf.save(`SkillSync_StudyPlan_${data.summary.totalDays}days.pdf`);
  };

  const currentDay = data?.plan.find(d => d.day === activeDay);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex gap-4 items-center">
          {generated && (
            <button onClick={handleDownloadPDF} className="btn-ghost text-sm flex items-center gap-2">
              ⬇️ Download PDF
            </button>
          )}
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">📅 AI Study Plan Generator</h1>
          <p className="text-slate-400 text-sm">Get a personalized day-by-day study schedule based on your roadmap</p>
        </div>

        {/* Config */}
        <div className="card mb-8">
          <h3 className="font-semibold mb-6 text-indigo-400">Configure Your Study Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-300 font-medium">Study Duration</label>
                <span className="text-indigo-400 font-bold">{durationDays} days</span>
              </div>
              <input type="range" min="7" max="90" step="7" value={durationDays}
                onChange={e => setDurationDays(Number(e.target.value))}
                className="w-full accent-indigo-500" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>7 days</span><span>30 days</span><span>60 days</span><span>90 days</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-slate-300 font-medium">Daily Study Hours</label>
                <span className="text-indigo-400 font-bold">{dailyHours} hrs/day</span>
              </div>
              <input type="range" min="1" max="6" step="1" value={dailyHours}
                onChange={e => setDailyHours(Number(e.target.value))}
                className="w-full accent-indigo-500" />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1 hr</span><span>2 hrs</span><span>4 hrs</span><span>6 hrs</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 text-center">
            {[
              { label: "Total Study Hours", value: `${durationDays * dailyHours} hrs` },
              { label: "Duration", value: `${durationDays} days` },
              { label: "Daily Commitment", value: `${dailyHours} hrs` },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3">
                <div className="text-lg font-bold text-indigo-400">{s.value}</div>
                <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {loading
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating your plan...</>
              : "✨ Generate My Study Plan"}
          </button>
        </div>

        {/* Plan Display */}
        {data && data.plan.length > 0 && (
          <div>
            {/* Summary */}
            <div className="card mb-6 bg-indigo-500/5 border-indigo-500/20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: "Total Days", value: data.summary.totalDays },
                  { label: "Skills to Cover", value: data.summary.totalSkills },
                  { label: "Total Hours", value: `${data.summary.totalHours} hrs` },
                  { label: "Finishes On", value: data.summary.completionDate },
                ].map(s => (
                  <div key={s.label}>
                    <div className="text-xl font-bold text-indigo-400">{s.value}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Day Selector */}
              <div className="card lg:col-span-1">
                <h3 className="font-semibold mb-4 text-sm">📆 Select Day</h3>
                <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                  {data.plan.map(day => (
                    <button key={day.day} onClick={() => setActiveDay(day.day)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                        activeDay === day.day
                          ? "bg-indigo-600 text-white"
                          : "hover:bg-white/5 text-slate-300"}`}>
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Day {day.day}</span>
                        <span className={`text-xs ${activeDay === day.day ? "text-indigo-200" : "text-slate-500"}`}>{day.date}</span>
                      </div>
                      <div className={`text-xs mt-0.5 truncate ${activeDay === day.day ? "text-indigo-200" : "text-slate-500"}`}>
                        {day.skill}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Detail */}
              {currentDay && (
                <div className="lg:col-span-2 space-y-4">
                  <div className="card">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold">Day {currentDay.day}</h2>
                        <p className="text-slate-400 text-sm">{currentDay.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-indigo-400 font-medium bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                          {currentDay.skill}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl px-4 py-3 mb-4">
                      <span className="text-xs text-slate-400">🎯 Day Goal: </span>
                      <span className="text-sm font-medium">{currentDay.dayGoal}</span>
                    </div>

                    <div className="space-y-3">
                      {currentDay.tasks.map((task, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-white/5 rounded-xl">
                          <div className="flex-shrink-0 text-center">
                            <div className="text-xs text-slate-500 font-mono whitespace-nowrap">{task.time}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_STYLES[task.type] || TYPE_STYLES.Study}`}>
                                {task.type}
                              </span>
                              <span className="text-xs text-slate-500">{task.duration}</span>
                            </div>
                            <p className="text-sm text-slate-200 leading-relaxed">{task.task}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3">
                    {activeDay > 1 && (
                      <button onClick={() => setActiveDay(d => d - 1)} className="btn-ghost flex-1">← Day {activeDay - 1}</button>
                    )}
                    {activeDay < data.plan.length && (
                      <button onClick={() => setActiveDay(d => d + 1)} className="btn-primary flex-1">Day {activeDay + 1} →</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {data && data.plan.length === 0 && (
          <div className="card text-center py-16">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">All Skills Complete!</h2>
            <p className="text-slate-400 mb-6">You've verified all skills on your roadmap. Time to apply for jobs!</p>
            <Link href="/jobmatch" className="btn-primary">Analyze a Job Description →</Link>
          </div>
        )}
      </div>
    </div>
  );
}
