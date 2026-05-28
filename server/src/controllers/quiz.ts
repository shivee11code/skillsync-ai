import { Response } from "express";
import { AuthRequest } from "../middleware/auth";

const QUIZ_BANK: Record<string, Array<{q:string; options:string[]; answer:number; explanation:string}>> = {
  "JavaScript": [
    { q: "What does 'typeof null' return in JavaScript?", options: ["null","undefined","object","string"], answer: 2, explanation: "typeof null returns 'object' — a historical bug in JS that was never fixed." },
    { q: "Which method removes the last element from an array?", options: ["shift()","pop()","splice()","slice()"], answer: 1, explanation: "pop() removes and returns the last element." },
    { q: "What is a closure?", options: ["A loop construct","A function with access to its outer scope","An async pattern","A class method"], answer: 1, explanation: "Closures let inner functions access variables from their enclosing scope." },
    { q: "What does '===' check?", options: ["Value only","Type only","Value and type","Reference"], answer: 2, explanation: "=== is strict equality — checks both value and type without coercion." },
    { q: "Which is NOT a JavaScript data type?", options: ["Symbol","BigInt","Float","undefined"], answer: 2, explanation: "Float is not a JS type. Numbers in JS are all 'number' type." },
  ],
  "React": [
    { q: "What hook manages local component state?", options: ["useEffect","useRef","useState","useContext"], answer: 2, explanation: "useState returns a state value and a setter function." },
    { q: "When does useEffect run by default?", options: ["Only on mount","Only on unmount","After every render","Before every render"], answer: 2, explanation: "useEffect without a dependency array runs after every render." },
    { q: "What is the virtual DOM?", options: ["A browser API","A lightweight JS copy of the real DOM","A CSS framework","A database"], answer: 1, explanation: "React uses a virtual DOM to efficiently diff and update the real DOM." },
    { q: "Which is correct for conditional rendering?", options: ["{if condition}","condition ? <A/> : <B/>","<if>{component}</if>","condition && component"], answer: 1, explanation: "Ternary operators and && are both valid for conditional rendering." },
    { q: "What does the key prop do in lists?", options: ["Styles elements","Helps React identify changed items","Sets tab order","Encrypts data"], answer: 1, explanation: "Keys help React efficiently update only changed list items." },
  ],
  "Node.js": [
    { q: "Node.js uses which event model?", options: ["Multi-threaded","Event-driven non-blocking I/O","Synchronous blocking","Process-based"], answer: 1, explanation: "Node.js is single-threaded with event-driven non-blocking I/O." },
    { q: "Which module handles file operations?", options: ["http","path","fs","os"], answer: 2, explanation: "The 'fs' module provides file system operations." },
    { q: "What is npm?", options: ["Node Process Manager","Node Package Manager","Network Protocol Module","None"], answer: 1, explanation: "npm is the Node Package Manager for installing dependencies." },
    { q: "What does require() do?", options: ["Sends HTTP request","Imports a module","Creates a server","Reads a file"], answer: 1, explanation: "require() imports CommonJS modules in Node.js." },
    { q: "Which is true about Express.js?", options: ["It's a database","It's a frontend framework","It's a minimal Node.js web framework","It replaces Node.js"], answer: 2, explanation: "Express is a minimal, flexible web framework built on top of Node.js." },
  ],
  "Python": [
    { q: "What does len() do?", options: ["Loops through list","Returns length of object","Converts to integer","None of above"], answer: 1, explanation: "len() returns the number of items in an object." },
    { q: "Which is used for list comprehension?", options: ["{}","()","[]","<>"], answer: 2, explanation: "List comprehensions use square brackets: [x for x in range(10)]" },
    { q: "What is a decorator in Python?", options: ["A CSS concept","A function that modifies another function","A class method","A variable type"], answer: 1, explanation: "Decorators wrap functions to extend their behavior using @syntax." },
    { q: "Which keyword defines a generator?", options: ["return","async","yield","generate"], answer: 2, explanation: "yield makes a function a generator, producing values lazily." },
    { q: "What does 'self' refer to in a class?", options: ["The parent class","The current instance","A static method","The module"], answer: 1, explanation: "self refers to the current instance of the class." },
  ],
  "MongoDB": [
    { q: "MongoDB stores data as?", options: ["Tables","XML","BSON documents","CSV"], answer: 2, explanation: "MongoDB stores data as BSON (Binary JSON) documents." },
    { q: "Which method finds one document?", options: ["find()","findOne()","get()","select()"], answer: 1, explanation: "findOne() returns the first document matching the query." },
    { q: "What is an index in MongoDB?", options: ["A unique ID","A data structure for faster queries","A collection name","A schema"], answer: 1, explanation: "Indexes improve query performance by allowing efficient lookups." },
    { q: "Which operator adds to an array field?", options: ["$set","$push","$inc","$add"], answer: 1, explanation: "$push appends a value to an array field." },
    { q: "What is a replica set?", options: ["A backup file","A group of MongoDB instances maintaining same data","A query type","An index type"], answer: 1, explanation: "Replica sets provide redundancy and high availability." },
  ],
  "Docker": [
    { q: "What is a Docker image?", options: ["A running container","A read-only template to create containers","A network config","A volume"], answer: 1, explanation: "Images are read-only templates; containers are running instances of images." },
    { q: "Which file defines a Docker image?", options: ["docker-compose.yml","Dockerfile","package.json",".dockerignore"], answer: 1, explanation: "Dockerfile contains instructions to build a Docker image." },
    { q: "What does docker-compose do?", options: ["Builds single containers","Manages multi-container apps","Pushes to Docker Hub","Monitors containers"], answer: 1, explanation: "docker-compose orchestrates multiple containers defined in a YAML file." },
    { q: "Which command runs a container?", options: ["docker build","docker start","docker run","docker exec"], answer: 2, explanation: "docker run creates and starts a new container from an image." },
    { q: "What is a Docker volume?", options: ["Container memory","Persistent storage outside containers","Network bridge","Image layer"], answer: 1, explanation: "Volumes persist data beyond the container lifecycle." },
  ],
  "TypeScript": [
    { q: "TypeScript is a superset of?", options: ["Java","JavaScript","Python","C#"], answer: 1, explanation: "TypeScript extends JavaScript with static typing." },
    { q: "What does 'interface' do in TypeScript?", options: ["Creates a class","Defines a contract/shape for objects","Imports modules","Declares variables"], answer: 1, explanation: "Interfaces define the shape that objects must conform to." },
    { q: "What is 'any' type?", options: ["Undefined type","Disables type checking","Array type","Async type"], answer: 1, explanation: "'any' opts out of type checking — use sparingly." },
    { q: "What does '?' mean in a type definition?", options: ["Nullable","Optional property","Required","Private"], answer: 1, explanation: "? marks a property as optional in interfaces and types." },
    { q: "What is a generic in TypeScript?", options: ["A global variable","A type placeholder for reusable code","A built-in type","An interface"], answer: 1, explanation: "Generics allow writing reusable code that works with multiple types." },
  ],
};

