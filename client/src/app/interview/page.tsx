"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const QUESTIONS: Record<string, { dsa: string[]; hr: string[]; technical: string[] }> = {
  "Full Stack SDE": {
    dsa: ["Reverse a linked list","Find the longest substring without repeating characters","Binary search implementation","Two sum problem","Level order traversal of a tree","Detect cycle in a graph","Merge two sorted arrays","Find all permutations of a string","LRU Cache implementation","Dijkstra shortest path"],
    technical: ["Explain REST vs GraphQL","What is CORS and how to fix it?","Difference between SQL and NoSQL","How does JWT authentication work?","What is the event loop in Node.js?","Explain React reconciliation","What is server-side rendering?","How does MongoDB indexing work?","Explain microservices architecture","What is Docker and why use it?"],
    hr: ["Tell me about yourself","Why do you want this role?","Describe a challenging project","Where do you see yourself in 5 years?","How do you handle tight deadlines?","Tell me about a time you failed","What is your greatest strength?","How do you stay updated with tech?","Describe your ideal work environment","Why should we hire you?"],
  },
  "AI Engineer": {
    dsa: ["Implement gradient descent","Matrix multiplication from scratch","Find k nearest neighbors","Implement a queue using stacks","Binary tree height","Merge sort implementation","Dynamic programming — knapsack","Graph BFS and DFS","Sliding window maximum","Topological sort"],
    technical: ["Explain overfitting and underfitting","What is backpropagation?","Difference between CNN and RNN","What is attention mechanism in transformers?","Explain RAG architecture","What is vector embedding?","How does LangChain work?","Explain precision vs recall","What is transfer learning?","How to handle imbalanced datasets?"],
    hr: ["Why AI engineering?","Describe your ML project experience","How do you evaluate model performance?","Tell me about a failed experiment","How do you explain AI to non-technical people?","Where do you see AI in 10 years?","Describe your research approach","What ML papers have you read recently?","How do you handle data privacy concerns?","Tell me about a time you improved a model"],
  },
  "Cybersecurity Analyst": {
    dsa: ["Implement Caesar cipher","Find duplicate in array","String palindrome check","Binary search","Stack using arrays","Reverse a string","Count occurrences in array","Two pointer technique","Sliding window","Hash map implementation"],
    technical: ["What is SQL injection and how to prevent it?","Explain XSS attacks","What is the difference between IDS and IPS?","How does HTTPS work?","What is a man-in-the-middle attack?","Explain the CIA triad","What is penetration testing methodology?","How does a firewall work?","What is zero-day vulnerability?","Explain OWASP Top 10"],
    hr: ["Why cybersecurity?","Describe a security incident you handled","How do you stay updated on threats?","Tell me about a time you found a vulnerability","How do you handle sensitive information?","Describe your ethical hacking experience","What certifications do you have?","How do you approach risk assessment?","Tell me about a challenging security audit","Why is security important for businesses?"],
  },
  "Data Scientist": {
    dsa: ["Implement binary search","Find median of two sorted arrays","Group anagrams","Top k frequent elements","Maximum subarray sum","Count inversions","Merge intervals","Find peak element","Rotate array","Valid parentheses"],
    technical: ["Explain bias-variance tradeoff","What is cross-validation?","Difference between bagging and boosting","How does PCA work?","What is regularization?","Explain the confusion matrix","What is feature engineering?","How to handle missing data?","Explain A/B testing","What is time series forecasting?"],
    hr: ["Why data science?","Describe an impactful data project","How do you communicate findings to stakeholders?","Tell me about a time your model failed","How do you handle dirty data?","Describe your data visualization approach","What tools do you use daily?","How do you prioritize features?","Tell me about a challenging dataset","How do you ensure data quality?"],
  },
  "DevOps Engineer": {
    dsa: ["Parse log files with regex","Implement a rate limiter","LRU cache","Find duplicate processes","Graph cycle detection","Topological sort for CI/CD","Implement a job scheduler","Priority queue","String manipulation","Circular buffer"],
    technical: ["What is CI/CD?","Explain Docker vs VM","How does Kubernetes orchestration work?","What is infrastructure as code?","Explain blue-green deployment","What is a service mesh?","How does load balancing work?","Explain GitOps","What is observability?","How to handle secrets in Kubernetes?"],
    hr: ["Why DevOps?","Describe a production incident you resolved","How do you handle on-call rotations?","Tell me about a deployment that went wrong","How do you balance speed and stability?","Describe your automation philosophy","How do you collaborate with developers?","Tell me about a time you improved uptime","How do you approach cost optimization?","Describe your monitoring strategy"],
  },
};

