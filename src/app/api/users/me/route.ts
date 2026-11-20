import { auth } from "@/auth";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    let userId: string | null = null;
    let userEmail: string | null = null;

    // 1. Try NextAuth session
    const session = await auth();
    if (session?.user?.id) {
      userId = session.user.id;
    } else if (session?.user?.email) {
      userEmail = session.user.email;
    }

    // 2. Try Authorization: Bearer <token> fallback
    const authHeader = req.headers.get("authorization");
    if (!userId && !userEmail && authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.AUTH_SECRET || "fallback_secret") as any;
        userId = decoded.id || decoded.sub;
        userEmail = decoded.email;
      } catch (err) {
        // Token invalid
      }
    }

    if (!userId && !userEmail) {
      return NextResponse.json(
        { message: "Unauthorized. Please log in or provide a valid token." },
        { status: 401 }
      );
    }

    await connectDb();
    const user = userId
      ? await User.findById(userId).select("-password -otp -resetPasswordToken")
      : await User.findOne({ email: userEmail }).select("-password -otp -resetPasswordToken");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching current user: ${error.message || error}` },
      { status: 500 }
    );
  }
}
