import mongoose, { Schema, type Document, type Model } from "mongoose";
import crypto from "crypto";

export interface IVerificationToken extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  token: string;
  type: "email-verification" | "password-reset";
  expiresAt: Date;
  createdAt: Date;
}

const VerificationTokenSchema = new Schema<IVerificationToken>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  type: {
    type: String,
    enum: ["email-verification", "password-reset"],
    required: true,
  },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

VerificationTokenSchema.index({ userId: 1, type: 1 });
VerificationTokenSchema.index({ token: 1 });
VerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate a cryptographically secure token for password reset links
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

const VerificationToken: Model<IVerificationToken> =
  mongoose.models.VerificationToken ||
  mongoose.model<IVerificationToken>("VerificationToken", VerificationTokenSchema);

export default VerificationToken;
