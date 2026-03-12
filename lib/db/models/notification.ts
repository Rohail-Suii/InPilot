import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type:
    | "application_submitted"
    | "application_failed"
    | "post_published"
    | "post_scheduled"
    | "lead_found"
    | "limit_warning"
    | "limit_reached"
    | "extension_disconnected"
    | "safety_alert"
    | "error"
    | "info";
  title: string;
  message: string;
  module?: "jobs" | "hero" | "scraper" | "system";
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "application_submitted",
        "application_failed",
        "post_published",
        "post_scheduled",
        "lead_found",
        "limit_warning",
        "limit_reached",
        "extension_disconnected",
        "safety_alert",
        "error",
        "info",
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    module: {
      type: String,
      enum: ["jobs", "hero", "scraper", "system"],
    },
    read: { type: Boolean, default: false },
    actionUrl: String,
  },
  { timestamps: true }
);

NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
// Auto-delete notifications after 30 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
