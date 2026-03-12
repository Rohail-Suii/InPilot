import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validators";
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
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    await connectDB();

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    }).lean();

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      hashedPassword,
    });

    // Generate verification OTP and send email
    const otp = generateOTP();
    await VerificationToken.create({
      userId: user._id,
      token: otp,
      type: "email-verification",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    });

    await sendVerificationEmail(user.email, user.name, otp);

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        },
        requiresVerification: true,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
