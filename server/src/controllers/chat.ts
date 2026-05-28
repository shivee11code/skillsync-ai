import { Response } from "express";
import User from "../models/User";
import Roadmap from "../models/Roadmap";
import { AuthRequest } from "../middleware/auth";

const TIPS: Record<string, string[]> = {
  default: [
    "Break your learning into 25-minute focused Pomodoro sessions.",
    "Build projects as soon as you learn a concept — hands-on practice is fastest.",
    "Read official documentation directly — it is the most accurate source.",
    "Contribute to open source projects to get real-world experience.",
    "Teach what you learn — explaining to others solidifies knowledge.",
  ],
  "Full Stack SDE": [
    "Master HTML, CSS, and vanilla JS before jumping to React.",
    "Learn React only after you are comfortable with plain JavaScript.",
    "Build a full stack project connecting frontend and backend — that is where real learning happens.",
    "Understand HTTP methods and REST principles deeply.",
    "Practice system design concepts like caching, load balancing, and databases.",
  ],
  "Frontend Developer": [
    "CSS Flexbox and Grid are essential — master them early.",
    "Build pixel-perfect clones of real websites for practice.",
    "Learn TypeScript early — it makes you a much better React developer.",
    "Understand how browsers render pages and paint the DOM.",
    "Performance matters — learn Core Web Vitals and Lighthouse audits.",
  ],
  "Backend Developer": [
    "Understand databases deeply — indexing and query optimization matter.",
    "Learn REST API design principles and HTTP status codes thoroughly.",
    "Study system design — scalability separates junior from senior devs.",
    "Master async patterns — callbacks, promises, and async/await.",
    "Always validate and sanitize user input on the server side.",
  ],
  "AI Engineer": [
    "Master Python and NumPy before moving to ML frameworks.",
    "Kaggle competitions are great for practical ML experience.",
    "Understand the math behind algorithms — linear algebra and probability matter.",
    "Experiment with LangChain and build a RAG application to understand LLMs.",
    "Read AI research papers on arxiv.org to stay current.",
  ],
  "Data Scientist": [
    "EDA (Exploratory Data Analysis) is where most of the work actually happens.",
    "Learn SQL deeply — it is used in almost every data role.",
    "Visualizations communicate insights — master Matplotlib and Seaborn.",
    "Feature engineering often matters more than the model choice.",
    "Always validate models with proper train/test splits and cross-validation.",
  ],
  "DevOps Engineer": [
    "Learn Linux command line deeply — it is the foundation of DevOps.",
    "Docker is non-negotiable — containerize everything you build.",
    "CI/CD pipelines save hours daily — automate early and often.",
    "Monitor everything — you cannot fix what you cannot measure.",
    "Infrastructure as Code means your infra is reproducible and version-controlled.",
  ],
  "Cloud Engineer": [
    "Start with AWS fundamentals — EC2, S3, IAM, VPC are the core four.",
    "Practice with free tier accounts before taking certifications.",
    "Terraform makes cloud infra repeatable — learn it early.",
    "Security in cloud is your responsibility — learn IAM policies deeply.",
    "Cost optimization is a key cloud skill — monitor your spend.",
  ],
  "Cybersecurity Analyst": [
    "Practice on legal platforms like HackTheBox, TryHackMe, and PicoCTF.",
    "Learn networking deeply — TCP/IP, DNS, HTTP are the foundation.",
    "Get familiar with Kali Linux and basic penetration testing tools.",
    "Study the OWASP Top 10 web vulnerabilities thoroughly.",
    "Work toward certifications like CompTIA Security+ or CEH.",
  ],
  "Mobile App Developer": [
    "Learn React Native with Expo for the fastest cross-platform development.",
    "Performance on mobile is critical — avoid unnecessary re-renders.",
    "Test on real devices, not just simulators.",
    "Understand mobile-specific UX patterns — navigation, gestures, keyboards.",
    "Learn how to publish to both App Store and Google Play early.",
  ],
};

