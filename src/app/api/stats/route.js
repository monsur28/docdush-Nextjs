// src/app/api/dashboard/stats/route.js

import { NextResponse } from "next/server";
import connectDB from "@/lib/connectDB"; // Adjust path to your connectDB file
// import { getSession } from 'next-auth/react'; // Or your auth method

export async function GET(request) {
  try {
    const db = await connectDB(); // Connect to MongoDB and get the db instance
    const projectCollection = db.collection("projects"); // Get the projects collection

    // Fetch stats concurrently
    const [totalProjects, publishedProjects, draftProjects, viewsAggregation] =
      await Promise.all([
        projectCollection.countDocuments(), // Total count
        projectCollection.countDocuments({ status: "Published" }), // Count published
        projectCollection.countDocuments({ status: "Draft" }), // Count drafts
        projectCollection
          .aggregate([
            // Calculate total views
            {
              $group: {
                _id: null, // Group all documents
                totalViews: { $sum: "$views" }, // Sum the 'views' field
              },
            },
          ])
          .toArray(), // Execute aggregation and convert to array
      ]);

    // Extract totalViews, default to 0 if no projects/views exist
    const totalViews =
      viewsAggregation.length > 0 ? viewsAggregation[0].totalViews : 0;

    const stats = {
      totalProjects,
      publishedProjects,
      draftProjects,
      totalViews,
    };

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    // Log the actual error for debugging on the server
    return NextResponse.json(
      { success: false, message: "Internal Server Error fetching stats." },
      { status: 500 }
    );
  }
}
