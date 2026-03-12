import { Resend } from "resend";
import {
  verificationEmailHtml,
  passwordResetEmailHtml,
  welcomeEmailHtml,
} from "./templates";

const resend = new Resend(process.env.RESEND_API_KEY);

const fromAddress = process.env.RESEND_FROM_EMAIL || "LinkedBoost <noreply@linkedboost.app>";

async function sendEmail(to: string, subject: string, html: string) {
  const { error } = await resend.emails.send({
    from: fromAddress,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend email error: ${error.message}`);
  }
}

export async function sendVerificationEmail(email: string, name: string, otp: string) {
  await sendEmail(
    email,
    "Verify your email — LinkedBoost",
    verificationEmailHtml(name, otp)
  );
}

export async function sendPasswordResetEmail(email: string, name: string, resetToken: string) {
  await sendEmail(
    email,
    "Reset your password — LinkedBoost",
    passwordResetEmailHtml(name, resetToken)
  );
}

export async function sendWelcomeEmail(email: string, name: string) {
  await sendEmail(
    email,
    "Welcome to LinkedBoost! 🚀",
    welcomeEmailHtml(name)
  );
}
