import connectDB from "@/lib/connectDB";
import { verifyToken } from "@/lib/verifyToken";
import { NextResponse } from "next/server";

export async function GET(req) {
  const db = await connectDB();
  const collection = db.collection("projects");

  try {
    const projects = await collection.find({}).toArray();
    return new Response(JSON.stringify(projects), { status: 200 });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: "Unable to fetch projects" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // ✅ Step 1: Token verification
    const decoded = verifyToken(req);

    // ✅ Step 2: Parse and validate input
    const projectData = await req.json();

    if (
      !projectData?.title ||
      !projectData?.category ||
      !projectData?.version
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required project fields (title, category, version).",
        },
        { status: 400 }
      );
    }

    // ✅ Step 3: Insert to DB
    const db = await connectDB();
    const collection = db.collection("projects");

    const dataToInsert = {
      ...projectData,
      createdAt: new Date(projectData.createdAt),
      lastUpdated: new Date(projectData.lastUpdated),
      createdBy: decoded?.userId || null,
    };

    const result = await collection.insertOne(dataToInsert);

    if (result.insertedId) {
      const newProject = await collection.findOne({ _id: result.insertedId });
      return NextResponse.json(
        {
          success: true,
          message: "Project created successfully",
          project: newProject,
        },
        { status: 201 }
      );
    }

    throw new Error("Project insertion failed.");
  } catch (error) {
    console.error("POST /api/projects error:", error.message);
    const message =
      error.message?.includes("token") ||
      error.message?.includes("Unauthorized")
        ? error.message
        : "Unable to create project";

    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
