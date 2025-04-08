// app/api/projects/route.js

import connectDB from "@/lib/connectDB"; // assuming your MongoDB connection helper
import { NextResponse } from "next/server";

export async function GET(req) {
  const db = await connectDB(); // connect to DB
  const collection = db.collection("projects"); // assuming collection name is 'projects'

  try {
    // Fetch all projects
    const projects = await collection.find({}).toArray();

    return new Response(JSON.stringify(projects), {
      status: 200, // Success status
    });
  } catch (error) {
    // If an error occurs, return an error message
    return new Response(
      JSON.stringify({ success: false, message: "Unable to fetch projects" }),
      {
        status: 500, // Internal server error
      }
    );
  }
}

// --- NEW POST function ---
export async function POST(req) {
  let db; // Declare db outside try block for potential finally block usage

  try {
    // 1. Parse Request Body
    // The structure comes directly from the 'projectDataToSubmit' object in your frontend
    const projectData = await req.json();
    console.log("Received project data:", projectData);

    // 2. Basic Server-Side Validation (Recommended)
    if (
      !projectData ||
      !projectData.title ||
      !projectData.category ||
      !projectData.version
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required project fields (title, category, version).",
        },
        { status: 400 } // Bad Request
      );
    }

    // You could add more specific validation here (lengths, formats, etc.)

    // 3. Connect to Database
    db = await connectDB();
    const collection = db.collection("projects");

    // 4. Prepare data for insertion (ensure dates are Date objects if needed by schema/queries)
    const dataToInsert = {
      ...projectData,
      // Convert string dates back to Date objects if your schema expects them
      createdAt: new Date(projectData.createdAt),
      lastUpdated: new Date(projectData.lastUpdated),
      // MongoDB will automatically add the _id field
    };

    // 5. Insert Data into Collection
    const result = await collection.insertOne(dataToInsert);

    // 6. Handle Success
    if (result.insertedId) {
      // Fetch the inserted document to include the _id in the response
      const newProject = await collection.findOne({ _id: result.insertedId });
      return NextResponse.json(
        {
          success: true,
          message: "Project created successfully",
          project: newProject,
        },
        { status: 201 } // 201 Created status
      );
    } else {
      // Throw an error if insertion failed unexpectedly
      throw new Error("Project insertion failed.");
    }
  } catch (error) {
    // 7. Handle Errors
    console.error("API POST Error:", error); // Log the detailed error on the server

    // Provide a generic error message to the client
    let errorMessage = "Unable to create project";
    let statusCode = 500; // Internal Server Error

    // You could potentially check for specific error types (e.g., validation errors)
    // if (error instanceof CustomValidationError) {
    //   errorMessage = error.message;
    //   statusCode = 400; // Bad Request
    // }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: statusCode }
    );
  }
  // Note: MongoDB connection closing is typically handled by the driver or connection helper framework
}
