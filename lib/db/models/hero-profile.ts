import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IHeroProfile extends Document {
  userId: mongoose.Types.ObjectId;
  niche: string;
  targetAudience: string;
  contentPillars: string[];
  postingSchedule: {
    days: number[];
    timesPerWeek: number;
    preferredTimes: string[];
  };
  groups: {
    groupId: string;
    name: string;
    url: string;
    joined: boolean;
    joinedAt?: Date;
  }[];
  hashtags: string[];
  voiceTone: "professional" | "casual" | "inspirational" | "educational" | "humorous";
  contentQueue: {
    content: string;
    scheduledFor?: Date;
    status: "draft" | "scheduled" | "posted" | "failed";
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const HeroProfileSchema = new Schema<IHeroProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    niche: { type: String, required: true },
    targetAudience: { type: String, default: "" },
    contentPillars: [String],
    postingSchedule: {
      days: [Number],
      timesPerWeek: { type: Number, default: 3 },
      preferredTimes: [String],
    },
    groups: [
      {
        groupId: String,
        name: String,
        url: String,
        joined: { type: Boolean, default: false },
        joinedAt: Date,
      },
    ],
    hashtags: [String],
    voiceTone: {
      type: String,
      enum: ["professional", "casual", "inspirational", "educational", "humorous"],
      default: "professional",
    },
    contentQueue: [
      {
        content: String,
        scheduledFor: Date,
        status: {
          type: String,
          enum: ["draft", "scheduled", "posted", "failed"],
          default: "draft",
        },
      },
    ],
  },
  { timestamps: true }
);

HeroProfileSchema.index({ userId: 1 });

const HeroProfile: Model<IHeroProfile> =
  mongoose.models.HeroProfile ||
  mongoose.model<IHeroProfile>("HeroProfile", HeroProfileSchema);

export default HeroProfile;
