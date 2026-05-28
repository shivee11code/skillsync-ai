"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface Question { q: string; options: string[]; }
interface QuizResult { score: number; passed: boolean; correct: number; total: number; results: Array<{question:string;yourAnswer:string;correctAnswer:string;isCorrect:boolean;explanation:string}>; message: string; }

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const decoded = decodeURIComponent(params.skillName as string);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<{ questions: Question[] }>(`/api/quiz/${encodeURIComponent(decoded)}`)
      .then((d) => { setQuestions(d.questions); setAnswers(new Array(d.questions.length).fill(-1)); })
      .catch(() => router.push("/roadmap"))
      .finally(() => setLoading(false));
  }, [decoded]);

  const handleAnswer = (idx: number) => {
    const updated = [...answers];
    updated[current] = idx;
    setAnswers(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const data = await api.post<QuizResult>(`/api/quiz/${encodeURIComponent(decoded)}/submit`, { answers });
      setResults(data);
      setSubmitted(true);
      // If passed, mark skill as completed automatically
      if (data.passed) {
        await api.put(`/api/roadmap/skill/${encodeURIComponent(decoded)}`, { status: "completed" });
      }
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/roadmap" className="text-slate-400 hover:text-white text-sm mb-6 inline-block">← Back to Roadmap</Link>
        <h1 className="text-2xl font-bold mb-1">{decoded} — Skill Quiz</h1>
        <p className="text-slate-400 text-sm mb-8">Score 60%+ to mark this skill as <span className="text-green-400">Completed ✅</span></p>

        {!submitted ? (
          <div>
            {/* Progress bar */}
            <div className="flex gap-1.5 mb-6">
              {questions.map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  answers[i] !== -1 ? "bg-indigo-500" : i === current ? "bg-indigo-400/50" : "bg-white/10"}`} />
              ))}
            </div>

            <div className="card mb-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-xs text-slate-500 font-mono">Q{current + 1} / {questions.length}</p>
                <p className="text-xs text-slate-500">{answers.filter(a => a !== -1).length} answered</p>
              </div>
              <h2 className="text-lg font-semibold mb-6 leading-relaxed">{questions[current]?.q}</h2>
              <div className="space-y-3">
                {questions[current]?.options.map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200 ${
                      answers[current] === i
                        ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                        : "bg-white/5 border-white/10 hover:border-indigo-500/40 hover:bg-white/10"}`}>
                    <span className="font-mono text-slate-500 mr-3">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              {current > 0 && (
                <button className="btn-ghost" onClick={() => setCurrent(c => c - 1)}>← Prev</button>
              )}
              {current < questions.length - 1 ? (
                <button className="btn-primary flex-1" disabled={answers[current] === -1}
                  onClick={() => setCurrent(c => c + 1)}>
                  Next →
                </button>
              ) : (
                <button className="btn-primary flex-1"
                  disabled={answers.includes(-1) || submitting}
                  onClick={handleSubmit}>
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : "Submit Quiz 🚀"}
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">Answer all questions to submit</p>
          </div>
        ) : results && (
          <div>
            {/* Score card */}
            <div className={`card mb-6 text-center border-2 ${results.passed ? "border-green-500/40 bg-green-500/5" : "border-red-500/40 bg-red-500/5"}`}>
              <div className="text-6xl font-bold mb-3">{results.score}%</div>
              <div className={`text-xl font-bold mb-2 ${results.passed ? "text-green-400" : "text-red-400"}`}>
                {results.passed ? "✅ Skill Verified!" : "❌ Not Passed"}
              </div>
              <p className="text-slate-400 text-sm">{results.correct}/{results.total} correct — {results.message}</p>
              {results.passed && (
                <div className="mt-4 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2 text-green-400 text-sm">
                  🎉 Skill automatically marked as Completed on your roadmap! +10 XP earned
                </div>
              )}
            </div>

            {/* Question breakdown */}
            <h3 className="font-semibold mb-3 text-slate-300">Question Breakdown</h3>
            <div className="space-y-3 mb-6">
              {results.results.map((r, i) => (
                <div key={i} className={`card text-sm border ${r.isCorrect ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <span>{r.isCorrect ? "✅" : "❌"}</span>
                    <p className="font-medium">{r.question}</p>
                  </div>
                  {!r.isCorrect && <p className="text-red-400 text-xs mb-1 ml-6">Your answer: {r.yourAnswer}</p>}
                  <p className="text-green-400 text-xs mb-2 ml-6">Correct: {r.correctAnswer}</p>
                  <p className="text-slate-400 text-xs ml-6 italic">{r.explanation}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {results.passed ? (
                <button className="btn-primary flex-1" onClick={() => router.push("/roadmap")}>
                  View Roadmap →
                </button>
              ) : (
                <>
                  <button className="btn-ghost flex-1" onClick={() => {
                    setSubmitted(false);
                    setAnswers(new Array(questions.length).fill(-1));
                    setCurrent(0);
                    setResults(null);
                  }}>
                    Retry Quiz
                  </button>
                  <button className="btn-primary flex-1" onClick={() => router.push("/roadmap")}>
                    Back to Roadmap
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
