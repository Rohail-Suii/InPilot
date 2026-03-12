import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/user";
import VerificationToken, { generateResetToken } from "@/lib/db/models/verification-token";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { checkAuthRateLimit } from "@/lib/utils/rate-limit";
import { forgotPasswordSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimit = await checkAuthRateLimit(ip);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
      );
    }

    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email } = parsed.data;

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { message: "If an account with that email exists, we've sent a password reset link." },
        { status: 200 }
      );
    }

    // Delete existing reset tokens for this user
    await VerificationToken.deleteMany({ userId: user._id, type: "password-reset" });

    // Generate reset token
    const resetToken = generateResetToken();
    await VerificationToken.create({
      userId: user._id,
      token: resetToken,
      type: "password-reset",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    await sendPasswordResetEmail(user.email, user.name, resetToken);

    return NextResponse.json(
      { message: "If an account with that email exists, we've sent a password reset link." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
