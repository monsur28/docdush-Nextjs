import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";
import { verifyToken } from "@/lib/verifyToken";
import connectDB from "@/lib/connectDB";

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  // Basic check for string type and length
  if (typeof id !== "string" || id.length !== 24) {
    return false;
  }
  // Regex check for hex characters
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// --- GET a single team member by ID ---
export async function GET(req, { params }) {
  // 1. Verify Token
  const decodedToken = await verifyToken(req); // Correctly await and get the result
  if (!decodedToken) {
    // verifyToken handles logging internally, just return unauthorized
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing token." },
      { status: 401 }
    );
  }

  // 2. Validate ID and Fetch Data
  try {
    const id = params.id;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid team member ID format." },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const teamMembersCollection = db.collection("team");

    const teamMember = await teamMembersCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!teamMember) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(teamMember, { status: 200 });
  } catch (error) {
    console.error("GET /api/team/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error: Failed to fetch team member." },
      { status: 500 }
    );
  }
}

// --- PUT (update) a team member ---
export async function PUT(req, { params }) {
  // 1. Verify Token
  const decodedToken = await verifyToken(req); // Correctly await and get the result
  if (!decodedToken) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing token." },
      { status: 401 }
    );
  }
  // 2. Validate ID and Process Update
  try {
    const id = params.id;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid team member ID format." },
        { status: 400 }
      );
    }

    const data = await req.json();

    // Basic validation for required fields (example)
    if (!data.name || !data.designation) {
      return NextResponse.json(
        { error: "Bad Request: Missing required fields (name, designation)." },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const teamMembersCollection = db.collection("team");

    // Prepare update data, only including fields present in request
    const updateFields = {};
    if (data.name) updateFields.name = data.name;
    if (data.designation) updateFields.designation = data.designation;
    if (data.description !== undefined)
      updateFields.description = data.description; // Allow empty string
    if (data.photoUrl !== undefined) updateFields.photoUrl = data.photoUrl; // Allow empty string or null
    updateFields.updatedAt = new Date();
    // Add updatedBy if you want to track who made the change
    // updateFields.updatedBy = userId;

    const result = await teamMembersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" } // Return the updated document
    );

    // findOneAndUpdate returns an object with a 'value' property containing the doc
    if (!result) {
      // Check if the operation found and updated the document
      console.error(`Team member with ID ${id} not found for update.`);
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(result, { status: 200 }); // Return the updated document
  } catch (error) {
    console.error("PUT /api/team/[id] error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Bad Request: Invalid JSON format." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error: Failed to update team member." },
      { status: 500 }
    );
  }
}

// --- DELETE a team member ---
export async function DELETE(req, { params }) {
  // Changed 'request' to 'req' for consistency
  // 1. Verify Token
  const decodedToken = await verifyToken(req); // Correctly await and get the result
  if (!decodedToken) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing token." },
      { status: 401 }
    );
  }

  // 2. Validate ID and Process Deletion
  try {
    const id = params.id;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: "Invalid team member ID format." },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const teamMembersCollection = db.collection("team");

    const result = await teamMembersCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Team member not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Team member deleted successfully." },
      { status: 200 } // Or 204 No Content if you prefer not sending a body
    );
  } catch (error) {
    console.error("DELETE /api/team/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error: Failed to delete team member." },
      { status: 500 }
    );
  }
}
