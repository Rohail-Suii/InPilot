import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IScraperConfig extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: "posts" | "profiles" | "companies";
  keywords: string[];
  filters: Record<string, unknown>;
  schedule?: string;
  isActive: boolean;
  maxResults: number;
  createdAt: Date;
  updatedAt: Date;
}

const ScraperConfigSchema = new Schema<IScraperConfig>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["posts", "profiles", "companies"],
      required: true,
    },
    keywords: [String],
    filters: { type: Schema.Types.Mixed, default: {} },
    schedule: String,
    isActive: { type: Boolean, default: true },
    maxResults: { type: Number, default: 50 },
  },
  { timestamps: true }
);

ScraperConfigSchema.index({ userId: 1 });
ScraperConfigSchema.index({ userId: 1, isActive: 1 });

const ScraperConfig: Model<IScraperConfig> =
  mongoose.models.ScraperConfig ||
  mongoose.model<IScraperConfig>("ScraperConfig", ScraperConfigSchema);

export default ScraperConfig;
