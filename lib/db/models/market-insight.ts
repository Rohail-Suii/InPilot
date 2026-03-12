import mongoose, { Schema, type Document, type Model } from "mongoose";

export type MarketInsightType = "trend" | "salary" | "skill-demand" | "hiring";

export interface IMarketInsight extends Document {
  userId: mongoose.Types.ObjectId;
  type: MarketInsightType;
  title: string;
  data: Record<string, unknown>;
  period: string;
  createdAt: Date;
  updatedAt: Date;
}

const MarketInsightSchema = new Schema<IMarketInsight>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["trend", "salary", "skill-demand", "hiring"],
      required: true,
    },
    title: { type: String, required: true },
    data: { type: Schema.Types.Mixed, default: {} },
    period: { type: String, default: "" },
  },
  { timestamps: true }
);

MarketInsightSchema.index({ userId: 1, type: 1 });
MarketInsightSchema.index({ period: 1 });
// Auto-delete market insights after 30 days
MarketInsightSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const MarketInsight: Model<IMarketInsight> =
  mongoose.models.MarketInsight ||
  mongoose.model<IMarketInsight>("MarketInsight", MarketInsightSchema);

export default MarketInsight;
