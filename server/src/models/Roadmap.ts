import mongoose, { Document, Schema } from "mongoose";

export interface ISkillNode {
  skillName: string;
  status: "completed" | "inProgress" | "missing";
  proficiencyLevel: "beginner" | "intermediate" | "advanced";
  resources: string[];
  estimatedWeeks: number;
}

export interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  goalRole: string;
  skills: ISkillNode[];
  projects: { title: string; difficulty: string; techStack: string[]; description: string }[];
  totalXp: number;
}

const SkillNodeSchema = new Schema<ISkillNode>({
  skillName: { type: String, required: true },
  status: { type: String, enum: ["completed", "inProgress", "missing"], default: "missing" },
  proficiencyLevel: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
  resources: { type: [String], default: [] },
  estimatedWeeks: { type: Number, default: 1 },
});

const RoadmapSchema = new Schema<IRoadmap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    goalRole: { type: String, required: true },
    skills: { type: [SkillNodeSchema], default: [] },
    projects: { type: [{ title: String, difficulty: String, techStack: [String], description: String }], default: [] },
    totalXp: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);
