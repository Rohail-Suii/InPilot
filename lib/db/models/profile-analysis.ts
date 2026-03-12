import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISectionScore {
  score: number;
  current?: string;
  suggestion?: string;
  suggestions?: string[];
  missing?: string[];
}

export interface IProfileAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  linkedinUrl: string;
  overallScore: number;
  sections: {
    headline: { score: number; current: string; suggestion: string };
    summary: { score: number; current: string; suggestion: string };
    experience: { score: number; suggestions: string[] };
    skills: { score: number; missing: string[]; suggestions: string[] };
    education: { score: number };
  };
  recommendations: string[];
  analyzedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileAnalysisSchema = new Schema<IProfileAnalysis>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    linkedinUrl: { type: String, default: "" },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    sections: {
      headline: {
        score: { type: Number, default: 0 },
        current: { type: String, default: "" },
        suggestion: { type: String, default: "" },
      },
      summary: {
        score: { type: Number, default: 0 },
        current: { type: String, default: "" },
        suggestion: { type: String, default: "" },
      },
      experience: {
        score: { type: Number, default: 0 },
        suggestions: [String],
      },
      skills: {
        score: { type: Number, default: 0 },
        missing: [String],
        suggestions: [String],
      },
      education: {
        score: { type: Number, default: 0 },
      },
    },
    recommendations: [String],
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ProfileAnalysisSchema.index({ userId: 1 }, { unique: true });

const ProfileAnalysis: Model<IProfileAnalysis> =
  mongoose.models.ProfileAnalysis ||
  mongoose.model<IProfileAnalysis>("ProfileAnalysis", ProfileAnalysisSchema);

export default ProfileAnalysis;
