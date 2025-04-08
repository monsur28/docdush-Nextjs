// src/app/api/dashboard/activity/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB"; // Adjust path to your connectDB file
// import { getSession } from 'next-auth/react'; // Or your auth method

export async function GET(request) {
  // --- Authentication Check (Placeholder - Implement your actual check) ---
  // const session = await getSession({ req: request });
  // if (!session) {
  //     return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  // }
  // --- End Authentication Check ---

  // Get limit from query parameters
  const { searchParams } = new URL(request.url);
  let limit = parseInt(searchParams.get("limit"), 10);

  // Validate limit
  const DEFAULT_LIMIT = 5;
  const MAX_LIMIT = 20;
  if (isNaN(limit) || limit <= 0) {
    limit = DEFAULT_LIMIT;
  }
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  try {
    const db = await connectDB(); // Connect to MongoDB
    const projectCollection = db.collection("projects"); // Use the projects collection

    // Fetch the most recently updated projects
    // Using 'lastUpdated'. If you only want newly created, use 'createdAt'.
    // Ensure your documents consistently have a 'lastUpdated' field managed correctly.
    const recentProjects = await projectCollection
      .find() // Find all documents (or add filters like { status: 'Published' } if needed)
      .sort({ lastUpdated: -1 }) // Sort by lastUpdated date, newest first
      .limit(limit) // Apply the limit
      .toArray(); // Execute query and convert cursor to array

    // Transform project data into an 'activity' format
    const activities = recentProjects.map((project) => {
      // Determine type based on creation/update time (optional, simplified below)
      // const isRecentCreation = (new Date(project.lastUpdated).getTime() - new Date(project.createdAt).getTime()) < 60000; // e.g., within 1 minute
      // const activityType = isRecentCreation ? 'create' : 'update';
      const activityType = "update"; // Simplification: Treat all recent as 'updates'

      return {
        id: project._id.toString(), // Use project's _id
        type: activityType,
        // Adjust message formatting as desired
        message: `${
          activityType === "create" ? "Created" : "Updated"
        } project: ${project.title}`,
        timestamp: project.lastUpdated, // Use the timestamp we sorted by
        // Include minimal project info for potential linking on the frontend
        project: {
          title: project.title,
          slug: project.slug, // Assuming you have a slug field
        },
      };
    });

    return NextResponse.json({ success: true, data: activities });
  } catch (error) {
    console.error("Error fetching recent project activity:", error);
    // Log the actual error for debugging on the server
    return NextResponse.json(
      { success: false, message: "Internal Server Error fetching activity." },
      { status: 500 }
    );
  }
}