const RESOURCES: Record<string, string> = {
  "Full Stack SDE": "The Odin Project, freeCodeCamp, javascript.info, react.dev, nodejs.org",
  "Frontend Developer": "MDN Web Docs, css-tricks.com, react.dev, web.dev, Frontend Masters",
  "Backend Developer": "nodejs.org docs, PostgreSQL docs, system-design-primer on GitHub",
  "AI Engineer": "fast.ai, Kaggle Learn, HuggingFace docs, LangChain docs, arxiv.org",
  "Data Scientist": "Kaggle Learn, Python for Data Analysis book, Towards Data Science blog",
  "DevOps Engineer": "Linux Journey, TechWorld with Nana YouTube, Docker docs, Kubernetes docs",
  "Cloud Engineer": "AWS Skill Builder, Cloud Quest, freeCodeCamp AWS, Terraform docs",
  "Cybersecurity Analyst": "TryHackMe, HackTheBox, OWASP, Professor Messer YouTube, PortSwigger Academy",
  "Mobile App Developer": "React Native docs, Expo docs, William Candillon YouTube",
};

export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    const user = await User.findById(req.userId).select("-passwordHash");
    const roadmap = await Roadmap.findOne({ userId: req.userId });

    const completedSkills = roadmap?.skills.filter((s) => s.status === "completed").map((s) => s.skillName) || [];
    const missingSkills = roadmap?.skills.filter((s) => s.status === "missing").map((s) => s.skillName) || [];
    const inProgressSkills = roadmap?.skills.filter((s) => s.status === "inProgress").map((s) => s.skillName) || [];

    const goalRole = user?.goalRole || "Full Stack SDE";
    const tips = TIPS[goalRole] || TIPS["default"];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];

    const msg = message.toLowerCase();
    let reply = "";

    if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey") || msg.includes("start")) {
      reply = `Hey ${user?.name?.split(" ")[0] || "there"}! 👋 I am your SkillSync AI mentor.\n\nYou are working toward becoming a **${goalRole}**.\n\n📊 Your progress:\n• ✅ Completed: ${completedSkills.length} skills\n• 🔄 In Progress: ${inProgressSkills.length} skills\n• 📚 Remaining: ${missingSkills.length} skills\n• ⚡ XP: ${user?.xp || 0} | 🔥 Streak: ${user?.streak || 0} days\n\nAsk me anything about learning, projects, resources, or career advice!`;

    } else if (msg.includes("next") || msg.includes("what should i") || msg.includes("suggest") || msg.includes("start with")) {
      if (inProgressSkills.length > 0) {
        reply = `You are currently working on:\n🔄 **${inProgressSkills[0]}** — finish this first!\n\nAfter that, move to:\n${missingSkills.slice(0, 3).map((s, i) => `${i + 1}. **${s}**`).join("\n")}\n\n💡 Tip: ${randomTip}`;
      } else if (missingSkills.length > 0) {
        reply = `Based on your **${goalRole}** roadmap, start with:\n\n${missingSkills.slice(0, 3).map((s, i) => `${i + 1}. **${s}**`).join("\n")}\n\n💡 Tip: ${randomTip}\n\nGo to your Roadmap page and mark skills as "In Progress" when you start them!`;
      } else {
        reply = `🎉 Amazing! You have completed all skills in your roadmap!\n\nNext steps:\n1. Build your capstone project\n2. Contribute to open source on GitHub\n3. Apply for internships or jobs\n4. Practice on LeetCode daily\n\n${randomTip}`;
      }

    } else if (msg.includes("project") || msg.includes("build") || msg.includes("practice")) {
      reply = `Great initiative! Here are project ideas for **${goalRole}**:\n\n🟢 **Beginner:** Start with a project using your completed skills\n🟡 **Intermediate:** Combine frontend + backend + database\n🔴 **Advanced:** Add auth, deploy it, and put it on GitHub\n\nCheck your **Dashboard → Suggested Projects** for role-specific ideas with tech stacks!\n\n💡 ${randomTip}`;

    } else if (msg.includes("resource") || msg.includes("course") || msg.includes("learn from") || msg.includes("where to") || msg.includes("tutorial")) {
      reply = `Best free resources for **${goalRole}**:\n\n📚 ${RESOURCES[goalRole] || "freeCodeCamp, The Odin Project, official documentation"}\n\nAlso check your **Roadmap page** — each skill card shows specific resource links!\n\n💡 ${randomTip}`;

    } else if (msg.includes("progress") || msg.includes("how am i") || msg.includes("status") || msg.includes("score")) {
      const done = completedSkills.length;
      const total = roadmap?.skills.length || 0;
      const percent = total > 0 ? Math.round((done / total) * 100) : 0;
      reply = `📊 Your **${goalRole}** progress report:\n\n✅ Completed: ${done} skills\n🔄 In Progress: ${inProgressSkills.length} skills\n📚 Remaining: ${missingSkills.length} skills\n📈 Overall: **${percent}% done**\n⚡ XP Earned: ${user?.xp || 0}\n🔥 Streak: ${user?.streak || 0} days\n\n${percent < 30 ? "You are just getting started — consistency is key! 💪" : percent < 70 ? "Great progress! You are past the halfway mark! 🚀" : "Almost there — finish strong! 🏆"}`;

    } else if (msg.includes("motivation") || msg.includes("stuck") || msg.includes("hard") || msg.includes("difficult") || msg.includes("give up") || msg.includes("frustrated")) {
      reply = `I hear you — it is completely normal to feel stuck! 💪 Every developer has been there.\n\n${randomTip}\n\nRemember:\n• Consistency beats intensity — 30 min daily > 5 hours once a week\n• Every expert was once a beginner\n• You have already earned **${user?.xp || 0} XP** — that is real progress!\n\nWhat specific topic are you stuck on? I can help break it down!`;

    } else if (msg.includes("time") || msg.includes("long") || msg.includes("how long") || msg.includes("when")) {
      const weeks = Math.round(missingSkills.length * 1.5);
      reply = `⏱️ Based on your current progress:\n\n📚 Skills remaining: ${missingSkills.length}\n📅 Estimated time: **${weeks} weeks** at 2-3 hours/day\n\nThis is faster if you:\n• Study every day (even 30 min counts)\n• Build projects while learning\n• Focus on one skill at a time\n• Use your Weekly Planner feature!\n\nGo to **Dashboard → Weekly Planner** to auto-generate your study schedule.`;

    } else if (msg.includes("job") || msg.includes("internship") || msg.includes("placement") || msg.includes("hired") || msg.includes("salary")) {
      reply = `🎯 Career advice for **${goalRole}**:\n\n1. **Portfolio** — Build 2-3 strong projects on GitHub\n2. **Resume** — Use the Resume Builder in your dashboard\n3. **Interview Prep** — Practice DSA on LeetCode daily\n4. **Mock Interviews** — Use the Mock Interview feature\n5. **Network** — Connect with developers on LinkedIn\n\nTop companies hiring ${goalRole}s: Google, Amazon, Microsoft, Flipkart, Swiggy, Razorpay, startups!\n\n💡 ${randomTip}`;

    } else if (msg.includes("dsa") || msg.includes("leetcode") || msg.includes("algorithm") || msg.includes("data structure")) {
      reply = `💻 DSA practice roadmap:\n\n**Week 1-2:** Arrays, Strings, Hashing\n**Week 3-4:** Two Pointers, Sliding Window, Stack/Queue\n**Week 5-6:** Recursion, Binary Search, Sorting\n**Week 7-8:** Trees, Graphs, BFS/DFS\n**Week 9-10:** Dynamic Programming\n\nPlatforms: LeetCode (most important), HackerRank, GeeksforGeeks\n\nStart with Easy problems, then Medium. Aim for 2-3 problems daily!\n\nUse **Interview Prep** in your dashboard for role-specific questions!`;

    } else if (msg.includes("resume") || msg.includes("cv")) {
      reply = `📄 Resume tips for **${goalRole}**:\n\n1. Keep it **1 page** for freshers\n2. Lead with your strongest projects\n3. Use action verbs: Built, Designed, Implemented, Optimized\n4. Include tech stack and measurable impact\n5. Add GitHub link with active repositories\n\nUse the **Resume Builder** in your dashboard to create a professional resume!\n\n💡 ${randomTip}`;

    } else if (msg.includes("github") || msg.includes("portfolio") || msg.includes("open source")) {
      reply = `🐙 GitHub portfolio tips:\n\n1. **Pin 4-6 best projects** on your profile\n2. Write clear READMEs with screenshots\n3. Add live demo links to all projects\n4. Commit regularly — green squares matter!\n5. Star and fork repos in your tech area\n\nUse the **GitHub Analyzer** in your dashboard to analyze your profile!\n\nYour GitHub should tell your story as a developer. Make it count! 💪`;

    } else {
      reply = `Thanks for your question about "${message}"! 🤔\n\nFor your **${goalRole}** journey:\n\n💡 ${randomTip}\n\n${missingSkills.length > 0 ? `Your next recommended skills: **${missingSkills.slice(0, 2).join("** and **")}**` : "🎉 You have completed all skills!"}\n\nYou have earned **${user?.xp || 0} XP** — keep going! 💪\n\nAsk me about: next steps, projects, resources, progress, DSA, jobs, resume, or motivation!`;
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Error processing message" });
  }
};
