import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IDailyUsage extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  actions: {
    applies: number;
    posts: number;
    scrapes: number;
    profileViews: number;
    messages: number;
  };
}

const DailyUsageSchema = new Schema<IDailyUsage>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  actions: {
    applies: { type: Number, default: 0 },
    posts: { type: Number, default: 0 },
    scrapes: { type: Number, default: 0 },
    profileViews: { type: Number, default: 0 },
    messages: { type: Number, default: 0 },
  },
});

DailyUsageSchema.index({ userId: 1, date: 1 }, { unique: true });

const DailyUsage: Model<IDailyUsage> =
  mongoose.models.DailyUsage ||
  mongoose.model<IDailyUsage>("DailyUsage", DailyUsageSchema);

export default DailyUsage;
