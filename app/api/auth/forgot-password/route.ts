import dbConnect from "@/lib/mongodb";
import { User } from "@/lib/models";
import crypto from "crypto";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "If an account with that email exists, we sent a reset link." }, { status: 200 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

    // Configure NodeMailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      secure: process.env.EMAIL_SERVER_PORT === "465", // true for 465, false for other ports
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Guardian Kinetic" <no-reply@guardian-kinetic.com>',
      to: email,
      subject: "Action Required: Reset Your Access Key",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #006e1a;">Guardian Kinetic Identity Verification</h2>
          <p>We received a request to reset the access key for your Guardian account.</p>
          <p>To initialize a new key, please click the button below within the next hour:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #006e1a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block;">
              Update Access Key
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email. Your account is still secure.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;" />
          <p style="font-size: 10px; color: #999; text-align: center;">© 2026Guardian Kinetic. Precision Tracking for the Modern Guardian.</p>
        </div>
      `,
    });


    return NextResponse.json({ message: "Reset link sent to your email." }, { status: 200 });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
