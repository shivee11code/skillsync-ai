"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const MOCK_INTERVIEWS: Record<string, { title: string; duration: number; questions: { q: string; hint: string; ideal: string }[] }[]> = {
  "Full Stack SDE": [
    {
      title: "Frontend Round",
      duration: 30,
      questions: [
        { q: "Explain the difference between React state and props.", hint: "Think about data flow direction", ideal: "Props are passed from parent to child and are read-only. State is managed within the component and can be updated using setState or useState, triggering re-renders. Props flow down, events flow up." },
        { q: "What is the virtual DOM and how does React use it?", hint: "Think about performance optimization", ideal: "The virtual DOM is a lightweight JS representation of the real DOM. React diffs the virtual DOM with the previous version and only updates the actual DOM nodes that changed — making updates fast and efficient." },
        { q: "How would you optimize a slow React application?", hint: "Think about memoization, lazy loading, code splitting", ideal: "Use React.memo to prevent unnecessary re-renders, useMemo/useCallback for expensive computations, code splitting with React.lazy(), virtualize long lists with react-virtual, and optimize images and bundle size." },
        { q: "Explain CSS Box Model.", hint: "Content → Padding → Border → Margin", ideal: "The box model wraps every element: content (innermost), padding (space inside border), border (around padding), margin (space outside). box-sizing: border-box makes width/height include padding and border." },
        { q: "What is CORS and how do you handle it?", hint: "Cross-origin resource sharing", ideal: "CORS is a browser security mechanism restricting cross-origin requests. Fix it server-side by setting Access-Control-Allow-Origin headers using the cors npm package in Express, or configure a proxy in development." },
      ],
    },
    {
      title: "Backend Round",
      duration: 30,
      questions: [
        { q: "Design a REST API for a blog application.", hint: "Resources, HTTP methods, status codes", ideal: "Resources: /posts, /users, /comments. Methods: GET (list/read), POST (create), PUT/PATCH (update), DELETE. Use 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error." },
        { q: "Explain the difference between SQL and NoSQL databases.", hint: "Structure, scalability, use cases", ideal: "SQL uses tables with fixed schema, supports complex joins, ACID transactions — good for relational data. NoSQL (MongoDB) uses flexible documents, scales horizontally — good for unstructured data, high-volume reads/writes." },
        { q: "How does JWT authentication work?", hint: "Header.Payload.Signature", ideal: "JWT = Header (algo) + Payload (user data/claims) + Signature (HMAC of header+payload with secret). Server creates token on login, client sends it in Authorization: Bearer <token> header. Server verifies signature on each request." },
        { q: "What is the event loop in Node.js?", hint: "Single-threaded, non-blocking I/O", ideal: "Node.js is single-threaded but handles concurrency via the event loop. I/O operations are offloaded to libuv (OS-level). When complete, their callbacks are queued in the event loop and executed when the call stack is empty." },
        { q: "How would you implement rate limiting on an API?", hint: "Think about tokens, sliding window", ideal: "Use express-rate-limit middleware for simple cases. For distributed systems, use Redis with a sliding window algorithm — store request counts per IP with TTL expiry. Return 429 Too Many Requests when limit exceeded." },
      ],
    },
  ],
  "AI Engineer": [
    {
      title: "ML Fundamentals Round",
      duration: 30,
      questions: [
        { q: "Explain the bias-variance tradeoff.", hint: "Underfitting vs overfitting", ideal: "High bias = underfitting (model too simple, misses patterns). High variance = overfitting (model too complex, memorizes noise). Goal: minimize total error = bias² + variance + irreducible noise. Use cross-validation to diagnose." },
        { q: "What is gradient descent and its variants?", hint: "SGD, mini-batch, Adam", ideal: "Gradient descent minimizes loss by computing gradients and updating weights: w = w - lr * ∇L. Variants: SGD (1 sample, noisy), Mini-batch (subset, balanced), Adam (adaptive learning rates + momentum) — most commonly used." },
        { q: "How does the attention mechanism work in transformers?", hint: "Query, Key, Value matrices", ideal: "Attention computes: softmax(QK^T / √d_k) * V. Each token creates Q, K, V vectors. Q of one token is matched against K of all tokens to produce attention weights, then weighted sum of V gives the output. Multi-head runs this in parallel." },
        { q: "What is overfitting and how do you prevent it?", hint: "Regularization techniques", ideal: "Overfitting = model performs well on training data but poorly on unseen data. Prevent with: L1/L2 regularization, dropout (randomly zero neurons during training), early stopping, data augmentation, cross-validation, and getting more data." },
        { q: "Explain RAG — Retrieval Augmented Generation.", hint: "Vector search + LLM context", ideal: "RAG = retrieve relevant documents from vector DB using semantic search (embeddings), then inject them as context into the LLM prompt. This grounds responses in factual data, reduces hallucinations, and avoids costly fine-tuning." },
      ],
    },
  ],
  "Cybersecurity Analyst": [
    {
      title: "Security Fundamentals Round",
      duration: 30,
      questions: [
        { q: "Explain the CIA triad in cybersecurity.", hint: "Three core security principles", ideal: "CIA = Confidentiality (only authorized users access data), Integrity (data is accurate and unmodified), Availability (systems accessible when needed). These three principles guide all security decisions and policies." },
        { q: "What is SQL injection and how do you prevent it?", hint: "Input validation, prepared statements", ideal: "SQL injection injects malicious SQL via user input to manipulate queries. Prevent with: parameterized queries / prepared statements (most important), input validation and sanitization, stored procedures, least-privilege DB accounts, WAF." },
        { q: "How does HTTPS work?", hint: "TLS handshake, certificates, symmetric encryption", ideal: "HTTPS uses TLS. Client connects → server sends certificate (CA-signed) → client verifies CA trust → they negotiate a shared session key via asymmetric crypto (RSA/ECDH) → subsequent data encrypted with symmetric AES using that session key." },
        { q: "What is the difference between IDS and IPS?", hint: "Detect vs prevent", ideal: "IDS (Intrusion Detection System) monitors traffic and generates alerts on suspicious activity but takes no blocking action — passive. IPS (Intrusion Prevention System) actively blocks/drops malicious traffic in real time — inline in the network." },
        { q: "Explain a man-in-the-middle attack and its mitigations.", hint: "Intercepting communication", ideal: "MITM: attacker intercepts communication between two parties who think they're talking directly. Mitigations: HTTPS/TLS, certificate pinning, HSTS (HTTP Strict Transport Security), mutual TLS authentication, strong WiFi encryption (WPA3)." },
      ],
    },
  ],
};

