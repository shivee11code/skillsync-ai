"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

type Theme = "light" | "dark" | "midnight";

const THEMES: { id: Theme; label: string; icon: string; bg: string; text: string; cardBg: string; border: string }[] = [
  {
    id: "light",
    label: "Light",
    icon: "☀️",
    bg: "#f8fafc",
    text: "#0f172a",
    cardBg: "#ffffff",
    border: "#e2e8f0",
  },
  {
    id: "dark",
    label: "Dark",
    icon: "🌙",
    bg: "#0f0f13",
    text: "#e2e8f0",
    cardBg: "#1a1a24",
    border: "rgba(255,255,255,0.1)",
  },
  {
    id: "midnight",
    label: "Midnight",
    icon: "🌌",
    bg: "#0d1117",
    text: "#e2e8f0",
    cardBg: "#161b22",
    border: "rgba(255,255,255,0.08)",
  },
];

export default function SettingsPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
    const saved = localStorage.getItem("skillsync_theme") as Theme;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    }
  }, [user, authLoading, router]);

  const applyTheme = (t: Theme) => {
    const found = THEMES.find((x) => x.id === t);
    if (!found) return;
    document.body.style.background = found.bg;
    document.body.style.color = found.text;
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("skillsync_theme", t);
    setTheme(t);
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "profile",    label: "Profile",    icon: "👤" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "account",    label: "Account",    icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex items-center gap-6">
          <Link href="/roadmap"   className="text-slate-400 hover:text-white text-sm">Roadmap</Link>
          <Link href="/chat"      className="text-slate-400 hover:text-white text-sm">AI Chat</Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-52 flex-shrink-0">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-3 ${
                    activeTab === tab.id
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}>
                  <span>{tab.icon}</span>{tab.label}
                </button>
              ))}
              <button onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 flex items-center gap-3 mt-6">
                <span>🚪</span> Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">

            {/* ── PROFILE ── */}
            {activeTab === "profile" && (
              <div className="card">
                <h2 className="text-xl font-bold mb-6">Profile</h2>
                <div className="flex items-center gap-5 mb-8 p-5 bg-white/3 rounded-2xl border border-white/5">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{user.name}</h3>
                    <p className="text-slate-400 text-sm mt-0.5">{user.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20">
                        🎯 {user.goalRole || "No role set"}
                      </span>
                      <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2.5 py-1 rounded-full border border-yellow-500/20">
                        ⚡ {user.xp} XP
                      </span>
                      <span className="text-xs bg-orange-500/10 text-orange-400 px-2.5 py-1 rounded-full border border-orange-500/20">
                        🔥 {user.streak} day streak
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Total XP",     value: user.xp,                          icon: "⚡", color: "text-yellow-400" },
                    { label: "Day Streak",   value: user.streak,                      icon: "🔥", color: "text-orange-400" },
                    { label: "Skills Added", value: user.currentSkills?.length || 0,  icon: "🧠", color: "text-indigo-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                      <div className="text-2xl mb-1">{s.icon}</div>
                      <div className={`font-bold text-2xl ${s.color}`}>{s.value}</div>
                      <div className="text-slate-400 text-xs mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Link href="/onboarding" className="btn-primary w-full text-center block py-3 text-sm">
                  🔄 Change Role & Regenerate Roadmap
                </Link>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {activeTab === "appearance" && (
              <div className="card">
                <h2 className="text-xl font-bold mb-2">Appearance</h2>
                <p className="text-slate-400 text-sm mb-8">Choose your preferred theme</p>

                <div className="grid grid-cols-3 gap-5">
                  {THEMES.map((t) => (
                    <button key={t.id} onClick={() => applyTheme(t.id)}
                      className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 text-left ${
                        theme === t.id
                          ? "border-indigo-500 scale-105"
                          : "border-white/10 hover:border-white/25"
                      }`}>
                      {/* Preview box */}
                      <div className="h-24 p-3 flex flex-col gap-2" style={{ background: t.bg }}>
                        <div className="h-2 rounded-full w-3/4" style={{ background: t.border }} />
                        <div className="h-8 rounded-lg" style={{ background: t.cardBg, border: `1px solid ${t.border}` }} />
                        <div className="h-2 rounded-full w-1/2" style={{ background: t.border }} />
                      </div>
                      {/* Label */}
                      <div className="p-3 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{t.icon}</span>
                          <span className="text-sm font-medium">{t.label}</span>
                        </div>
                        {theme === t.id && (
                          <span className="text-xs text-indigo-400 font-medium">✓ Active</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-6 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                  <p className="text-sm text-slate-400">
                    <span className="text-indigo-400 font-medium">Note:</span> Theme is saved to your browser and applied automatically on every visit.
                  </p>
                </div>
              </div>
            )}

            {/* ── ACCOUNT ── */}
            {activeTab === "account" && (
              <div className="space-y-4">
                <div className="card">
                  <h2 className="text-xl font-bold mb-6">Account Details</h2>
                  <div className="space-y-1">
                    {[
                      { label: "Full Name",        value: user.name },
                      { label: "Email Address",    value: user.email },
                      { label: "Goal Role",        value: user.goalRole || "Not set", highlight: true },
                      { label: "Skills in Profile",value: `${user.currentSkills?.length || 0} skills` },
                      { label: "Total XP Earned",  value: `${user.xp} XP` },
                      { label: "Login Streak",     value: `${user.streak} days` },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center py-3.5 border-b border-white/5 last:border-0">
                        <span className="text-slate-400 text-sm">{item.label}</span>
                        <span className={`text-sm font-medium ${item.highlight ? "text-indigo-400" : ""}`}>
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card border-red-500/20">
                  <h2 className="text-lg font-bold mb-1 text-red-400">Danger Zone</h2>
                  <p className="text-slate-400 text-sm mb-4">Signing out will clear your session from this device.</p>
                  <button onClick={handleLogout}
                    className="w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium">
                    🚪 Sign Out
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
