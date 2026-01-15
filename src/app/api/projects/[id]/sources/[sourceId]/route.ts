import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Source from "@/models/Source";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

// GET - Fetch a single source content for preview
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, sourceId } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
      return NextResponse.json({ error: "Invalid source ID" }, { status: 400 });
    }

    await dbConnect();

    const source = await Source.findOne({
      _id: sourceId,
      projectId: id,
    }).lean();

    if (!source) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        source: {
          _id: source._id,
          fileName: source.fileName,
          content: source.content,
          createdAt: source.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching source:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a source file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, sourceId } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid project ID" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(sourceId)) {
      return NextResponse.json({ error: "Invalid source ID" }, { status: 400 });
    }

    await dbConnect();

    const result = await Source.findOneAndDelete({
      _id: sourceId,
      projectId: id,
    });

    if (!result) {
      return NextResponse.json({ error: "Source not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Source deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting source:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