const DEFAULT_ROUND = {
  title: "General Technical Round",
  duration: 30,
  questions: [
    { q: "Tell me about yourself and your technical background.", hint: "Education → skills → projects → goals", ideal: "Mention your degree, 2-3 key technical skills, your most impactful project with the tech used and outcome, and your career goal. Keep it under 90 seconds. End with why you want this specific role." },
    { q: "What is object-oriented programming? Explain its four pillars.", hint: "Encapsulation, Inheritance, Polymorphism, Abstraction", ideal: "OOP organizes code around objects. Encapsulation: bundling data + methods, hiding internal state. Inheritance: child classes reuse parent code. Polymorphism: same interface, different implementations. Abstraction: hiding complexity behind simple interfaces." },
    { q: "Difference between an array and a linked list.", hint: "Memory layout, access time, insertion", ideal: "Arrays: contiguous memory, O(1) random access, O(n) insertion/deletion, fixed size (static arrays). Linked lists: nodes with pointers, O(n) access, O(1) insertion/deletion at known position, dynamic size. Arrays better for read-heavy, linked lists for insert-heavy." },
    { q: "What is time complexity and Big O notation?", hint: "Algorithm efficiency measurement", ideal: "Time complexity measures how runtime grows with input size n. Big O = worst-case upper bound. Common: O(1) constant, O(log n) logarithmic (binary search), O(n) linear, O(n log n) (merge sort), O(n²) quadratic (bubble sort), O(2^n) exponential." },
    { q: "Describe a project you are most proud of.", hint: "STAR: Situation, Task, Action, Result", ideal: "Name the project, the problem it solved (situation), your specific role (task), technical decisions you made and why (action), and measurable outcomes — users, accuracy %, performance improvement (result). Relate skills to the role you are applying for." },
  ],
};