const DEFAULT_QUESTIONS = [
  { q: "What does REST stand for?", options: ["Remote Execution State Transfer","Representational State Transfer","Resource Endpoint Standard Transfer","None"], answer: 1, explanation: "REST = Representational State Transfer — an architectural style for APIs." },
  { q: "What is Big O notation?", options: ["A sorting algorithm","A way to measure algorithm time/space complexity","A database pattern","A network protocol"], answer: 1, explanation: "Big O describes how runtime or space grows relative to input size." },
  { q: "What is a Git merge conflict?", options: ["A network error","When two branches have incompatible changes","A build error","A missing dependency"], answer: 1, explanation: "Conflicts occur when Git can't automatically merge differing changes." },
  { q: "What does HTTP 401 mean?", options: ["Not Found","Server Error","Unauthorized","Forbidden"], answer: 2, explanation: "401 Unauthorized means authentication is required or failed." },
  { q: "What is a foreign key?", options: ["An encrypted key","A field linking to another table's primary key","A unique index","An API key"], answer: 1, explanation: "Foreign keys establish relationships between database tables." },
];

export const getQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skillName } = req.params;
    const questions = QUIZ_BANK[skillName] || DEFAULT_QUESTIONS;
    // Return questions without answers
    const safeQuestions = questions.map(({ q, options }) => ({ q, options }));
    res.status(200).json({ questions: safeQuestions, skillName });
  } catch (error) {
    res.status(500).json({ message: "Error fetching quiz" });
  }
};

export const submitQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skillName } = req.params;
    const { answers } = req.body as { answers: number[] };
    const questions = QUIZ_BANK[skillName] || DEFAULT_QUESTIONS;

    let correct = 0;
    const results = questions.map((q, i) => {
      const isCorrect = answers[i] === q.answer;
      if (isCorrect) correct++;
      return { question: q.q, yourAnswer: q.options[answers[i]], correctAnswer: q.options[q.answer], isCorrect, explanation: q.explanation };
    });

    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= 60;

    res.status(200).json({ score, passed, correct, total: questions.length, results, message: passed ? `Great job! You scored ${score}%. Skill verified!` : `You scored ${score}%. Need 60% to pass. Review and try again!` });
  } catch (error) {
    res.status(500).json({ message: "Error submitting quiz" });
  }
};
