import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { getCurrentUser } from "@/lib/auth";

// GET all projects for the current user
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const projects = await Project.find({ owner_id: user.userId })
      .sort({ created_at: -1 })
      .lean();

    return NextResponse.json({ projects }, { status: 200 });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create a new project
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, system_prompt, model_config } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Project name is required" },
        { status: 400 }
      );
    }

    const project = new Project({
      owner_id: user.userId,
      name: name.trim(),
      system_prompt: system_prompt || "You are a helpful AI assistant.",
      model_config: model_config || { provider: "openai", model: "gpt-4o" },
    });

    await project.save();

    return NextResponse.json(
      {
        message: "Project created successfully",
        project: {
          id: project._id,
          name: project.name,
          system_prompt: project.system_prompt,
          model_config: project.model_config,
          createdAt: project.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
