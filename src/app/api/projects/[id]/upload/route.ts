import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Source from "@/models/Source";
import { getCurrentUser } from "@/lib/auth";
import mongoose from "mongoose";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFParser = require("pdf2json");

export async function POST(
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

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    let content = "";

    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const pdfParser = new PDFParser(null, 1);

      content = await new Promise((resolve, reject) => {
        pdfParser.on(
          "pdfParser_dataError",
          (errData: { parserError: unknown }) => reject(errData.parserError)
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rawText = pdfData.Pages.map((page: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              return page.Texts.map((text: any) => {
                try {
                  return decodeURIComponent(text.R[0].T);
                } catch {
                  // If decoding fails, return the raw text
                  return text.R[0].T;
                }
              }).join(" ");
            }).join("\n");
            resolve(rawText);
          } catch (err) {
            reject(err);
          }
        });
        pdfParser.parseBuffer(buffer);
      });
    } else if (file.type === "text/plain" || file.type === "text/markdown") {
      content = await file.text();
    } else {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Only PDF and Text/Markdown are supported.",
        },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        { error: "File content is empty" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if file with same name exists, update or create
    // For now, simpler to just create new one or replace
    // Let's create new one
    const source = await Source.create({
      projectId: id,
      fileName: file.name,
      content: content.trim(),
    });

    return NextResponse.json(
      { message: "File uploaded successfully", source },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
