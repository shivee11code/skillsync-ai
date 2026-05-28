import { Response } from "express";
import { AuthRequest } from "../middleware/auth";

const INTERVIEW_QUESTIONS: Record<string, Array<{question:string;type:string;idealKeywords:string[];sampleAnswer:string}>> = {
  "Full Stack SDE": [
    { question: "Explain the difference between REST and GraphQL.", type: "Technical", idealKeywords: ["rest","graphql","endpoint","query","overfetching","schema"], sampleAnswer: "REST uses multiple endpoints, each returning fixed data. GraphQL uses a single endpoint where clients request exactly the data they need, avoiding over/under-fetching." },
    { question: "What is the event loop in Node.js?", type: "Technical", idealKeywords: ["single thread","call stack","event queue","non-blocking","asynchronous","libuv"], sampleAnswer: "Node.js runs on a single thread. The event loop handles async operations by delegating I/O to libuv and executing callbacks when they complete, keeping the main thread free." },
    { question: "How does JWT authentication work?", type: "Technical", idealKeywords: ["header","payload","signature","token","secret","verify","stateless"], sampleAnswer: "JWT has three parts: header, payload, signature. Server signs the token with a secret. Client sends it in each request header. Server verifies the signature without storing session." },
    { question: "Tell me about a challenging project you built.", type: "Behavioural", idealKeywords: ["challenge","solution","team","learned","impact","built","problem"], sampleAnswer: "Use STAR method: Situation, Task, Action, Result. Describe a specific project, the problem you solved, steps you took, and measurable outcome." },
    { question: "How would you design a URL shortener like bit.ly?", type: "System Design", idealKeywords: ["hash","database","redirect","cache","load balancer","scale","unique"], sampleAnswer: "Generate a unique 6-char hash for each URL, store in DB. On access, look up hash and redirect. Use Redis cache for popular URLs. Handle collisions and scale with load balancers." },
  ],
  "AI Engineer": [
    { question: "What is the difference between supervised and unsupervised learning?", type: "Technical", idealKeywords: ["labeled","unlabeled","classification","clustering","training","features"], sampleAnswer: "Supervised learning uses labeled data to train models for classification/regression. Unsupervised learning finds patterns in unlabeled data through clustering or dimensionality reduction." },
    { question: "Explain how transformers work.", type: "Technical", idealKeywords: ["attention","self-attention","encoder","decoder","embedding","position","query key value"], sampleAnswer: "Transformers use self-attention to weigh the importance of each word relative to others. Encoder processes input, decoder generates output. Positional encoding handles sequence order." },
    { question: "What is RAG and when would you use it?", type: "Technical", idealKeywords: ["retrieval","augmented","generation","vector","database","context","embedding"], sampleAnswer: "RAG retrieves relevant documents from a vector database and passes them as context to an LLM. Used when you need up-to-date or domain-specific answers beyond the model's training data." },
    { question: "How do you prevent overfitting in ML models?", type: "Technical", idealKeywords: ["regularization","dropout","cross-validation","early stopping","more data","L1 L2"], sampleAnswer: "Use regularization (L1/L2), dropout layers, cross-validation, early stopping, data augmentation, or gather more training data." },
    { question: "Describe a time you improved model performance.", type: "Behavioural", idealKeywords: ["metric","accuracy","experiment","feature","tuning","improvement","baseline"], sampleAnswer: "Mention the baseline metric, what you tried (feature engineering, hyperparameter tuning, architecture changes), and the final improvement with numbers." },
  ],
  "Data Scientist": [
    { question: "What is the bias-variance tradeoff?", type: "Technical", idealKeywords: ["bias","variance","overfitting","underfitting","complexity","generalize"], sampleAnswer: "High bias = model too simple, underfits. High variance = model too complex, overfits. The goal is to find the sweet spot that generalizes well to unseen data." },
    { question: "How do you handle missing data?", type: "Technical", idealKeywords: ["imputation","mean","median","drop","flag","model","MCAR MAR MNAR"], sampleAnswer: "Depends on why data is missing. Drop rows if MCAR and few. Impute with mean/median/mode for numerical. Use model-based imputation for complex patterns. Add a 'missing' flag column." },
    { question: "Explain p-value in simple terms.", type: "Technical", idealKeywords: ["null hypothesis","probability","significance","0.05","reject","chance"], sampleAnswer: "P-value is the probability of seeing results as extreme as observed, assuming the null hypothesis is true. If p < 0.05, we reject the null hypothesis — the result is statistically significant." },
    { question: "What is feature engineering?", type: "Technical", idealKeywords: ["transform","create","encode","normalize","extract","domain","improve"], sampleAnswer: "Feature engineering is creating or transforming input variables to improve model performance. Includes encoding categoricals, normalizing numerics, creating interaction terms, extracting date parts." },
    { question: "How would you explain your model to a non-technical stakeholder?", type: "Behavioural", idealKeywords: ["simple","analogy","visual","impact","business","accuracy","decision"], sampleAnswer: "Avoid jargon. Use analogies and visuals. Focus on business impact: 'The model correctly identifies 85% of churning customers, saving the company $X monthly.'" },
  ],
  "DevOps Engineer": [
    { question: "What is the difference between Docker and a VM?", type: "Technical", idealKeywords: ["container","hypervisor","kernel","lightweight","isolation","image","os"], sampleAnswer: "VMs virtualize entire OS with hypervisor, heavy. Docker containers share host kernel, are lightweight, start instantly. Containers isolate processes, VMs isolate entire systems." },
    { question: "Explain CI/CD pipeline.", type: "Technical", idealKeywords: ["continuous","integration","delivery","deploy","test","build","automate","pipeline"], sampleAnswer: "CI: developers push code, automated tests run. CD: on success, code is automatically deployed to staging/production. Reduces manual effort and deployment risk." },
    { question: "What is Kubernetes and why use it?", type: "Technical", idealKeywords: ["orchestration","pod","node","cluster","scale","service","deployment","container"], sampleAnswer: "Kubernetes orchestrates containers across a cluster. Handles scaling, self-healing, load balancing, rolling deployments. Use when managing many containers in production." },
    { question: "How do you monitor a production system?", type: "Technical", idealKeywords: ["metrics","logs","alerts","grafana","prometheus","uptime","latency","error rate"], sampleAnswer: "Collect metrics (CPU, memory, latency), logs (application errors), and traces. Set alerts for anomalies. Use Prometheus + Grafana for dashboards. Track SLIs and SLOs." },
    { question: "Tell me about an incident you resolved.", type: "Behavioural", idealKeywords: ["incident","root cause","resolve","downtime","postmortem","learned","team"], sampleAnswer: "Use blameless postmortem format: what happened, timeline, root cause, how you fixed it, what you changed to prevent recurrence." },
  ],
};

