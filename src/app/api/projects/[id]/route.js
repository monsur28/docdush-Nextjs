import connectDB from "@/lib/connectDB";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/verifyToken"; // Make sure this path is correct

// --- GET a specific project by ID ---
export async function GET(req, { params }) {
  // // 1. Verify Token
  // const decodedToken = await verifyToken(req);
  // if (!decodedToken) {
  //   return NextResponse.json(
  //     { success: false, message: "Unauthorized: Invalid or missing token." },
  //     { status: 401 }
  //   );
  // }
  // Optional: const userId = decodedToken.uid;

  let id; // Define id here to be accessible in catch block if needed
  try {
    // 2. Process Request
    id = params.id;

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

    // Success: Return the project data directly
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    console.error(`API GET Error (ID attempted: ${id || "unknown"}):`, error);
    // Generic error handling, token errors handled above
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error: Unable to fetch project",
      },
      { status: 500 } // Status is 500 if error occurs after successful auth
    );
  }
}

// --- PUT (update) ---
export async function PUT(req, { params }) {
  // 1. Verify Token
  const decodedToken = await verifyToken(req);
  if (!decodedToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Invalid or missing token." },
      { status: 401 }
    );
  }
  // Optional: const userId = decodedToken.uid;

  let id;
  try {
    // 2. Process Request
    id = params.id;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID format" },
        { status: 400 }
      );
    }

    const updatedData = await req.json();

    // Basic validation
    if (!updatedData || Object.keys(updatedData).length === 0) {
      return NextResponse.json(
        { success: false, message: "Bad Request: No update data provided" },
        { status: 400 }
      );
    }
    if (updatedData.title !== undefined && !updatedData.title.trim()) {
      return NextResponse.json(
        { success: false, message: "Bad Request: Title cannot be empty" },
        { status: 400 }
      );
    }
    // Add more validation as needed

    const db = await connectDB();
    const collection = db.collection("projects");

    // Prevent _id from being updated
    const { _id, ...dataToUpdate } = updatedData;
    dataToUpdate.lastUpdated = new Date(); // Add update timestamp

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: dataToUpdate },
      { returnDocument: "after" } // Return the updated document
    );

    if (!result) {
      // findOneAndUpdate returns the document or null if not found
      return NextResponse.json(
        { success: false, message: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Project updated successfully",
        project: result, // Return the updated project
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`API PUT Error (ID attempted: ${id || "unknown"}):`, error);
    if (error instanceof SyntaxError) {
      // Check for JSON parsing errors
      return NextResponse.json(
        { success: false, message: "Bad Request: Invalid JSON format." },
        { status: 400 }
      );
    }
    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error: Unable to update project",
      },
      { status: 500 }
    );
  }
}

// --- PATCH ---
export async function PATCH(req, { params }) {
  // 1. Verify Token
  const decodedToken = await verifyToken(req);
  if (!decodedToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Invalid or missing token." },
      { status: 401 }
    );
  }
  // Optional: const userId = decodedToken.uid;

  let id;
  try {
    // 2. Process Request
    id = params.id;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid project ID format" },
        { status: 400 }
      );
    }

    const patchData = await req.json();

    // Basic validation
    if (!patchData || Object.keys(patchData).length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Bad Request: No update data provided for patch",
        },
        { status: 400 }
      );
    }
    if (
      patchData.featured !== undefined &&
      typeof patchData.featured !== "boolean"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Bad Request: 'featured' field must be a boolean",
        },
        { status: 400 }
      );
    }
    // Add more specific field validations as needed

    const db = await connectDB();
    const collection = db.collection("projects");

    // Prepare data, prevent _id update
    const { _id, ...dataToUpdate } = patchData;
    dataToUpdate.lastUpdated = new Date();

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
        project: result, // Return the updated project
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`API PATCH Error (ID attempted: ${id || "unknown"}):`, error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, message: "Bad Request: Invalid JSON format." },
        { status: 400 }
      );
    }
    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error: Unable to patch project",
      },
      { status: 500 }
    );
  }
}

// --- DELETE ---
export async function DELETE(req, { params }) {
  // 1. Verify Token
  const decodedToken = await verifyToken(req);
  if (!decodedToken) {
    return NextResponse.json(
      { success: false, message: "Unauthorized: Invalid or missing token." },
      { status: 401 }
    );
  }
  // Optional: const userId = decodedToken.uid;

  let id;
  try {
    // 2. Process Request
    id = params.id; // Use the destructured `params` directly

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
      { status: 200 } // Or 204 No Content
    );
  } catch (error) {
    console.error(
      `API DELETE Error (ID attempted: ${id || "unknown"}):`,
      error
    );
    // Generic error handling
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error: Unable to delete project",
      },
      { status: 500 }
    );
  }
}
