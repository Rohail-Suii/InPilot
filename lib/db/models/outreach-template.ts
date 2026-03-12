import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IOutreachTemplate extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const OutreachTemplateSchema = new Schema<IOutreachTemplate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 5000 },
  },
  { timestamps: true }
);

OutreachTemplateSchema.index({ userId: 1 });

const OutreachTemplate: Model<IOutreachTemplate> =
  mongoose.models.OutreachTemplate ||
  mongoose.model<IOutreachTemplate>("OutreachTemplate", OutreachTemplateSchema);

export default OutreachTemplate;
