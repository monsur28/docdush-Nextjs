import connectDB from "@/lib/connectDB"; // Adjust path if needed
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { URL } from "url"; // Import URL parser (Node.js built-in)

// --- GET a specific project by ID ---
export async function GET(req, context) {
  // Use context instead of destructuring params immediately
  let id;
  try {
    // Attempt standard way first, fallback if needed, or just use URL parsing
    id = context.params.id;
    // Alternatively, parse from URL:
    // const pathname = new URL(req.url).pathname;
    // const segments = pathname.split('/');
    // id = segments[segments.length - 1]; // Get last segment

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID format" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("projects");
    const project = await collection.findOne({ _id: new ObjectId(id) });

    if (!project) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error(`API GET Error (ID attempted: ${id || "unknown"}):`, error);
    // Check if the error might be related to accessing params early
    if (error instanceof TypeError && error.message.includes("params")) {
      return NextResponse.json(
        { success: false, message: "Error accessing route parameters." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Unable to fetch project" },
      { status: 500 }
    );
  }
}

// --- PUT (Update - Full Replace Semantics) a specific project by ID ---
export async function PUT(req, context) {
  // Use context
  let id;
  try {
    id = context.params.id;
    // Fallback: const pathname = new URL(req.url).pathname; id = pathname.split('/').pop();

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID format" },
        { status: 400 }
      );
    }

    const updatedData = await req.json();
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No update data provided" },
        { status: 400 }
      );
    }
    if (updatedData.title !== undefined && !updatedData.title.trim()) {
      return NextResponse.json(
        { success: false, message: "Title cannot be empty" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("projects");
    const { _id, ...dataToUpdate } = updatedData;
    dataToUpdate.lastUpdated = new Date();

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: dataToUpdate },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Project not found or no changes made" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully",
        project: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`API PUT Error (ID attempted: ${id || "unknown"}):`, error);
    if (error instanceof TypeError && error.message.includes("params")) {
      return NextResponse.json(
        { success: false, message: "Error accessing route parameters." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Unable to update project" },
      { status: 500 }
    );
  }
}

// --- *** UPDATED PATCH Handler *** ---
export async function PATCH(req, context) {
  // Use context instead of destructuring params
  let id;
  try {
    // *** Alternative way to get ID ***
    // const pathname = new URL(req.url).pathname;
    // const segments = pathname.split('/');
    // id = segments[segments.length - 1]; // Get the last segment

    // *** Or try accessing from context ***
    id = context.params.id;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID format" },
        { status: 400 }
      );
    }

    const patchData = await req.json();
    if (!patchData || Object.keys(patchData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No update data provided for patch" },
        { status: 400 }
      );
    }
    if (
      patchData.featured !== undefined &&
      typeof patchData.featured !== "boolean"
    ) {
      return NextResponse.json(
        { success: false, message: "'featured' field must be a boolean" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("projects");
    const dataToUpdate = { ...patchData };
    dataToUpdate.lastUpdated = new Date();
    delete dataToUpdate._id; // Ensure _id is not in the update payload

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: dataToUpdate },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project patched successfully",
        project: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`API PATCH Error (ID attempted: ${id || "unknown"}):`, error);
    // Specific check if the error is about accessing params
    if (error instanceof TypeError && error.message.includes("params")) {
      return NextResponse.json(
        { success: false, message: "Error accessing route parameters." },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Unable to patch project" },
      { status: 500 }
    );
  }
}

// --- *** UPDATED DELETE Handler *** ---
export async function DELETE(req, contextPromise) {
  let id;

  try {
    // Await the context to access params
    const context = await contextPromise;
    id = context.params.id;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID format" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const collection = db.collection("projects");
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Project deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      `API DELETE Error (ID attempted: ${id || "unknown"}):`,
      error
    );

    if (error instanceof TypeError && error.message.includes("params")) {
      return NextResponse.json(
        { success: false, message: "Error accessing route parameters." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Unable to delete project" },
      { status: 500 }
    );
  }
}
