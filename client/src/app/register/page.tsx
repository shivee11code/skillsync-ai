"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      router.push("/onboarding");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 relative">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div style={{ position: "absolute", top: "20%", left: "30%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)" }} />
      </div>
      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="font-bold text-xl gradient-text">SkillSync AI</Link>
          <h1 className="text-3xl font-bold mt-6 mb-2">Create your account</h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Start your personalized tech career journey</p>
        </div>
        <div className="card" style={{ padding: "2rem" }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Full Name</label>
              <input className="input-field" placeholder="Shivanshi Shukla" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Email Address</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Password</label>
              <input type="password" className="input-field" placeholder="Min 6 characters" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            {error && (
              <div className="pill pill-red w-full justify-center py-2.5 rounded-xl text-xs">
                ⚠️ {error}
              </div>
            )}
            <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account →"}
            </button>
          </form>
          <div className="divider my-5" />
          <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
