"use client";
import { useState } from "react";
import Link from "next/link";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  public_repos: number;
  followers: number;
  following: number;
  location: string;
  blog: string;
  created_at: string;
}

interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  updated_at: string;
}

const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f7df1e", TypeScript: "#3178c6", Python: "#3572A5",
  Java: "#b07219", "C++": "#f34b7d", Go: "#00ADD8", Rust: "#dea584",
  Ruby: "#701516", Swift: "#F05138", Kotlin: "#A97BFF", CSS: "#563d7c",
  HTML: "#e34c26", "C#": "#178600", PHP: "#4F5D95",
};

export default function GitHubPage() {
  const [username, setUsername] = useState("");
  const [userData, setUserData] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    const clean = username.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "");
    if (!clean) return;
    setLoading(true);
    setError("");
    setUserData(null);
    setRepos([]);
    try {
      const [userRes, repoRes] = await Promise.all([
        fetch(`https://api.github.com/users/${clean}`),
        fetch(`https://api.github.com/users/${clean}/repos?sort=updated&per_page=10`),
      ]);
      if (!userRes.ok) throw new Error("GitHub user not found. Check the username and try again.");
      const user = await userRes.json();
      const repoData = await repoRes.json();
      setUserData(user);
      setRepos(Array.isArray(repoData) ? repoData : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch GitHub data");
    } finally {
      setLoading(false);
    }
  };

  const langCount: Record<string, number> = {};
  repos.forEach(r => { if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1; });
  const topLangs = Object.entries(langCount).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const totalStars = repos.reduce((acc, r) => acc + r.stargazers_count, 0);
  const memberYears = userData ? new Date().getFullYear() - new Date(userData.created_at).getFullYear() : 0;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
          <Link href="/roadmap" className="text-slate-400 hover:text-white text-sm">Roadmap</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">GitHub Profile Analyzer</h1>
          <p className="text-slate-400">Analyze any GitHub profile — stats, languages, and repositories</p>
        </div>

        <div className="card mb-8">
          <label className="block text-sm text-slate-400 mb-2">GitHub Username</label>
          <div className="flex gap-3">
            <div className="flex flex-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
              <span className="flex items-center px-4 text-slate-500 text-sm bg-white/5 border-r border-white/10 select-none whitespace-nowrap">
                github.com/
              </span>
              <input
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-slate-500 outline-none text-sm"
                placeholder="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && analyze()}
              />
            </div>
            <button onClick={analyze} disabled={loading || !username.trim()}
              className="btn-primary px-6 flex-shrink-0">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </span>
              ) : "Analyze"}
            </button>
          </div>
          {error && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {userData && (
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-start gap-5">
                <img src={userData.avatar_url} alt={userData.login}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white/10" />
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{userData.name || userData.login}</h2>
                  <a href={`https://github.com/${userData.login}`} target="_blank" rel="noopener noreferrer"
                    className="text-indigo-400 text-sm hover:text-indigo-300">
                    @{userData.login} ↗
                  </a>
                  {userData.bio && <p className="text-slate-400 text-sm mt-2">{userData.bio}</p>}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-400">
                    {userData.location && <span>📍 {userData.location}</span>}
                    {userData.blog && <span>🌐 {userData.blog}</span>}
                    <span>📅 GitHub member for {memberYears} year{memberYears !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { label: "Repositories", value: userData.public_repos, icon: "🗂️" },
                  { label: "Followers",    value: userData.followers,    icon: "👥" },
                  { label: "Following",    value: userData.following,    icon: "➕" },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-slate-400 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {topLangs.length > 0 && (
              <div className="card">
                <h3 className="font-bold mb-4">Language Breakdown</h3>
                <div className="space-y-3 mb-6">
                  {topLangs.map(([lang, count]) => (
                    <div key={lang} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: LANG_COLORS[lang] || "#6366f1" }} />
                      <span className="text-sm w-28 text-slate-300">{lang}</span>
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-700"
                          style={{ width: `${(count / repos.length) * 100}%`, background: LANG_COLORS[lang] || "#6366f1" }} />
                      </div>
                      <span className="text-slate-400 text-xs w-16 text-right">{count} repo{count > 1 ? "s" : ""}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">⭐ {totalStars}</div>
                    <div className="text-slate-400 text-xs mt-1">Total Stars Earned</div>
                  </div>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-indigo-400">📦 {repos.length}</div>
                    <div className="text-slate-400 text-xs mt-1">Recent Repos Analyzed</div>
                  </div>
                </div>
              </div>
            )}

            {repos.length > 0 && (
              <div className="card">
                <h3 className="font-bold mb-4">Recent Repositories</h3>
                <div className="space-y-2">
                  {repos.map(repo => (
                    <a key={repo.name} href={repo.html_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-start justify-between p-4 bg-white/3 rounded-xl hover:bg-white/8 transition-all duration-200 border border-white/5 hover:border-white/10 group">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-indigo-400 group-hover:text-indigo-300 truncate">{repo.name}</h4>
                        {repo.description && <p className="text-slate-500 text-xs mt-0.5 truncate">{repo.description}</p>}
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full"
                                style={{ background: LANG_COLORS[repo.language] || "#6366f1" }} />
                              {repo.language}
                            </span>
                          )}
                          <span>⭐ {repo.stargazers_count}</span>
                          <span>🍴 {repo.forks_count}</span>
                        </div>
                      </div>
                      <span className="text-slate-500 group-hover:text-white ml-3 flex-shrink-0 text-sm">↗</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {!userData && !loading && (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🐙</div>
            <h2 className="text-xl font-bold mb-2">Analyze any GitHub profile</h2>
            <p className="text-slate-400 mb-6">Enter a GitHub username above to see stats, languages, and repositories</p>
            <div className="flex gap-3 justify-center flex-wrap">
              {["torvalds", "gaearon", "sindresorhus"].map(u => (
                <button key={u} onClick={() => { setUsername(u); }}
                  className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
                  Try: {u}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
