import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IJobSearch extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  keywords: string;
  location?: string;
  remote: boolean;
  experienceLevel: string[];
  datePosted: string;
  easyApplyOnly: boolean;
  salary?: { min?: number; max?: number };
  excludeCompanies: string[];
  excludeKeywords: string[];
  isActive: boolean;
  schedule?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSearchSchema = new Schema<IJobSearch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    keywords: { type: String, required: true },
    location: String,
    remote: { type: Boolean, default: false },
    experienceLevel: [
      {
        type: String,
        enum: ["internship", "entry", "associate", "mid-senior", "director", "executive"],
      },
    ],
    datePosted: {
      type: String,
      enum: ["any", "past-24h", "past-week", "past-month"],
      default: "any",
    },
    easyApplyOnly: { type: Boolean, default: true },
    salary: {
      min: Number,
      max: Number,
    },
    excludeCompanies: [String],
    excludeKeywords: [String],
    isActive: { type: Boolean, default: true },
    schedule: String,
  },
  { timestamps: true }
);

JobSearchSchema.index({ userId: 1 });
JobSearchSchema.index({ userId: 1, isActive: 1 });

const JobSearch: Model<IJobSearch> =
  mongoose.models.JobSearch ||
  mongoose.model<IJobSearch>("JobSearch", JobSearchSchema);

export default JobSearch;
