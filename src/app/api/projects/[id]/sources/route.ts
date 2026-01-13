import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Source from "@/models/Source";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const sources = await Source.find({ projectId: id })
      .select("_id fileName createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        sources: sources.map((s) => ({
          ...s,
          uploadedAt: s.createdAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching sources:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
