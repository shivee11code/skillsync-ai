"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { GOAL_ROLES, ROLE_META, SKILL_OPTIONS } from "@/types";

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [goalRole, setGoalRole] = useState("");
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleSkill = (skill: string) => {
    setCurrentSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post("/api/roadmap/generate", { goalRole, currentSkills });
      await refreshUser();
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate roadmap");
    } finally {
      setLoading(false);
    }
  };

  const meta = ROLE_META[goalRole];

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Progress */}
        <div className="flex gap-2 mb-10">
          {[1, 2].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-indigo-500" : "bg-white/10"}`} />
          ))}
        </div>

        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold mb-1">Hi {user?.name?.split(" ")[0]} 👋</h1>
            <p className="text-slate-400 mb-8">Choose your target career role to get started</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {GOAL_ROLES.map((role) => {
                const m = ROLE_META[role];
                const isSelected = goalRole === role;
                return (
                  <button key={role} onClick={() => setGoalRole(role)}
                    className={`card text-left p-5 transition-all duration-200 cursor-pointer group ${
                      isSelected ? "border-indigo-500 bg-indigo-500/10" : "hover:border-white/20"
                    }`}>
                    <div className={`text-2xl mb-3 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${m.color} bg-opacity-20`}>
                      {m.icon}
                    </div>
                    <div className="font-semibold text-sm mb-1">{role}</div>
                    <div className="text-slate-400 text-xs leading-relaxed">{m.desc}</div>
                    {isSelected && (
                      <div className="mt-3 text-indigo-400 text-xs font-medium">✓ Selected</div>
                    )}
                  </button>
                );
              })}
            </div>
            <button className="btn-primary mt-8 w-full py-3 text-base" disabled={!goalRole} onClick={() => setStep(2)}>
              Continue with {goalRole || "..."} →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{meta?.icon}</span>
              <h1 className="text-3xl font-bold">{goalRole}</h1>
            </div>
            <p className="text-slate-400 mb-8">Select all skills you are already comfortable with</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {(SKILL_OPTIONS[goalRole] || []).map((skill) => (
                <button key={skill} onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                    currentSkills.includes(skill)
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                      : "bg-white/5 border-white/10 text-slate-300 hover:border-white/30"
                  }`}>
                  {currentSkills.includes(skill) ? "✓ " : ""}{skill}
                </button>
              ))}
            </div>
            <div className="card bg-white/2 mb-6 py-3">
              <p className="text-slate-400 text-sm text-center">
                {currentSkills.length === 0
                  ? "🌱 Complete beginner? No worries — select nothing and we will build from scratch!"
                  : `✅ ${currentSkills.length} skill${currentSkills.length > 1 ? "s" : ""} selected — AI will fill the gaps`}
              </p>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm mb-4">{error}</div>}
            <div className="flex gap-4">
              <button className="btn-ghost px-6" onClick={() => setStep(1)}>← Back</button>
              <button className="btn-primary flex-1 py-3 text-base" onClick={handleGenerate} disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI is generating your roadmap...
                  </span>
                ) : "Generate My Roadmap 🚀"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
