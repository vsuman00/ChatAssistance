import { NextRequest } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, ModelMessage } from "ai";
import dbConnect from "@/lib/db";
import Project from "@/models/Project";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";

export const maxDuration = 30;

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, projectId } = await request.json();

    if (!projectId || !mongoose.Types.ObjectId.isValid(projectId)) {
      return new Response("Invalid project ID", { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response("Messages are required", { status: 400 });
    }

    await dbConnect();

    // Fetch project to get system prompt and model config
    const project = await Project.findOne({
      _id: projectId,
      owner_id: user.userId,
    }).lean();

    if (!project) {
      return new Response("Project not found", { status: 404 });
    }

    // Fetch sources for context (RAG-lite)
    // We import Source dynamically to avoid circular dependency issues if any, though not expected here
    const { default: Source } = await import("@/models/Source");
    const sources = await Source.find({ projectId })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    let systemSystem = project.system_prompt;
    if (sources.length > 0) {
      const contextText = sources
        .map(
          (s: { fileName: string; content: string }) =>
            `[Source: ${s.fileName}]\n${s.content.substring(0, 5000)}`
        ) // Limit char count per source
        .join("\n\n");
      systemSystem += `\n\nUse the following context to answer the user's questions if relevant:\n\n${contextText}`;
    }

    // Use the model from project config
    const storedModel =
      project.model_config?.model || "meta-llama/llama-3.3-70b-instruct:free";

    // If the model doesn't contain "/" it's not a valid OpenRouter model, use default
    const modelId = storedModel.includes("/")
      ? storedModel
      : "meta-llama/llama-3.3-70b-instruct:free";

    // Save user message
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === "user") {
      const { default: Message } = await import("@/models/Message");
      await Message.create({
        projectId,
        role: "user",
        content: lastMessage.content,
      });
    }

    // Helper function to extract string content from various formats
    const extractStringContent = (content: unknown): string => {
      if (typeof content === "string") {
        return content;
      }
      if (Array.isArray(content)) {
        return content
          .map((item) => {
            if (typeof item === "string") return item;
            if (typeof item === "object" && item !== null) {
              // Handle various content part formats
              if ("text" in item)
                return String((item as { text: unknown }).text);
              if ("content" in item)
                return extractStringContent(
                  (item as { content: unknown }).content
                );
              return JSON.stringify(item);
            }
            return String(item);
          })
          .join("");
      }
      if (typeof content === "object" && content !== null) {
        if ("text" in content)
          return String((content as { text: unknown }).text);
        return JSON.stringify(content);
      }
      return String(content ?? "");
    };

    // Log raw messages for debugging
    console.log("Raw messages received:", JSON.stringify(messages, null, 2));

    // Convert messages to proper format, ensuring we only send role and content as strings
    // Strip any extra fields that might cause validation errors
    const coreMessages: ModelMessage[] = messages
      .filter(
        (m: { role?: string; content?: unknown }) =>
          m.role &&
          (m.role === "user" || m.role === "assistant" || m.role === "system")
      )
      .map((m: { role: string; content: unknown }) => ({
        role: m.role as "user" | "assistant" | "system",
        content: extractStringContent(m.content),
      }));

    console.log("Sanitized messages:", JSON.stringify(coreMessages, null, 2));

    const result = streamText({
      model: openrouter(modelId),
      system: systemSystem,
      messages: coreMessages,
      maxOutputTokens: 1024,
      onFinish: async ({ text }) => {
        // Save assistant message
        const { default: Message } = await import("@/models/Message");
        await Message.create({
          projectId,
          role: "assistant",
          content: text,
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
