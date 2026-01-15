import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET() {
  try {
    const authUser = await getCurrentUser();

    if (!authUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await dbConnect();

    // Fetch full user data from database
    const user = await User.findById(authUser.userId)
      .select(
        "email name totalTokensUsed promptTokensUsed completionTokensUsed"
      )
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: authUser.userId,
          email: user.email,
          name: user.name,
          totalTokensUsed: user.totalTokensUsed || 0,
          promptTokensUsed: user.promptTokensUsed || 0,
          completionTokensUsed: user.completionTokensUsed || 0,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
