"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ChatMessage } from "@/types";

// Render **bold**, *italic*, bullet points, numbered lists
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const key = i;

    // Empty line = spacer
    if (!line.trim()) {
      elements.push(<div key={key} className="h-2" />);
      return;
    }

    // Bullet point
    if (line.startsWith("• ") || line.startsWith("- ")) {
      const content = line.replace(/^[•\-]\s/, "");
      elements.push(
        <div key={key} className="flex gap-2 mb-1">
          <span className="text-indigo-400 mt-0.5 flex-shrink-0">•</span>
          <span>{inlineMarkdown(content)}</span>
        </div>
      );
      return;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      elements.push(
        <div key={key} className="flex gap-2 mb-1">
          <span className="text-indigo-400 font-bold flex-shrink-0 w-5">{numMatch[1]}.</span>
          <span>{inlineMarkdown(numMatch[2])}</span>
        </div>
      );
      return;
    }

    // Normal line
    elements.push(<p key={key} className="mb-1 leading-relaxed">{inlineMarkdown(line)}</p>);
  });

  return elements;
}

function inlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*"))
      return <em key={i} className="italic text-slate-300">{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i} className="bg-white/10 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
    return part;
  });
}

const QUICK_PROMPTS = [
  { label: "What should I learn next?", icon: "🎯" },
  { label: "Suggest a beginner project", icon: "🔨" },
  { label: "How long will this take?", icon: "⏱️" },
  { label: "Best resources for my role", icon: "📚" },
  { label: "How to get a job faster?", icon: "💼" },
  { label: "Check my progress", icon: "📊" },
];

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hey! I am your **SkillSync AI mentor** 👋\n\nI know your roadmap, your completed skills, and your goals. Ask me anything:\n\n• What to learn next\n• Project ideas for your level\n• Best learning resources\n• How long your roadmap will take\n• Career and job advice\n• Interview tips\n• Motivation when you are stuck`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    const userMessage: ChatMessage = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const data = await api.post<{ reply: string }>("/api/chat", {
        message: msg,
        history: messages.slice(-6),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I hit an error. Make sure the server is running and try again." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const showQuickPrompts = messages.length <= 1;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex gap-6 items-center">
          <Link href="/roadmap"   className="text-slate-400 hover:text-white text-sm transition-colors">Roadmap</Link>
          <Link href="/interview" className="text-slate-400 hover:text-white text-sm transition-colors">Interview</Link>
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">Dashboard</Link>
        </div>
      </nav>

      {/* Chat header */}
      <div className="border-b border-white/5 px-6 py-3 flex items-center gap-3 flex-shrink-0 bg-white/2">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-lg flex-shrink-0">
          🤖
        </div>
        <div>
          <h1 className="font-bold text-sm">SkillSync AI Mentor</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-slate-400">Online — context-aware of your {user?.goalRole || "roadmap"}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            ⚡ {user?.xp || 0} XP
          </span>
          <span className="text-xs bg-orange-500/15 text-orange-400 border border-orange-500/20 px-2.5 py-1 rounded-full">
            🔥 {user?.streak || 0} streak
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                🤖
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm ${
              msg.role === "user"
                ? "bg-indigo-600 text-white rounded-br-sm"
                : "bg-[#1e1e2e] border border-white/8 text-slate-200 rounded-bl-sm"
            }`}>
              {msg.role === "assistant" ? (
                <div className="space-y-0.5">
                  {renderMarkdown(msg.content)}
                </div>
              ) : (
                <p className="leading-relaxed">{msg.content}</p>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-sm flex-shrink-0 mt-0.5 font-bold text-white">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-sm flex-shrink-0">
              🤖
            </div>
            <div className="bg-[#1e1e2e] border border-white/8 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center h-4">
                {[0, 1, 2].map((i) => (
                  <span key={i}
                    className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {showQuickPrompts && (
        <div className="px-4 pb-3 max-w-3xl mx-auto w-full">
          <p className="text-xs text-slate-500 mb-2 px-1">Quick prompts</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((p) => (
              <button key={p.label} onClick={() => sendMessage(p.label)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all duration-200">
                <span>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-white/10 px-4 py-4 flex-shrink-0 bg-white/2">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-all duration-200 resize-none text-sm leading-relaxed"
              placeholder="Ask anything... (Enter to send, Shift+Enter for new line)"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-12 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 flex-shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-slate-600 mt-2">Enter to send • Shift+Enter for new line</p>
      </div>
    </div>
  );
}
