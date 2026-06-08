# SkillSync AI 🚀

> Your personalized AI-powered tech career platform — Generate roadmaps, verify skills with quizzes, practice interviews, and track your journey to your dream tech role.

🔗 **Live Demo:** [skillsync-ai-client.vercel.app](https://skillsync-ai-client.vercel.app)

---

## ✨ Features

- 🗺️ **Personalized Roadmap** — Tailored skill roadmap for your goal role with timelines and resources
- 🎯 **Quiz-Gated Skill Verification** — Must pass a quiz (60%+) to mark a skill completed. No fake progress.
- 🤖 **AI Mentor Chat** — Powered by Llama 3.3 70B via Groq. Knows your roadmap and gives personalized advice.
- 💼 **Interview Prep** — DSA, Technical and HR questions for your specific role
- 🎤 **Mock Interview Simulator** — Timed interviews with hints, scoring and ideal answers
- 📊 **Analytics Dashboard** — XP, streaks, completion rate and progress charts
- 📅 **AI Study Plan** — Day-by-day schedule based on your remaining skills
- 🎯 **Job Match Analyzer** — Paste any JD and see your skill gap instantly
- 📄 **Resume Builder** — 3 professional templates, download as PDF
- 🏆 **Leaderboard** — Compete with other learners on XP and skills

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB, Mongoose |
| AI | Groq API, Llama 3.3 70B |
| Auth | JWT, bcrypt |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## 🚀 Getting Started

```bash
git clone https://github.com/shivee11code/skillsync-ai.git
cd skillsync-ai
```

### Backend
```bash
cd server
npm install
# Add MONGODB_URI, JWT_SECRET, GROQ_API_KEY to .env
npm run dev
```

### Frontend
```bash
cd client
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
npm run dev
```

---

## 👩‍💻 Built By

**Shivanshi Shukla** — B.Tech Computer Science Student

⭐ Star this repo if you found it useful!