const DEFAULT_QUESTIONS = {
  dsa: ["Two sum problem","Reverse a string","Find duplicates in array","Binary search","Merge sort","Stack implementation","Queue using stacks","Linked list reversal","Tree traversal","Graph BFS"],
  technical: ["Explain OOP concepts","What is REST API?","Difference between GET and POST","What is a database index?","Explain version control","What is agile methodology?","Explain cloud computing","What is microservices?","How does the internet work?","What is recursion?"],
  hr: ["Tell me about yourself","Why this role?","Greatest strength and weakness","Where do you see yourself in 5 years?","Describe a challenge you overcame","Why should we hire you?","Team player or individual?","How do you handle pressure?","Describe your ideal work environment","Any questions for us?"],
};

export default function InterviewPage() {
  const { user } = useAuth();
  const [category, setCategory] = useState<"dsa" | "technical" | "hr">("dsa");
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [saved, setSaved] = useState<Record<number, string>>({});
  const [showAnswer, setShowAnswer] = useState(false);

  const role = user?.goalRole || "Full Stack SDE";
  const qs = (QUESTIONS[role] || DEFAULT_QUESTIONS)[category];

  const handleSave = () => {
    setSaved(prev => ({ ...prev, [currentQ]: answer }));
    setSaved(s => ({ ...s }));
  };

  const cats = [
    { id: "dsa", label: "DSA & Coding", icon: "💻" },
    { id: "technical", label: "Technical", icon: "🔧" },
    { id: "hr", label: "HR & Behavioral", icon: "🤝" },
  ] as const;

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
          <h1 className="text-3xl font-bold mb-1">Interview Prep</h1>
          <p className="text-slate-400">Practice questions for <span className="text-indigo-400 font-medium">{role}</span></p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-3 mb-8">
          {cats.map((cat) => (
            <button key={cat.id} onClick={() => { setCategory(cat.id); setCurrentQ(0); setAnswer(""); setShowAnswer(false); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                category === cat.id ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
              }`}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Question list */}
          <div className="card overflow-y-auto max-h-[600px]">
            <h3 className="font-semibold mb-4 text-sm text-slate-400 uppercase tracking-wide">Questions</h3>
            <div className="space-y-2">
              {qs.map((q, i) => (
                <button key={i} onClick={() => { setCurrentQ(i); setAnswer(saved[i] || ""); setShowAnswer(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                    currentQ === i ? "bg-indigo-500/20 text-indigo-300" : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}>
                  <span className="font-mono text-xs mr-2 opacity-50">{String(i + 1).padStart(2, "0")}</span>
                  {q}
                  {saved[i] && <span className="ml-1 text-green-400 text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Answer area */}
          <div className="md:col-span-2 space-y-4">
            <div className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">{category} Question {currentQ + 1}/{qs.length}</span>
                  <h2 className="text-lg font-semibold mt-1">{qs[currentQ]}</h2>
                </div>
              </div>
              <textarea className="input-field mb-4" rows={6}
                placeholder="Type your answer here — practice out loud or write your response..."
                value={answer} onChange={(e) => setAnswer(e.target.value)} />
              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-primary px-5 py-2 text-sm">
                  ✓ Save Answer
                </button>
                <button onClick={() => { setCurrentQ(i => Math.min(i + 1, qs.length - 1)); setAnswer(""); setShowAnswer(false); }}
                  className="btn-ghost px-5 py-2 text-sm">
                  Next →
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="card">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Questions Practiced</span>
                <span className="text-sm font-medium text-indigo-400">{Object.keys(saved).length}/{qs.length}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(Object.keys(saved).length / qs.length) * 100}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {Object.keys(saved).length === qs.length ? "🎉 All questions practiced!" : `${qs.length - Object.keys(saved).length} questions remaining`}
              </p>
            </div>

            {/* Tips */}
            <div className="card bg-indigo-500/5 border-indigo-500/20">
              <h3 className="font-semibold text-sm mb-2 text-indigo-400">💡 Interview Tips</h3>
              <ul className="text-sm text-slate-400 space-y-1">
                {category === "dsa" && <>
                  <li>• Think out loud — explain your approach before coding</li>
                  <li>• Start with brute force, then optimize</li>
                  <li>• Ask clarifying questions about edge cases</li>
                </>}
                {category === "technical" && <>
                  <li>• Use real examples from your projects</li>
                  <li>• Structure answers: What → Why → How</li>
                  <li>• Admit if you don't know, but show curiosity</li>
                </>}
                {category === "hr" && <>
                  <li>• Use the STAR method: Situation, Task, Action, Result</li>
                  <li>• Be specific — avoid generic answers</li>
                  <li>• Prepare 2-3 questions to ask the interviewer</li>
                </>}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
