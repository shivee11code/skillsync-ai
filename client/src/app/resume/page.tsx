"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface ResumeData {
  name: string; title: string; email: string; phone: string;
  location: string; linkedin: string; github: string; leetcode: string;
  summary: string; skills: string;
  experience: { company: string; role: string; duration: string; points: string }[];
  education: { college: string; degree: string; year: string; gpa: string }[];
  projects: { title: string; tech: string; desc: string; points: string }[];
  certifications: string;
}

type Template = "classic" | "minimal" | "modern";

export default function ResumePage() {
  const { user } = useAuth();
  const [template, setTemplate] = useState<Template>("classic");
  const [preview, setPreview] = useState(false);
  const [data, setData] = useState<ResumeData>({
    name: user?.name || "",
    title: "B.Tech Computer Science Undergraduate",
    email: user?.email || "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    leetcode: "",
    summary: "",
    skills: "",
    experience: [{ company: "", role: "", duration: "", points: "" }],
    education: [{ college: "", degree: "", year: "", gpa: "" }],
    projects: [{ title: "", tech: "", desc: "", points: "" }],
    certifications: "",
  });

  const u = (f: keyof ResumeData, v: string) => setData(d => ({ ...d, [f]: v }));
  const uExp = (i: number, f: string, v: string) => { const e = [...data.experience]; e[i] = { ...e[i], [f]: v }; setData(d => ({ ...d, experience: e })); };
  const uEdu = (i: number, f: string, v: string) => { const e = [...data.education]; e[i] = { ...e[i], [f]: v }; setData(d => ({ ...d, education: e })); };
  const uProj = (i: number, f: string, v: string) => { const e = [...data.projects]; e[i] = { ...e[i], [f]: v }; setData(d => ({ ...d, projects: e })); };

  const Section = ({ title, color = "#1a1a8c" }: { title: string; color?: string }) => (
    <div className="mt-4 mb-2">
      <h2 style={{ color, fontSize: "13px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `2px solid ${color}`, paddingBottom: "3px", marginBottom: "6px" }}>{title}</h2>
    </div>
  );

  const ClassicResume = () => (
    <div style={{ fontFamily: "Georgia, serif", fontSize: "11px", lineHeight: "1.5", color: "#1a1a1a", padding: "32px 40px", maxWidth: "760px", margin: "0 auto", background: "white" }}>
      {/* Header */}
      <div style={{ borderBottom: "2px solid #1a1a8c", paddingBottom: "12px", marginBottom: "4px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#1a1a1a", margin: 0, letterSpacing: "0.02em" }}>{data.name || "Your Name"}</h1>
        {data.title && <p style={{ fontSize: "12px", color: "#444", margin: "3px 0 8px" }}>{data.title}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "11px", color: "#1a1a8c" }}>
          {data.email && <span>{data.email}</span>}
          {data.linkedin && <><span style={{ color: "#999" }}>—</span><span>{data.linkedin}</span></>}
          {data.leetcode && <><span style={{ color: "#999" }}>—</span><span>{data.leetcode}</span></>}
          {data.github && <><span style={{ color: "#999" }}>—</span><span>{data.github}</span></>}
          {data.phone && <><span style={{ color: "#999" }}>—</span><span>{data.phone}</span></>}
        </div>
      </div>

      {/* Profile */}
      {data.summary && (
        <>
          <Section title="Profile" />
          <p style={{ fontSize: "11px", lineHeight: "1.6", color: "#333" }}>{data.summary}</p>
        </>
      )}

      {/* Education */}
      {data.education.some(e => e.college) && (
        <>
          <Section title="Education" />
          {data.education.filter(e => e.college).map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <div>
                <span style={{ fontWeight: "700", fontSize: "11px" }}>{edu.college}</span>
                {edu.degree && <span style={{ color: "#444", fontSize: "11px" }}> — {edu.degree}</span>}
              </div>
              <div style={{ textAlign: "right", color: "#444", fontSize: "11px" }}>
                {edu.gpa && <div style={{ fontWeight: "700", color: "#1a1a8c" }}>CGPA: {edu.gpa}</div>}
                {edu.year && <div>{edu.year}</div>}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Skills */}
      {data.skills && (
        <>
          <Section title="Technical Skills" />
          <div style={{ fontSize: "11px", color: "#333" }}>
            {data.skills.split("\n").filter(Boolean).map((line, i) => {
              const [cat, ...rest] = line.split(":");
              return rest.length > 0 ? (
                <div key={i} style={{ marginBottom: "3px" }}>
                  <strong>{cat}:</strong> {rest.join(":")}
                </div>
              ) : <div key={i} style={{ marginBottom: "3px" }}>{line}</div>;
            })}
          </div>
        </>
      )}

      {/* Projects */}
      {data.projects.some(p => p.title) && (
        <>
          <Section title="Projects" />
          {data.projects.filter(p => p.title).map((proj, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                <span style={{ fontWeight: "700", fontSize: "11px", color: "#1a1a8c" }}>{proj.title}</span>
              </div>
              {proj.tech && <p style={{ fontStyle: "italic", fontSize: "10.5px", color: "#555", margin: "1px 0 4px" }}>Tech Stack: {proj.tech}</p>}
              {proj.points && (
                <ul style={{ margin: "0 0 0 16px", padding: 0 }}>
                  {proj.points.split("\n").filter(Boolean).map((pt, j) => (
                    <li key={j} style={{ fontSize: "11px", color: "#333", marginBottom: "2px" }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {/* Experience */}
      {data.experience.some(e => e.company) && (
        <>
          <Section title="Work Experience" />
          {data.experience.filter(e => e.company).map((exp, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontWeight: "700", fontSize: "11px", color: "#1a1a8c" }}>{exp.role}</span>
                  {exp.company && <span style={{ fontSize: "11px", color: "#444" }}> — {exp.company}</span>}
                </div>
                {exp.duration && <span style={{ fontSize: "11px", color: "#666" }}>{exp.duration}</span>}
              </div>
              {exp.points && (
                <ul style={{ margin: "3px 0 0 16px", padding: 0 }}>
                  {exp.points.split("\n").filter(Boolean).map((pt, j) => (
                    <li key={j} style={{ fontSize: "11px", color: "#333", marginBottom: "2px" }}>{pt}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {/* Certifications */}
      {data.certifications && (
        <>
          <Section title="Certifications" />
          <ul style={{ margin: "0 0 0 16px", padding: 0 }}>
            {data.certifications.split("\n").filter(Boolean).map((cert, i) => (
              <li key={i} style={{ fontSize: "11px", color: "#333", marginBottom: "3px" }}>{cert}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );

  const MinimalResume = () => (
    <div style={{ fontFamily: "'Helvetica Neue', Arial, sans-serif", fontSize: "11px", lineHeight: "1.6", color: "#2d2d2d", padding: "36px 44px", maxWidth: "760px", margin: "0 auto", background: "white" }}>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "300", letterSpacing: "0.1em", textTransform: "uppercase", color: "#111", margin: "0 0 4px" }}>{data.name || "Your Name"}</h1>
        {data.title && <p style={{ fontSize: "12px", color: "#888", margin: "0 0 10px", letterSpacing: "0.05em" }}>{data.title}</p>}
        <div style={{ display: "flex", gap: "16px", fontSize: "10.5px", color: "#666" }}>
          {[data.email, data.phone, data.linkedin, data.github].filter(Boolean).map((v, i) => (
            <span key={i}>{v}</span>
          ))}
        </div>
      </div>

      {data.summary && (
        <div style={{ marginBottom: "18px", paddingBottom: "18px", borderBottom: "1px solid #eee" }}>
          <p style={{ fontSize: "11px", color: "#555", lineHeight: "1.7" }}>{data.summary}</p>
        </div>
      )}

      {data.education.some(e => e.college) && (
        <div style={{ marginBottom: "18px" }}>
          <h2 style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", marginBottom: "10px" }}>Education</h2>
          {data.education.filter(e => e.college).map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <div>
                <div style={{ fontWeight: "600", fontSize: "11px" }}>{edu.degree}</div>
                <div style={{ fontSize: "10.5px", color: "#777" }}>{edu.college}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: "10.5px", color: "#777" }}>
                <div>{edu.year}</div>
                {edu.gpa && <div>GPA {edu.gpa}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.skills && (
        <div style={{ marginBottom: "18px" }}>
          <h2 style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", marginBottom: "10px" }}>Skills</h2>
          <p style={{ fontSize: "11px", color: "#555" }}>{data.skills.replace(/\n/g, " · ")}</p>
        </div>
      )}

      {data.projects.some(p => p.title) && (
        <div style={{ marginBottom: "18px" }}>
          <h2 style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", marginBottom: "10px" }}>Projects</h2>
          {data.projects.filter(p => p.title).map((proj, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ fontWeight: "600", fontSize: "11px" }}>{proj.title} {proj.tech && <span style={{ fontWeight: "400", color: "#888", fontSize: "10.5px" }}>— {proj.tech}</span>}</div>
              {proj.points && proj.points.split("\n").filter(Boolean).map((pt, j) => (
                <div key={j} style={{ fontSize: "11px", color: "#555", paddingLeft: "12px" }}>· {pt}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {data.certifications && (
        <div>
          <h2 style={{ fontSize: "10px", fontWeight: "700", letterSpacing: "0.15em", textTransform: "uppercase", color: "#aaa", marginBottom: "10px" }}>Certifications</h2>
          {data.certifications.split("\n").filter(Boolean).map((cert, i) => (
            <div key={i} style={{ fontSize: "11px", color: "#555", marginBottom: "3px" }}>· {cert}</div>
          ))}
        </div>
      )}
    </div>
  );

  const ModernResume = () => (
    <div style={{ fontFamily: "'Arial', sans-serif", fontSize: "11px", lineHeight: "1.5", color: "#2d2d2d", maxWidth: "760px", margin: "0 auto", background: "white", display: "flex", minHeight: "1000px" }}>
      {/* Left sidebar */}
      <div style={{ width: "220px", background: "#1e293b", color: "white", padding: "28px 20px", flexShrink: 0 }}>
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: "700", margin: "0 auto 16px", color: "white" }}>
          {(data.name || "U").charAt(0).toUpperCase()}
        </div>
        <h1 style={{ fontSize: "15px", fontWeight: "700", textAlign: "center", margin: "0 0 4px", color: "white" }}>{data.name || "Your Name"}</h1>
        {data.title && <p style={{ fontSize: "9.5px", textAlign: "center", color: "#94a3b8", margin: "0 0 20px", lineHeight: "1.4" }}>{data.title}</p>}

        <div style={{ borderTop: "1px solid #334155", paddingTop: "16px", marginBottom: "16px" }}>
          <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", fontWeight: "700", marginBottom: "8px" }}>Contact</p>
          {[
            { icon: "✉", val: data.email },
            { icon: "📞", val: data.phone },
            { icon: "📍", val: data.location },
            { icon: "in", val: data.linkedin },
            { icon: "GH", val: data.github },
          ].filter(x => x.val).map((x, i) => (
            <div key={i} style={{ fontSize: "9.5px", color: "#cbd5e1", marginBottom: "5px", display: "flex", gap: "6px", alignItems: "flex-start" }}>
              <span style={{ color: "#6366f1", width: "14px", flexShrink: 0, fontSize: "9px" }}>{x.icon}</span>
              <span style={{ wordBreak: "break-all" }}>{x.val}</span>
            </div>
          ))}
        </div>

        {data.skills && (
          <div style={{ borderTop: "1px solid #334155", paddingTop: "16px" }}>
            <p style={{ fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.1em", color: "#64748b", fontWeight: "700", marginBottom: "8px" }}>Skills</p>
            {data.skills.split("\n").filter(Boolean).map((line, i) => {
              const [cat, ...rest] = line.split(":");
              return (
                <div key={i} style={{ marginBottom: "6px" }}>
                  {rest.length > 0 && <p style={{ fontSize: "8.5px", color: "#6366f1", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: "700", marginBottom: "2px" }}>{cat}</p>}
                  <p style={{ fontSize: "9.5px", color: "#94a3b8", lineHeight: "1.5" }}>{rest.length > 0 ? rest.join(":") : line}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right content */}
      <div style={{ flex: 1, padding: "28px 28px" }}>
        {data.summary && (
          <div style={{ marginBottom: "20px", paddingBottom: "16px", borderBottom: "2px solid #e2e8f0" }}>
            <h2 style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6366f1", marginBottom: "8px" }}>Profile</h2>
            <p style={{ fontSize: "11px", color: "#475569", lineHeight: "1.7" }}>{data.summary}</p>
          </div>
        )}

        {data.education.some(e => e.college) && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6366f1", marginBottom: "10px" }}>Education</h2>
            {data.education.filter(e => e.college).map((edu, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <div>
                  <div style={{ fontWeight: "700", fontSize: "11px", color: "#1e293b" }}>{edu.college}</div>
                  <div style={{ fontSize: "10.5px", color: "#64748b" }}>{edu.degree}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {edu.gpa && <div style={{ fontSize: "11px", fontWeight: "700", color: "#6366f1" }}>{edu.gpa}</div>}
                  <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>{edu.year}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.projects.some(p => p.title) && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6366f1", marginBottom: "10px" }}>Projects</h2>
            {data.projects.filter(p => p.title).map((proj, i) => (
              <div key={i} style={{ marginBottom: "12px", paddingLeft: "10px", borderLeft: "3px solid #6366f1" }}>
                <div style={{ fontWeight: "700", fontSize: "11px", color: "#1e293b" }}>{proj.title}</div>
                {proj.tech && <div style={{ fontSize: "10px", color: "#6366f1", fontStyle: "italic", marginBottom: "3px" }}>{proj.tech}</div>}
                {proj.points && (
                  <ul style={{ margin: "3px 0 0 12px", padding: 0 }}>
                    {proj.points.split("\n").filter(Boolean).map((pt, j) => (
                      <li key={j} style={{ fontSize: "10.5px", color: "#475569", marginBottom: "2px" }}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.experience.some(e => e.company) && (
          <div style={{ marginBottom: "20px" }}>
            <h2 style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6366f1", marginBottom: "10px" }}>Experience</h2>
            {data.experience.filter(e => e.company).map((exp, i) => (
              <div key={i} style={{ marginBottom: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: "700", fontSize: "11px", color: "#1e293b" }}>{exp.role}</div>
                  <div style={{ fontSize: "10.5px", color: "#94a3b8" }}>{exp.duration}</div>
                </div>
                <div style={{ fontSize: "10.5px", color: "#6366f1", marginBottom: "4px" }}>{exp.company}</div>
                {exp.points && (
                  <ul style={{ margin: "0 0 0 12px", padding: 0 }}>
                    {exp.points.split("\n").filter(Boolean).map((pt, j) => (
                      <li key={j} style={{ fontSize: "10.5px", color: "#475569", marginBottom: "2px" }}>{pt}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {data.certifications && (
          <div>
            <h2 style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#6366f1", marginBottom: "10px" }}>Certifications</h2>
            <ul style={{ margin: "0 0 0 16px", padding: 0 }}>
              {data.certifications.split("\n").filter(Boolean).map((cert, i) => (
                <li key={i} style={{ fontSize: "10.5px", color: "#475569", marginBottom: "4px" }}>{cert}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );

  const templates = [
    { id: "classic" as Template, label: "Classic", icon: "📄", desc: "Traditional academic style" },
    { id: "minimal" as Template, label: "Minimal", icon: "⬜", desc: "Clean and modern" },
    { id: "modern"  as Template, label: "Modern",  icon: "🎨", desc: "Two-column with sidebar" },
  ];

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between no-print">
        <Link href="/dashboard" className="font-bold text-xl gradient-text">SkillSync AI</Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm">Dashboard</Link>
          <button onClick={() => setPreview(!preview)} className="btn-ghost text-sm px-4 py-2">
            {preview ? "✏️ Edit" : "👁️ Preview"}
          </button>
          {preview && (
            <button onClick={() => window.print()} className="btn-primary text-sm px-4 py-2">
              📥 Download PDF
            </button>
          )}
        </div>
      </nav>

      {!preview ? (
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-bold mb-2">Resume Builder</h1>
          <p className="text-slate-400 mb-8">Fill in your details, choose a template, then download as PDF</p>

          {/* Template picker */}
          <div className="card mb-6">
            <h2 className="font-bold mb-4">Choose Template</h2>
            <div className="grid grid-cols-3 gap-4">
              {templates.map(t => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    template === t.id ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}>
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <div className="font-semibold text-sm">{t.label}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{t.desc}</div>
                  {template === t.id && <div className="text-indigo-400 text-xs mt-1 font-medium">✓ Selected</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="card mb-4">
            <h2 className="font-bold mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Full Name", key: "name" }, { label: "Title/Designation", key: "title" },
                { label: "Email", key: "email" }, { label: "Phone", key: "phone" },
                { label: "Location", key: "location" }, { label: "LinkedIn", key: "linkedin" },
                { label: "GitHub", key: "github" }, { label: "LeetCode", key: "leetcode" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                  <input className="input-field text-sm" value={(data as Record<string, string>)[f.key] || ""}
                    onChange={e => u(f.key as keyof ResumeData, e.target.value)} placeholder={f.label} />
                </div>
              ))}
            </div>
          </div>

          {/* Profile Summary */}
          <div className="card mb-4">
            <h2 className="font-bold mb-3">Profile Summary</h2>
            <textarea className="input-field text-sm" rows={3}
              placeholder="Computer Science undergraduate with strong programming skills..."
              value={data.summary} onChange={e => u("summary", e.target.value)} />
          </div>

          {/* Skills */}
          <div className="card mb-4">
            <h2 className="font-bold mb-3">Technical Skills</h2>
            <p className="text-xs text-slate-500 mb-2">One category per line. Format: Category: skill1, skill2</p>
            <textarea className="input-field text-sm" rows={5}
              placeholder={"Languages: Python, JavaScript, C, C++, Java\nAI/ML: Machine Learning, Deep Learning, NLP\nWeb Dev: React.js, HTML, CSS, REST API\nDatabases: SQL, PostgreSQL\nTools: Git, GitHub, VS Code"}
              value={data.skills} onChange={e => u("skills", e.target.value)} />
          </div>

          {/* Education */}
          <div className="card mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Education</h2>
              <button onClick={() => setData(d => ({ ...d, education: [...d.education, { college: "", degree: "", year: "", gpa: "" }] }))}
                className="text-indigo-400 text-sm hover:text-indigo-300">+ Add</button>
            </div>
            {data.education.map((edu, i) => (
              <div key={i} className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/5 last:border-0">
                {[
                  { label: "College/University", key: "college", placeholder: "Banasthali Vidyapith, Jaipur" },
                  { label: "Degree", key: "degree", placeholder: "B.Tech in Computer Science" },
                  { label: "Year", key: "year", placeholder: "2023 – 2027" },
                  { label: "CGPA/Percentage", key: "gpa", placeholder: "9.15 / 10" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                    <input className="input-field text-sm" value={(edu as Record<string, string>)[f.key]}
                      onChange={e => uEdu(i, f.key, e.target.value)} placeholder={f.placeholder} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="card mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Projects</h2>
              <button onClick={() => setData(d => ({ ...d, projects: [...d.projects, { title: "", tech: "", desc: "", points: "" }] }))}
                className="text-indigo-400 text-sm hover:text-indigo-300">+ Add</button>
            </div>
            {data.projects.map((proj, i) => (
              <div key={i} className="mb-4 pb-4 border-b border-white/5 last:border-0">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Project Title</label>
                    <input className="input-field text-sm" value={proj.title} onChange={e => uProj(i, "title", e.target.value)} placeholder="AI Spam Detection System" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Tech Stack</label>
                    <input className="input-field text-sm" value={proj.tech} onChange={e => uProj(i, "tech", e.target.value)} placeholder="Python, Scikit-learn, Streamlit" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Bullet Points (one per line)</label>
                  <textarea className="input-field text-sm" rows={4} value={proj.points}
                    onChange={e => uProj(i, "points", e.target.value)}
                    placeholder={"Built an NLP pipeline achieving 98% accuracy\nDeployed as interactive Streamlit web app\nBenchmarked 4 ML models using precision, recall, F1-score"} />
                </div>
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="card mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">Work Experience</h2>
              <button onClick={() => setData(d => ({ ...d, experience: [...d.experience, { company: "", role: "", duration: "", points: "" }] }))}
                className="text-indigo-400 text-sm hover:text-indigo-300">+ Add</button>
            </div>
            {data.experience.map((exp, i) => (
              <div key={i} className="mb-4 pb-4 border-b border-white/5 last:border-0">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[
                    { label: "Company", key: "company", placeholder: "Google" },
                    { label: "Role", key: "role", placeholder: "Software Engineer Intern" },
                    { label: "Duration", key: "duration", placeholder: "Jun 2024 – Aug 2024" },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs text-slate-400 mb-1">{f.label}</label>
                      <input className="input-field text-sm" value={(exp as Record<string, string>)[f.key]}
                        onChange={e => uExp(i, f.key, e.target.value)} placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Bullet Points (one per line)</label>
                  <textarea className="input-field text-sm" rows={3} value={exp.points}
                    onChange={e => uExp(i, "points", e.target.value)}
                    placeholder="Built REST API reducing latency by 40%" />
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="card mb-6">
            <h2 className="font-bold mb-3">Certifications</h2>
            <p className="text-xs text-slate-500 mb-2">One certification per line</p>
            <textarea className="input-field text-sm" rows={4}
              placeholder={"Getting Started with Artificial Intelligence — IBM SkillsBuild\nData Analytics Virtual Experience — Deloitte Australia, Forage\nAI-Powered Performance Ads Certification — Google Skillshop"}
              value={data.certifications} onChange={e => u("certifications", e.target.value)} />
          </div>

          <button onClick={() => setPreview(true)} className="btn-primary w-full py-3 text-base">
            👁️ Preview Resume
          </button>
        </div>
      ) : (
        <div className="resume-preview-wrap">
          <div className="no-print flex justify-center gap-3 py-4 border-b border-white/10">
            {templates.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  template === t.id ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
                }`}>{t.icon} {t.label}</button>
            ))}
          </div>
          {template === "classic" && <ClassicResume />}
          {template === "minimal" && <MinimalResume />}
          {template === "modern"  && <ModernResume />}
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; margin: 0 !important; }
          .resume-preview-wrap { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}
