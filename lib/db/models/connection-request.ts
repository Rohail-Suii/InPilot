import mongoose, { Schema, type Document, type Model } from "mongoose";

export type ConnectionRequestStatus = "pending" | "sent" | "accepted" | "ignored";

export interface IConnectionRequest extends Document {
  userId: mongoose.Types.ObjectId;
  targetName: string;
  targetHeadline: string;
  targetProfileUrl: string;
  message: string;
  status: ConnectionRequestStatus;
  sentAt?: Date;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConnectionRequestSchema = new Schema<IConnectionRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetName: { type: String, required: true },
    targetHeadline: { type: String, default: "" },
    targetProfileUrl: { type: String, required: true },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "sent", "accepted", "ignored"],
      default: "pending",
    },
    sentAt: Date,
    acceptedAt: Date,
  },
  { timestamps: true }
);

ConnectionRequestSchema.index({ userId: 1, status: 1 });
ConnectionRequestSchema.index({ sentAt: -1 });

const ConnectionRequest: Model<IConnectionRequest> =
  mongoose.models.ConnectionRequest ||
  mongoose.model<IConnectionRequest>("ConnectionRequest", ConnectionRequestSchema);

export default ConnectionRequest;
