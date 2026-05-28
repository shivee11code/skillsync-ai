"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ROLE_META } from "@/types";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push(user.goalRole ? "/dashboard" : "/onboarding");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-20">
          <div className="mb-6 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm text-indigo-400">
            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
            AI-Powered Career Guidance • 9 Tech Roles
          </div>
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Your Personal<br />
            <span className="gradient-text">Tech Career Roadmap</span>
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop guessing what to learn. Get an AI-generated step-by-step roadmap for your target role, track your skills, and build real projects.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/register" className="btn-primary text-lg px-10 py-3">
              Get Started Free →
            </Link>
            <Link href="/login" className="btn-ghost text-lg px-10 py-3">
              Sign In
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {[
            { label: "Career Roles", value: "9" },
            { label: "Skills Covered", value: "100+" },
            { label: "AI Projects", value: "27+" },
            { label: "XP System", value: "∞" },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Roles Grid */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">Choose Your Path</h2>
          <p className="text-slate-400 text-center mb-8">9 specialized tech career roadmaps — pick yours and start learning</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(ROLE_META).map(([role, meta]) => (
              <div key={role} className="card group hover:border-white/20 transition-all duration-200">
                <div className={`text-2xl mb-3 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${meta.color} opacity-80`}>
                  {meta.icon}
                </div>
                <h3 className="font-semibold mb-1">{role}</h3>
                <p className="text-slate-400 text-sm">{meta.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-2">How It Works</h2>
          <p className="text-slate-400 text-center mb-8">From zero to job-ready in 4 simple steps</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { step: "01", title: "Pick Your Role", desc: "Choose from 9 tech career paths" },
              { step: "02", title: "AI Analyzes", desc: "We detect your skill gaps instantly" },
              { step: "03", title: "Get Roadmap", desc: "Receive a step-by-step learning plan" },
              { step: "04", title: "Track & Build", desc: "Mark skills done, earn XP, build projects" },
            ].map((item) => (
              <div key={item.step} className="card text-center">
                <div className="text-3xl font-bold gradient-text mb-3">{item.step}</div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card text-center bg-indigo-500/5 border-indigo-500/20">
          <h2 className="text-2xl font-bold mb-2">Ready to start your journey?</h2>
          <p className="text-slate-400 mb-6">Join thousands of developers building their careers with SkillSync AI</p>
          <Link href="/register" className="btn-primary text-lg px-10 py-3">
            Create Free Account →
          </Link>
        </div>
      </div>
    </main>
  );
}
