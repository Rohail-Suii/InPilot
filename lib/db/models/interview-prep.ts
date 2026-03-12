import mongoose, { Schema, type Document, type Model } from "mongoose";

export type InterviewQuestionCategory = "behavioral" | "technical" | "situational" | "company";

export interface IInterviewQuestion {
  question: string;
  suggestedAnswer: string;
  category: InterviewQuestionCategory;
}

export interface ICompanyResearch {
  overview: string;
  culture: string;
  recentNews: string[];
  competitors: string[];
}

export interface ISalaryInsights {
  min: number;
  max: number;
  median: number;
  source: string;
}

export interface IInterviewPrep extends Document {
  userId: mongoose.Types.ObjectId;
  jobApplicationId: mongoose.Types.ObjectId;
  jobTitle: string;
  company: string;
  questions: IInterviewQuestion[];
  companyResearch: ICompanyResearch;
  salaryInsights: ISalaryInsights;
  createdAt: Date;
  updatedAt: Date;
}

const InterviewPrepSchema = new Schema<IInterviewPrep>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    jobApplicationId: { type: Schema.Types.ObjectId, ref: "JobApplication", required: true },
    jobTitle: { type: String, required: true },
    company: { type: String, required: true },
    questions: [
      {
        question: { type: String, required: true },
        suggestedAnswer: { type: String, required: true },
        category: {
          type: String,
          enum: ["behavioral", "technical", "situational", "company"],
          required: true,
        },
      },
    ],
    companyResearch: {
      overview: { type: String, default: "" },
      culture: { type: String, default: "" },
      recentNews: [String],
      competitors: [String],
    },
    salaryInsights: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      median: { type: Number, default: 0 },
      source: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

InterviewPrepSchema.index({ userId: 1 });
InterviewPrepSchema.index({ jobApplicationId: 1 });

const InterviewPrep: Model<IInterviewPrep> =
  mongoose.models.InterviewPrep ||
  mongoose.model<IInterviewPrep>("InterviewPrep", InterviewPrepSchema);

export default InterviewPrep;
