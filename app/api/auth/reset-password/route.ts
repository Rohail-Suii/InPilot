import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db/connection";
import User from "@/lib/db/models/user";
import VerificationToken from "@/lib/db/models/verification-token";
import { checkAuthRateLimit } from "@/lib/utils/rate-limit";
import { resetPasswordSchema } from "@/lib/validators";

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
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { token, password } = parsed.data;

    await connectDB();

    const tokenDoc = await VerificationToken.findOne({
      token,
      type: "password-reset",
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    const user = await User.findById(tokenDoc.userId).select("+hashedPassword");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);
    user.hashedPassword = hashedPassword;
    await user.save();

    // Clean up all reset tokens for this user
    await VerificationToken.deleteMany({ userId: user._id, type: "password-reset" });

    return NextResponse.json({ message: "Password reset successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
