import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/user";
import VerificationToken, { generateOTP } from "@/lib/db/models/verification-token";
import { sendVerificationEmail } from "@/lib/email/resend";
import { checkAuthRateLimit } from "@/lib/utils/rate-limit";

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
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal whether the user exists
      return NextResponse.json({ message: "If an account exists, a new code has been sent." }, { status: 200 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
    }

    // Delete existing verification tokens
    await VerificationToken.deleteMany({ userId: user._id, type: "email-verification" });

    // Generate new OTP
    const otp = generateOTP();
    await VerificationToken.create({
      userId: user._id,
      token: otp,
      type: "email-verification",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    await sendVerificationEmail(user.email, user.name, otp);

    return NextResponse.json({ message: "Verification code sent" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
