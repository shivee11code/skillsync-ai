"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

interface MatchResult {
  detectedRole: string;
  matchPercent: number;
  readinessLevel: string;
  advice: string;
  matchedSkills: string[];
  missingSkills: string[];
  bonusSkills: string[];
  prioritySkills: string[];
  totalJDSkills: number;
  stats: { matched: number; missing: number; bonus: number };
}

const SAMPLE_JD = `We are looking for a Full Stack Software Engineer to join our team.

Requirements:
- 2+ years of experience with React and Node.js
- Strong knowledge of JavaScript and TypeScript
- Experience with MongoDB or PostgreSQL databases
- Familiarity with REST APIs and GraphQL
- Knowledge of Git and version control
- Experience with Docker and CI/CD pipelines
- Understanding of System Design principles
- Good communication and teamwork skills

Nice to have:
- Experience with Next.js
- Knowledge of AWS or GCP
- Redis caching experience`;

export default function JobMatchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  const handleAnalyze = async () => {
    if (jd.trim().length < 50) { setError("Please paste a complete job description"); return; }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.post<MatchResult>("/api/jobmatch/analyze", { jobDescription: jd });
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (pct: number) =>
    pct >= 80 ? "text-green-400" : pct >= 60 ? "text-yellow-400" : pct >= 40 ? "text-orange-400" : "text-red-400";

  const getBarColor = (pct: number) =>
    pct >= 80 ? "from-green-500 to-emerald-400" : pct >= 60 ? "from-yellow-500 to-amber-400" :
    pct >= 40 ? "from-orange-500 to-amber-400" : "from-red-500 to-rose-400";

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex gap-6">
          <Link href="/roadmap" className="text-slate-400 hover:text-white text-sm">Roadmap</Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">🎯 Job Match Analyzer</h1>
          <p className="text-slate-400 text-sm">Paste any job description to see how well your skills match</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="space-y-4">
            <div className="card">
              <div className="flex justify-between items-center mb-3">
                <label className="font-semibold text-sm">Paste Job Description</label>
                <button onClick={() => setJd(SAMPLE_JD)}
                  className="text-xs text-indigo-400 hover:text-indigo-300">Load Sample JD</button>
              </div>
              <textarea
                className="input-field resize-none text-sm leading-relaxed"
                style={{ minHeight: "320px" }}
                placeholder="Paste the full job description from LinkedIn, Naukri, or any job portal here...

We are looking for a Software Engineer with experience in..."
                value={jd}
                onChange={e => setJd(e.target.value)}
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-500">{jd.length} characters</span>
                <span className="text-xs text-slate-500">{jd.length >= 50 ? "✅ Ready to analyze" : `Need ${50 - jd.length} more chars`}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">{error}</div>
            )}

            <button onClick={handleAnalyze} disabled={loading || jd.trim().length < 50}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</>
              ) : "🔍 Analyze Match"}
            </button>

            <div className="card bg-indigo-500/5 border-indigo-500/20 text-sm text-slate-400">
              <p className="text-indigo-400 font-medium mb-1">How it works</p>
              <p>Our AI scans the JD for 50+ technical skills and compares them against your verified skills on SkillSync. You get a match percentage, skill gap analysis, and priority actions.</p>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {!result && !loading && (
              <div className="card text-center py-20">
                <div className="text-5xl mb-4">📋</div>
                <h3 className="font-semibold text-lg mb-2">Paste a Job Description</h3>
                <p className="text-slate-400 text-sm">Your match analysis will appear here</p>
              </div>
            )}

            {loading && (
              <div className="card text-center py-20">
                <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400">Analyzing job requirements...</p>
              </div>
            )}

            {result && (
              <>
                {/* Score Card */}
                <div className="card text-center">
                  <p className="text-slate-400 text-sm mb-2">Detected Role: <span className="text-indigo-400 font-medium">{result.detectedRole}</span></p>
                  <div className={`text-6xl font-bold mb-2 ${getScoreColor(result.matchPercent)}`}>
                    {result.matchPercent}%
                  </div>
                  <div className="text-lg font-semibold mb-3">{result.readinessLevel}</div>
                  <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                    <div className={`h-3 rounded-full bg-gradient-to-r ${getBarColor(result.matchPercent)} transition-all duration-700`}
                      style={{ width: `${result.matchPercent}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-green-500/10 rounded-xl p-3">
                      <div className="text-xl font-bold text-green-400">{result.stats.matched}</div>
                      <div className="text-xs text-slate-400">Matched</div>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-3">
                      <div className="text-xl font-bold text-red-400">{result.stats.missing}</div>
                      <div className="text-xs text-slate-400">Missing</div>
                    </div>
                    <div className="bg-indigo-500/10 rounded-xl p-3">
                      <div className="text-xl font-bold text-indigo-400">{result.stats.bonus}</div>
                      <div className="text-xs text-slate-400">Bonus</div>
                    </div>
                  </div>
                </div>

                {/* Advice */}
                <div className="card bg-indigo-500/5 border-indigo-500/20">
                  <p className="text-sm font-medium text-indigo-400 mb-1">💡 AI Recommendation</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{result.advice}</p>
                </div>

                {/* Priority Skills */}
                {result.prioritySkills.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold mb-3 text-sm">🚨 Priority Skills to Learn</h3>
                    <div className="space-y-2">
                      {result.prioritySkills.map((skill, i) => (
                        <div key={skill} className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl px-3 py-2">
                          <span className="text-xs font-mono text-red-400 font-bold">#{i + 1}</span>
                          <span className="text-sm font-medium">{skill}</span>
                          <Link href="/roadmap" className="ml-auto text-xs text-indigo-400 hover:text-indigo-300">→ Learn</Link>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matched Skills */}
                {result.matchedSkills.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold mb-3 text-sm">✅ Skills You Already Have</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.matchedSkills.map(skill => (
                        <span key={skill} className="text-xs px-3 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full">
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bonus Skills */}
                {result.bonusSkills.length > 0 && (
                  <div className="card">
                    <h3 className="font-semibold mb-3 text-sm">⭐ Bonus Skills (Not in your roadmap)</h3>
                    <div className="flex flex-wrap gap-2">
                      {result.bonusSkills.slice(0, 8).map(skill => (
                        <span key={skill} className="text-xs px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