type Phase = "setup" | "interview" | "result";

export default function MockInterviewPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("setup");
  const [selectedRound, setSelectedRound] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const role = user?.goalRole || "Full Stack SDE";
  const rounds = MOCK_INTERVIEWS[role] || [DEFAULT_ROUND];
  const round = rounds[selectedRound] || DEFAULT_ROUND;
  const questions = round.questions;

  useEffect(() => {
    if (phase === "interview") {
      setTimeLeft(round.duration * 60);
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current!); finishInterview(answers, answer); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const scoreAnswer = (a: string): number => {
    const len = a.trim().length;
    if (len === 0) return 0;
    if (len < 30) return 3;
    if (len < 100) return 5;
    if (len < 250) return 7;
    if (len < 500) return 8;
    return 9;
  };

  const finishInterview = (prevAnswers: string[], currentAnswer: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const allAnswers = [...prevAnswers, currentAnswer];
    const allScores = allAnswers.map(a => scoreAnswer(a));
    setAnswers(allAnswers);
    setScores(allScores);
    setPhase("result");
  };

  const handleNext = () => {
    const newAnswers = [...answers, answer];
    if (currentQ + 1 >= questions.length) {
      finishInterview(answers, answer);
    } else {
      setAnswers(newAnswers);
      setAnswer("");
      setShowHint(false);
      setCurrentQ(q => q + 1);
    }
  };

  const startInterview = () => {
    setAnswers([]);
    setScores([]);
    setCurrentQ(0);
    setAnswer("");
    setShowHint(false);
    setPhase("interview");
  };

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
          <Link href="/interview" className="text-slate-400 hover:text-white text-sm">Interview Prep</Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* SETUP */}
        {phase === "setup" && (
          <div>
            <h1 className="text-3xl font-bold mb-1">Mock Interview</h1>
            <p className="text-slate-400 mb-8">Simulated interview for <span className="text-indigo-400 font-medium">{role}</span></p>

            <div className="card mb-6">
              <h2 className="font-bold mb-4">Choose a Round</h2>
              <div className="space-y-3">
                {rounds.map((r, i) => (
                  <button key={i} onClick={() => setSelectedRound(i)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      selectedRound === i ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{r.title}</h3>
                        <p className="text-slate-400 text-sm mt-0.5">{r.questions.length} questions • {r.duration} min</p>
                      </div>
                      {selectedRound === i && <span className="text-indigo-400 text-xs font-medium">✓ Selected</span>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="card mb-6 bg-amber-500/5 border-amber-500/20">
              <h3 className="font-semibold text-amber-400 mb-3">📋 How it works</h3>
              <ul className="text-sm text-slate-400 space-y-1.5">
                <li>• You have <strong className="text-white">{round.duration} minutes</strong> for {round.questions.length} questions</li>
                <li>• Type your answers as you would speak in a real interview</li>
                <li>• After finishing, you see your score + ideal answers for every question</li>
                <li>• Hints available — but try without them first</li>
              </ul>
            </div>

            <button onClick={startInterview} className="btn-primary w-full py-4 text-base">
              🎯 Start Mock Interview
            </button>
          </div>
        )}

        {/* INTERVIEW */}
        {phase === "interview" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold">{round.title}</h2>
                <p className="text-slate-400 text-sm">Question {currentQ + 1} of {questions.length}</p>
              </div>
              <div className={`px-4 py-2 rounded-xl font-mono font-bold text-lg border ${
                timeLeft < 120 ? "border-red-500/50 bg-red-500/10 text-red-400" :
                timeLeft < 300 ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400" :
                "border-white/10 bg-white/5 text-white"
              }`}>
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
              <div className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${(currentQ / questions.length) * 100}%` }} />
            </div>

            <div className="card mb-4">
              <div className="flex items-start gap-3 mb-5">
                <span className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {currentQ + 1}
                </span>
                <h3 className="text-xl font-semibold leading-relaxed">{questions[currentQ].q}</h3>
              </div>

              <textarea className="input-field mb-4" rows={7}
                placeholder="Type your answer here — be clear and structured..."
                value={answer} onChange={e => setAnswer(e.target.value)} autoFocus />

              <div className="flex gap-3 flex-wrap">
                <button onClick={handleNext} className="btn-primary px-6 py-2.5">
                  {currentQ + 1 >= questions.length ? "Finish & See Results ✓" : "Next Question →"}
                </button>
                <button onClick={() => setShowHint(!showHint)} className="btn-ghost px-4 py-2.5 text-sm">
                  {showHint ? "Hide Hint" : "💡 Hint"}
                </button>
              </div>

              {showHint && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                  <p className="text-yellow-300 text-sm">💡 <strong>Hint:</strong> {questions[currentQ].hint}</p>
                </div>
              )}
            </div>

            {answers.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {answers.map((a, i) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${
                    a.trim() ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                  }`}>
                    Q{i + 1} {a.trim() ? "✓" : "✗"}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RESULTS */}
        {phase === "result" && (
          <div>
            <div className="text-center mb-8">
              <div className="text-6xl mb-3">
                {avgScore >= 8 ? "🏆" : avgScore >= 6 ? "🎯" : avgScore >= 4 ? "📈" : "💪"}
              </div>
              <h1 className="text-3xl font-bold mb-1">Interview Complete!</h1>
              <p className="text-slate-400">Your performance breakdown with ideal answers</p>
            </div>

            <div className="card text-center mb-8">
              <div className={`text-6xl font-bold mb-2 ${
                avgScore >= 8 ? "text-green-400" : avgScore >= 6 ? "text-yellow-400" :
                avgScore >= 4 ? "text-orange-400" : "text-red-400"}`}>
                {avgScore}/10
              </div>
              <p className="text-slate-400 text-sm mb-3">Average Score across {questions.length} questions</p>
              <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${
                avgScore >= 8 ? "bg-green-500/20 text-green-400" :
                avgScore >= 6 ? "bg-yellow-500/20 text-yellow-400" :
                avgScore >= 4 ? "bg-orange-500/20 text-orange-400" :
                "bg-red-500/20 text-red-400"}`}>
                {avgScore >= 8 ? "Excellent — You are ready to interview!" :
                 avgScore >= 6 ? "Good — Minor improvements needed" :
                 avgScore >= 4 ? "Fair — Keep practicing" :
                 "Needs Work — Study more and retry"}
              </div>
            </div>

            {/* Per question with inline ideal answers */}
            <div className="space-y-4 mb-8">
              {questions.slice(0, answers.length).map((q, i) => (
                <div key={i} className="card">
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      (scores[i] || 0) >= 7 ? "bg-green-500/20 text-green-400" :
                      (scores[i] || 0) >= 5 ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"}`}>
                      {scores[i] || 0}
                    </span>
                    <h3 className="font-semibold text-sm leading-relaxed flex-1">{q.q}</h3>
                  </div>

                  {/* Your answer */}
                  <div className="mb-3">
                    <p className="text-xs text-slate-500 font-medium mb-1.5 uppercase tracking-wide">Your Answer</p>
                    <div className="p-3 bg-white/3 rounded-xl border border-white/5">
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {answers[i]?.trim() || <span className="text-red-400 italic">No answer provided</span>}
                      </p>
                    </div>
                  </div>

                  {/* Ideal answer — always visible */}
                  <div>
                    <p className="text-xs text-indigo-400 font-medium mb-1.5 uppercase tracking-wide">✨ Ideal Answer</p>
                    <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
                      <p className="text-sm text-slate-200 leading-relaxed">{q.ideal}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setPhase("setup"); setAnswers([]); setScores([]); setCurrentQ(0); setAnswer(""); }}
                className="btn-primary flex-1 py-3">
                🔄 Retry Interview
              </button>
              <Link href="/dashboard" className="btn-ghost flex-1 py-3 text-center">
                🏠 Dashboard
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
