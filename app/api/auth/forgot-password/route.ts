import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      // For security, don't reveal if user exists. 
      // But for this project, we'll be helpful.
      return NextResponse.json({ message: "If an account with that email exists, we sent a reset link." }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    // Mock Email Sending
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log(`[MOCK EMAIL] To: ${email}\nSubject: Password Reset Request\nBody: Please reset your password by clicking here: ${resetUrl}`);

    // In a real app, you would use nodemailer here:
    /*
    const transporter = nodemailer.createTransport({...});
    await transporter.sendMail({
      from: "guardian@kinetic.com",
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset it.</p>`
    });
    */

    return NextResponse.json({ message: "Reset link sent to your email." }, { status: 200 });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