const scoreAnswer = (userAnswer: string, idealKeywords: string[]): number => {
  const lower = userAnswer.toLowerCase();
  const matched = idealKeywords.filter(kw => lower.includes(kw.toLowerCase()));
  const lengthScore = Math.min(userAnswer.length / 200, 1) * 20;
  const keywordScore = (matched.length / idealKeywords.length) * 80;
  return Math.min(Math.round(keywordScore + lengthScore), 100);
};

export const getInterviewQuestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { goalRole } = req.params;
    const questions = INTERVIEW_QUESTIONS[decodeURIComponent(goalRole)] || INTERVIEW_QUESTIONS["Full Stack SDE"];
    const safe = questions.map(({ question, type }) => ({ question, type }));
    res.status(200).json({ questions: safe, totalQuestions: safe.length });
  } catch (error) {
    res.status(500).json({ message: "Error fetching interview questions" });
  }
};

export const submitInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { goalRole } = req.params;
    const { answers } = req.body as { answers: string[] };
    const questions = INTERVIEW_QUESTIONS[decodeURIComponent(goalRole)] || INTERVIEW_QUESTIONS["Full Stack SDE"];

    const results = questions.map((q, i) => {
      const userAnswer = answers[i] || "";
      const score = scoreAnswer(userAnswer, q.idealKeywords);
      return {
        question: q.question,
        type: q.type,
        yourAnswer: userAnswer,
        score,
        sampleAnswer: q.sampleAnswer,
        feedback: score >= 70 ? "Strong answer! Good coverage of key concepts." :
                  score >= 40 ? "Decent attempt. Try to include more technical specifics." :
                  "Needs improvement. Review the sample answer and key concepts.",
      };
    });

    const totalScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
    const grade = totalScore >= 80 ? "A" : totalScore >= 60 ? "B" : totalScore >= 40 ? "C" : "D";

    res.status(200).json({
      results,
      totalScore,
      grade,
      message: totalScore >= 70 ? "Excellent! You are interview-ready." :
                totalScore >= 50 ? "Good effort. Practice weak areas and retry." :
                "Keep studying. Review the sample answers and try again.",
    });
  } catch (error) {
    res.status(500).json({ message: "Error submitting interview" });
  }
};
