import connectDb from "@/lib/db";
import { sendMail } from "@/lib/sendMail";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectDb();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "No account found with this email" }, { status: 404 });
    }

    // Generate 6-digit reset OTP
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    await sendMail(
      email,
      "Sapphire IQ RealEstate - Password Reset Code",
      `<div style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name || "User"},</p>
        <p>You requested a password reset for your Sapphire IQ RealEstate account.</p>
        <p>Your password reset code is:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #2563eb;">${resetToken}</h1>
        <p>This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
      </div>`
    );

    return NextResponse.json(
      { message: "Password reset code sent to your email" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: `Failed to process forgot password: ${error.message || error}` },
      { status: 500 }
    );
  }
}
